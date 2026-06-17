/*
 * Core types for the Integration Intelligence Engine.
 *
 * Two parallel surfaces are intentionally exposed:
 *
 *   1. Provider / Trigger / Action / AuthRequirement — derived from the
 *      registry. These are the SHAPE OF THE WORLD the planner reasons
 *      against. Re-exported from the registry so engine consumers don't
 *      need to import packages/registry directly.
 *
 *   2. WorkflowPlan and its sub-types — the OUTPUT of the planner. A
 *      pure data structure. Phase 3's executor will consume this; the
 *      planner itself never imports anything from the execution side.
 *
 * Zod schemas live alongside the TypeScript types because the planner
 * uses them at two boundaries:
 *
 *   a) Validating the LLM response (untrusted output → typed plan)
 *   b) Generating JSON Schema for constrained LLM output (OpenAI
 *      json_schema response format, Anthropic tool input_schema)
 *
 * One source of truth, two consumers. The runtime cost of validation
 * is negligible compared to the LLM call.
 */

import { z } from "zod";
import {
  type Integration,
  type TriggerDef,
  type ActionDef,
  type AuthDef,
} from "@integrateapi/registry";

// --- Provider surface (re-exported from the registry, narrowed) ---

/**
 * A Provider is an Integration entry that has trigger/action/auth
 * vocabulary populated — i.e. it's "first-class" for workflow planning.
 *
 * Phase 1 promotes Integration → Provider via the registry loader,
 * filtering out entries that haven't been upgraded yet.
 */
export interface Provider extends Integration {
  triggers: TriggerDef[];
  actions: ActionDef[];
  auth: AuthDef[];
}

export type { TriggerDef, ActionDef, AuthDef, Integration };

// --- WorkflowPlan output ---

export const WorkflowTrigger = z.object({
  provider: z.string(),
  event: z.string(),
});
export type WorkflowTrigger = z.infer<typeof WorkflowTrigger>;

export const WorkflowAction = z.object({
  provider: z.string(),
  action: z.string(),
  /**
   * Free-form notes the LLM can attach to explain why this step matters
   * or call out conditional logic. Phase 3 may parse these into edges.
   *
   * Nullable (not optional) so the field is always present in the schema —
   * OpenAI strict `json_schema` mode requires every property to be in
   * `required`. The LLM can return `null` when there's nothing to add.
   */
  notes: z.string().nullable(),
});
export type WorkflowAction = z.infer<typeof WorkflowAction>;

export const AuthRequirement = z.object({
  provider: z.string(),
  /**
   * The AuthDef.id from the registry — e.g. "stripe_api_key",
   * "hubspot_oauth", "slack_bot_token".
   */
  id: z.string(),
  type: z.enum([
    "api_key",
    "oauth",
    "webhook_secret",
    "service_role",
    "bearer_token",
    "basic_auth",
  ]),
});
export type AuthRequirement = z.infer<typeof AuthRequirement>;

export const WorkflowPlan = z.object({
  /** Original prompt the user submitted (kept for audit + UI). */
  prompt: z.string(),

  /** All providers involved, in order they appear in the flow. */
  apps: z.array(z.string()).min(1),

  /** Exactly one trigger — the event that kicks off the workflow. */
  trigger: WorkflowTrigger,

  /** Ordered list of actions. Empty array allowed for read-only flows. */
  actions: z.array(WorkflowAction),

  /** Each unique auth method required across all apps in the plan. */
  auth: z.array(AuthRequirement),

  /**
   * Soft signals the planner emits. Examples:
   *   - "Provider X mentioned in prompt is not in the registry"
   *   - "Stripe webhook signature verification recommended"
   *   - "Klaviyo trigger flow requires the event to exist on the profile"
   */
  warnings: z.array(z.string()),

  /**
   * Concrete next steps the user could take. Less structured than auth
   * — examples: "Add a retry policy for transient HubSpot 5xx",
   * "Filter by deal stage to avoid noise".
   */
  recommendations: z.array(z.string()),
});
export type WorkflowPlan = z.infer<typeof WorkflowPlan>;

// --- AI provider contract ---

/**
 * The AIProvider interface every model adapter implements.
 *
 * generateStructured asks the model to return JSON conforming to a Zod
 * schema. The adapter is responsible for:
 *   - serializing the schema for the model (json_schema response format,
 *     tool input_schema, etc.)
 *   - making the request
 *   - parsing + Zod-validating the response
 *
 * This is intentionally smaller than the AI SDKs you've seen elsewhere
 * — Phase 1 only needs structured generation. Streaming, embeddings,
 * tool calls beyond a single submit_plan tool are out of scope.
 */
export interface AIProvider {
  /** Human-readable label, e.g. "openai", "anthropic", "mock". */
  readonly name: string;

  /** Model identifier the adapter will use, e.g. "gpt-4o-mini". */
  readonly model: string;

  generateStructured<T>(input: {
    systemPrompt: string;
    userPrompt: string;
    schema: z.ZodType<T>;
    /** Used as the json_schema name / tool name. */
    schemaName: string;
    /** Used as the json_schema description / tool description. */
    schemaDescription: string;
  }): Promise<T>;
}
