import airtable from "../integrations/airtable.json";
import clerk from "../integrations/clerk.json";
import discord from "../integrations/discord.json";
import github from "../integrations/github.json";
import hubspot from "../integrations/hubspot.json";
import klaviyo from "../integrations/klaviyo.json";
import notion from "../integrations/notion.json";
import openai from "../integrations/openai.json";
import resend from "../integrations/resend.json";
import shopify from "../integrations/shopify.json";
import slack from "../integrations/slack.json";
import stripe from "../integrations/stripe.json";
import supabase from "../integrations/supabase.json";

import { IntegrationSchema, type Integration } from "./schema";

export {
  IntegrationSchema,
  IntegrationCategory,
  IntegrationPattern,
  TriggerDef,
  ActionDef,
  AuthDef,
  type Integration,
} from "./schema";

const raw = [
  airtable,
  clerk,
  discord,
  github,
  hubspot,
  klaviyo,
  notion,
  openai,
  resend,
  shopify,
  slack,
  stripe,
  supabase,
];

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
