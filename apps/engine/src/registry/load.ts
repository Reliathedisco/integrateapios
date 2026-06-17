/*
 * Registry loader.
 *
 * Wraps packages/registry with engine-specific narrowing:
 *
 *   - `getProviders()` returns ONLY entries with triggers/actions/auth
 *     populated (i.e. ready for workflow composition). Entries that
 *     haven't been upgraded yet are filtered out — the planner shouldn't
 *     hallucinate vocabulary for them.
 *
 *   - `findProvider(id)` is a typed convenience over the registry's
 *     findIntegration, with the same filter applied.
 *
 *   - `matchProvidersInPrompt(prompt)` is the lexical pre-filter the
 *     planner uses to bound the LLM context. This is the "cheap retrieval"
 *     step that lets us scale to thousands of integrations later — swap
 *     the implementation for an embedding lookup without changing the
 *     planner's call site.
 */

import {
  integrations,
  findIntegration,
  matchIntegrationsInPrompt,
  type Integration,
} from "@integrateapi/registry";
import type { Provider } from "../types";

function isProvider(i: Integration): i is Provider {
  return (
    Array.isArray(i.triggers) &&
    Array.isArray(i.actions) &&
    Array.isArray(i.auth) &&
    i.actions.length > 0 &&
    i.auth.length > 0
  );
}

export function getProviders(): Provider[] {
  return integrations.filter(isProvider);
}

export function findProvider(id: string): Provider | undefined {
  const i = findIntegration(id);
  return i && isProvider(i) ? i : undefined;
}

/**
 * Lexical match against provider IDs in the prompt.
 *
 * Phase 1: literal substring match on the lowercased prompt.
 * Phase 2 will replace this with semantic retrieval (embed prompt,
 * compare against pre-embedded provider descriptions, return top-k).
 * The contract — `(prompt) → Provider[]` — stays identical.
 */
export function matchProvidersInPrompt(prompt: string): Provider[] {
  return matchIntegrationsInPrompt(prompt).filter(isProvider);
}
