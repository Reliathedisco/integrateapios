/*
 * Workflow builder — the LLM-driven step.
 *
 * Takes:
 *   - the user's natural-language prompt
 *   - the matched providers (output of the parser)
 *   - any unknown provider mentions (output of the parser)
 *   - an AIProvider implementation
 *
 * Returns: a validated WorkflowPlan.
 *
 * The function is intentionally simple — its main job is to construct
 * the prompt context cleanly so the LLM has the smallest possible
 * surface to hallucinate against:
 *
 *   - Only matched providers' vocabularies are inlined
 *   - The model is told to use only IDs from those vocabularies
 *   - Unknown mentions are passed through as warnings the model can
 *     reference verbatim
 *
 * The schema enforcement happens twice: once via the AIProvider's
 * generateStructured call (constrains generation), then implicitly
 * via .parse() inside the adapter (catches any leaks).
 *
 * Why this design scales:
 *   - Provider vocabulary is included on-demand, never the full registry
 *   - The "what's allowed" surface for the LLM is per-call, not global
 *   - Swapping AIProvider implementations changes nothing here
 */

import type { AIProvider, Provider, WorkflowPlan as WorkflowPlanType } from "../types";
import { WorkflowPlan } from "../types";

const SYSTEM_PROMPT = `You are the integration planner for IntegrateAPI OS.
Your job: given a natural-language workflow description and a catalog of available providers,
return a structured execution plan.

Rules — follow exactly:
1. Use only provider IDs, trigger IDs, action IDs, and auth IDs from the catalog below.
2. There is exactly ONE trigger. Pick the provider mentioned first or the one whose event most clearly "starts" the workflow.
3. Actions are in execution order — first one runs first.
4. List every required auth method across all providers in the plan in the auth array. Do not duplicate the same auth id.
5. If the user mentions a provider that is NOT in the catalog, add a warning like "Provider X mentioned but not in registry yet".
6. If the prompt is ambiguous about which event or action to use, pick the most common one and add a recommendation explaining the choice.
7. notes on each action is optional — set null when there's nothing to add.
8. Always return at least one app and exactly one trigger. If you cannot determine these from the prompt, add a warning explaining why and pick the closest match anyway.
9. Do not invent triggers/actions that are not in the catalog. If something the user asked for isn't available, add a warning.
10. Recommendations should be actionable security/reliability tips relevant to the chosen providers (rate limiting, signature verification, retry policies).`;

function formatProviderContext(p: Provider): string {
  const triggers = p.triggers
    .map((t) => `    - ${t.id}: ${t.name} — ${t.description}`)
    .join("\n");
  const actions = p.actions
    .map((a) => `    - ${a.id}: ${a.name} — ${a.description}`)
    .join("\n");
  const auth = p.auth
    .map((a) => `    - ${a.id} (${a.type}): ${a.description}`)
    .join("\n");

  return `${p.name} (id: "${p.id}")
  triggers:
${triggers || "    (none)"}
  actions:
${actions || "    (none)"}
  auth methods:
${auth || "    (none)"}`;
}

export interface BuildWorkflowInput {
  prompt: string;
  matched: Provider[];
  unknownMentions: string[];
  ai: AIProvider;
}

export async function buildWorkflowPlan(
  input: BuildWorkflowInput
): Promise<WorkflowPlanType> {
  const { prompt, matched, unknownMentions, ai } = input;

  // Edge case: no providers matched. We still want a useful response —
  // ask the LLM to surface this as a warning rather than throwing.
  // The LLM's schema-constrained output guarantees we get back something
  // shaped like a WorkflowPlan, even if the apps array is empty-ish.
  const catalog = matched.length
    ? matched.map(formatProviderContext).join("\n\n")
    : "(no providers from the registry matched this prompt)";

  const userPrompt = [
    `User workflow request:`,
    `"""`,
    prompt,
    `"""`,
    ``,
    `Available providers (catalog):`,
    catalog,
    ``,
    unknownMentions.length
      ? `Note: the user mentioned these names that are NOT in the catalog. ` +
        `Add a warning for each: ${unknownMentions.join(", ")}`
      : `Note: every provider the user mentioned appears in the catalog.`,
    ``,
    `Return a WorkflowPlan. Set the "prompt" field to the original user request verbatim.`,
  ].join("\n");

  const plan = await ai.generateStructured<WorkflowPlanType>({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    schema: WorkflowPlan,
    schemaName: "WorkflowPlan",
    schemaDescription:
      "A structured execution plan describing the trigger, actions, auth requirements, " +
      "warnings, and recommendations for an integration workflow.",
  });

  // Post-process: if the model didn't quote the user's prompt back verbatim,
  // overwrite it. Cheaper than asking the model to copy a string.
  return { ...plan, prompt };
}
