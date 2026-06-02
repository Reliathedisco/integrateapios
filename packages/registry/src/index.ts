import stripe from "../integrations/stripe.json";
import clerk from "../integrations/clerk.json";
import resend from "../integrations/resend.json";
import supabase from "../integrations/supabase.json";

import { IntegrationSchema, type Integration } from "./schema";

export {
  IntegrationSchema,
  IntegrationCategory,
  IntegrationPattern,
  type Integration,
} from "./schema";

const raw = [stripe, clerk, resend, supabase];

export const integrations: readonly Integration[] = Object.freeze(
  raw.map((entry) => IntegrationSchema.parse(entry))
);

export function findIntegration(id: string): Integration | undefined {
  return integrations.find((i) => i.id === id);
}

export function matchIntegrationsInPrompt(prompt: string): Integration[] {
  const lower = prompt.toLowerCase();
  return integrations.filter((i) => lower.includes(i.id));
}
