import { matchIntegrationsInPrompt, type Integration } from "@integrateapi/registry";

export interface IntegrationPlan {
  prompt: string;
  matched: Integration[];
  architecture: string[];
  envVars: string[];
  securityChecklist: string[];
  officialDocs: string[];
  generatedAt: number;
}

export interface PlanInput {
  prompt: string;
}

export function buildBaselinePlan({ prompt }: PlanInput): IntegrationPlan {
  const matched = matchIntegrationsInPrompt(prompt);

  return {
    prompt,
    matched,
    architecture: [],
    envVars: dedupe(matched.flatMap((i) => i.env)),
    securityChecklist: matched.flatMap((i) =>
      i.security.map((line) => `${i.name}: ${line}`)
    ),
    officialDocs: matched.flatMap((i) => i.docs),
    generatedAt: Date.now(),
  };
}

function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
