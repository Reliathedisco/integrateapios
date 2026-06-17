/*
 * Planner — the public API.
 *
 *   plan({ prompt, ai }) → WorkflowPlan
 *
 * Composes parser (deterministic) + workflow-builder (LLM) into a
 * single call. Callers don't need to know about either step.
 *
 * Design constraints honored:
 *   - Provider-agnostic. The caller picks the AIProvider.
 *   - No global state, no singletons. Pure function in, plan out.
 *   - Planning is not execution. The returned plan never side-effects.
 *
 * Phase 2 will likely extend the input with optional knobs:
 *   - `extraProviders: Provider[]` for ad-hoc registry additions per call
 *   - `clarify: true` for the multi-turn refinement loop
 *   - `maxAttempts: number` for retry-on-validation-failure
 */

import type { AIProvider, WorkflowPlan } from "../types";
import { parsePrompt } from "./parser";
import { buildWorkflowPlan } from "./workflow-builder";

export interface PlanInput {
  prompt: string;
  ai: AIProvider;
}

export async function plan(input: PlanInput): Promise<WorkflowPlan> {
  if (!input.prompt || typeof input.prompt !== "string") {
    throw new Error("plan: prompt is required and must be a string");
  }
  if (!input.ai) {
    throw new Error("plan: an AIProvider is required");
  }

  const parsed = parsePrompt(input.prompt);

  return buildWorkflowPlan({
    prompt: input.prompt,
    matched: parsed.matched,
    unknownMentions: parsed.unknownMentions,
    ai: input.ai,
  });
}

export { parsePrompt } from "./parser";
export { buildWorkflowPlan } from "./workflow-builder";
