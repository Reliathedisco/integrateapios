/*
 * Anthropic adapter.
 *
 * Anthropic's path to constrained JSON is tool use — you declare a
 * single tool whose input_schema is the target structure, then force
 * the model to call it via `tool_choice: { type: "tool", name: "..." }`.
 * The "response" is the tool's input arguments.
 *
 * This shape is equivalent in spirit to OpenAI's json_schema response
 * format — same JSON Schema goes in, structured object comes back.
 *
 * Why this design:
 *   - Same `AIProvider` interface as OpenAI; swap is one line at the
 *     call site.
 *   - Tool use is Anthropic's most reliable structured-output path
 *     (more so than asking the model to "respond in JSON").
 *   - No SDK — fetch + JSON. Anthropic's request shape is stable.
 *
 * Future expansion (Phase 2+):
 *   - Streaming for low-latency UI
 *   - Multi-turn refinement (model asks clarifying questions before
 *     emitting the final plan)
 */

import { zodToJsonSchema } from "zod-to-json-schema";
import type { AIProvider } from "../types";

// Safe in browsers — `process` may be undefined when bundled for the client.
function safeEnv(key: string): string | undefined {
  if (typeof process === "undefined" || !process.env) return undefined;
  return process.env[key];
}

const DEFAULT_BASE_URL = "https://api.anthropic.com/v1";
const ANTHROPIC_VERSION = "2023-06-01";

export interface AnthropicProviderOptions {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
  /**
   * Anthropic requires this header to be set on requests originating from
   * a browser. The header name itself is the warning — keys in browser
   * code are visible to anyone with DevTools. Only set true on integrations
   * where the user explicitly provides their own key (BYOK demos).
   */
  dangerousDirectBrowserAccess?: boolean;
}

export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";
  readonly model: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly temperature: number;
  private readonly maxTokens: number;
  private readonly dangerousDirectBrowserAccess: boolean;

  constructor(opts: AnthropicProviderOptions) {
    if (!opts.apiKey) throw new Error("AnthropicProvider: apiKey is required");
    this.apiKey = opts.apiKey;
    this.model =
      opts.model ?? safeEnv("ANTHROPIC_MODEL") ?? "claude-3-5-sonnet-latest";
    this.baseUrl = opts.baseUrl ?? DEFAULT_BASE_URL;
    this.temperature = opts.temperature ?? 0.2;
    this.maxTokens = opts.maxTokens ?? 4096;
    this.dangerousDirectBrowserAccess =
      opts.dangerousDirectBrowserAccess ?? false;
  }

  async generateStructured<T>(input: {
    systemPrompt: string;
    userPrompt: string;
    schema: import("zod").ZodType<T>;
    schemaName: string;
    schemaDescription: string;
  }): Promise<T> {
    const inputSchema = zodToJsonSchema(input.schema, {
      $refStrategy: "none",
      target: "openApi3",
    });

    const headers: Record<string, string> = {
      "x-api-key": this.apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
      "Content-Type": "application/json",
    };
    if (this.dangerousDirectBrowserAccess) {
      headers["anthropic-dangerous-direct-browser-access"] = "true";
    }

    const res = await fetch(`${this.baseUrl}/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: input.systemPrompt,
        tools: [
          {
            name: input.schemaName,
            description: input.schemaDescription,
            input_schema: inputSchema,
          },
        ],
        tool_choice: { type: "tool", name: input.schemaName },
        messages: [{ role: "user", content: input.userPrompt }],
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(
        `Anthropic request failed: ${res.status} ${detail.slice(0, 400)}`
      );
    }

    const data = (await res.json()) as {
      content?: Array<{
        type: string;
        name?: string;
        input?: unknown;
      }>;
      stop_reason?: string;
    };

    const toolUse = data.content?.find(
      (b) => b.type === "tool_use" && b.name === input.schemaName
    );
    if (!toolUse || !toolUse.input) {
      throw new Error(
        `Anthropic did not invoke the expected tool (stop_reason: ${data.stop_reason})`
      );
    }

    return input.schema.parse(toolUse.input);
  }
}
