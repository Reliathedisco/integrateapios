import { z } from "zod";

/*
 * Registry schema.
 *
 * Two layers of structure intentionally separated:
 *
 *  1. "Integration metadata" — docs links, security checklists, env vars,
 *     SDK names, pairings. Used by the marketing site and the human-readable
 *     plan output.
 *
 *  2. "Provider vocabulary" — the structured triggers, actions, and auth
 *     methods the planner needs to reason about workflows.
 *
 * Both live on the same Integration entry so we have one source of truth
 * per service. The vocabulary fields (triggers/actions/auth) are optional
 * so older entries don't have to be backfilled all at once — the planner
 * just won't be able to compose workflows for providers that haven't been
 * upgraded yet.
 */

export const IntegrationCategory = z.enum([
  "auth",
  "billing",
  "payments",
  "subscriptions",
  "email",
  "database",
  "vector",
  "storage",
  "hosting",
  "ai",
  "framework",
  "monitoring",
  "crm",
  "messaging",
  "ecommerce",
  "marketing",
  "developer-tools",
  "productivity",
  "automation",
]);

export const IntegrationPattern = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});

/**
 * AuthDef — how a provider authenticates.
 *
 * Kept as a flat enum + free-form description so the planner can name the
 * mechanism without us locking in a specific OAuth flow shape this early.
 * Phase 2 can add structured `oauth_scopes`, `endpoints`, etc.
 */
export const AuthDef = z.object({
  id: z.string(), // e.g. "stripe_api_key", "hubspot_oauth"
  type: z.enum([
    "api_key",
    "oauth",
    "webhook_secret",
    "service_role",
    "bearer_token",
    "basic_auth",
  ]),
  description: z.string(),
  envHint: z.string().optional(), // e.g. "STRIPE_SECRET_KEY"
});

/**
 * TriggerDef — an event the provider can emit that starts a workflow.
 *
 * `event` is the canonical key the planner will emit in plans (e.g.
 * "customer.created"). `name` is the human-readable label. We keep both
 * so the planner's prompt context reads naturally for the LLM while the
 * machine-readable output stays stable for downstream consumers.
 */
export const TriggerDef = z.object({
  id: z.string(), // matches the planner's output `event` field
  name: z.string(),
  description: z.string(),
  // Some providers (Stripe, Shopify) use webhooks; some poll. Useful hint
  // for Phase 3's executor but already worth recording now.
  delivery: z.enum(["webhook", "poll", "stream"]).optional(),
});

/**
 * ActionDef — something a workflow step can do via this provider.
 */
export const ActionDef = z.object({
  id: z.string(), // matches the planner's output `action` field
  name: z.string(),
  description: z.string(),
  // What inputs the action conceptually needs. The planner uses these as
  // hints for warnings ("you didn't specify a recipient"). Not enforced
  // in Phase 1.
  inputsHint: z.array(z.string()).optional(),
});

export const IntegrationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  tagline: z.string().min(1),
  categories: z.array(IntegrationCategory).min(1),
  docs: z.array(z.string().url()).min(1),
  env: z.array(z.string()).min(0),
  security: z.array(z.string()).min(1),
  patterns: z.array(IntegrationPattern).min(1),
  sdk: z
    .object({
      npm: z.string().optional(),
      ruby: z.string().optional(),
      python: z.string().optional(),
    })
    .partial()
    .optional(),
  pairings: z.array(z.string()).optional(),

  // Phase 1 additions — provider vocabulary for the planner.
  // Optional so legacy entries still parse; entries that have these
  // fields populated become "first-class" for workflow composition.
  triggers: z.array(TriggerDef).optional(),
  actions: z.array(ActionDef).optional(),
  auth: z.array(AuthDef).optional(),
});

export type Integration = z.infer<typeof IntegrationSchema>;
export type IntegrationCategory = z.infer<typeof IntegrationCategory>;
export type IntegrationPattern = z.infer<typeof IntegrationPattern>;
export type TriggerDef = z.infer<typeof TriggerDef>;
export type ActionDef = z.infer<typeof ActionDef>;
export type AuthDef = z.infer<typeof AuthDef>;
