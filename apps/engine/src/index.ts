/*
 * Public surface of @integrateapi/engine.
 *
 * Re-exports the things downstream consumers (apps/web, apps/desktop,
 * future scripts) actually need. Internal helpers (parser, workflow-
 * builder, individual provider classes) are exported via subpaths.
 */

export { plan, parsePrompt, buildWorkflowPlan } from "./planner";
export type { PlanInput } from "./planner";

export {
  WorkflowPlan,
  WorkflowTrigger,
  WorkflowAction,
  AuthRequirement,
} from "./types";
export type {
  Provider,
  TriggerDef,
  ActionDef,
  AuthDef,
  AIProvider,
} from "./types";

export {
  OpenAIProvider,
  AnthropicProvider,
  MockProvider,
} from "./providers";

export {
  getProviders,
  findProvider,
  matchProvidersInPrompt,
} from "./registry/load";
