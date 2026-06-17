/*
 * OpenAI adapter.
 *
 * Uses the Chat Completions API with `response_format: { type:
 * "json_schema", json_schema: {...} }` (strict mode) — the LLM is
 * forced to emit JSON conforming to our schema. This eliminates an
 * entire class of "the model wrote a sentence instead of JSON" errors.
 *
 * No SDK dependency on purpose — the request shape is small and stable
 * enough that adding the `openai` npm package would just add weight.
 * If we ever need streaming or assistants, swap to the SDK.
 *
 * Why this scales:
 *   - The adapter is stateless. Spin up as many as needed.
 *   - The JSON Schema is computed once per call from the Zod schema
 *     (via zod-to-json-schema). Cheap.
 *   - Errors are normalized into thrown Error with the upstream status
 *     code in the message — same shape across all adapters.
 */

import { zodToJsonSchema } from "zod-to-json-schema";
import type { AIProvider } from "../types";

// Safe in browsers — `process` may be undefined when bundled for the client.
function safeEnv(key: string): string | undefined {
  if (typeof process === "undefined" || !process.env) return undefined;
  return process.env[key];
}

const DEFAULT_BASE_URL = "https://api.openai.com/v1";

export interface OpenAIProviderOptions {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  /** Generation temperature. Default 0.2 — workflow planning wants stability. */
  temperature?: number;
}

export class OpenAIProvider implements AIProvider {
  readonly name = "openai";
  readonly model: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly temperature: number;

  constructor(opts: OpenAIProviderOptions) {
    if (!opts.apiKey) throw new Error("OpenAIProvider: apiKey is required");
    this.apiKey = opts.apiKey;
    this.model = opts.model ?? safeEnv("OPENAI_MODEL") ?? "gpt-4o-mini";
    this.baseUrl = opts.baseUrl ?? DEFAULT_BASE_URL;
    this.temperature = opts.temperature ?? 0.2;
  }

  async generateStructured<T>(input: {
    systemPrompt: string;
    userPrompt: string;
    schema: import("zod").ZodType<T>;
    schemaName: string;
    schemaDescription: string;
  }): Promise<T> {
    const jsonSchema = zodToJsonSchema(input.schema, {
      $refStrategy: "none", // OpenAI strict mode doesn't allow $ref
      target: "openApi3",
    });

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        temperature: this.temperature,
        messages: [
          { role: "system", content: input.systemPrompt },
          { role: "user", content: input.userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: input.schemaName,
            description: input.schemaDescription,
            strict: true,
            schema: jsonSchema,
          },
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(
        `OpenAI request failed: ${res.status} ${detail.slice(0, 400)}`
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string; refusal?: string } }>;
    };

    const choice = data.choices?.[0]?.message;
    if (choice?.refusal) {
      throw new Error(`OpenAI refused to answer: ${choice.refusal}`);
    }
    const content = choice?.content;
    if (typeof content !== "string") {
      throw new Error("OpenAI response missing content");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      throw new Error(`OpenAI returned non-JSON content: ${String(err)}`);
    }

    return input.schema.parse(parsed);
  }
}
