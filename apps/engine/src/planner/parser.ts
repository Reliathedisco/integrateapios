/*
 * Parser — the deterministic pre-LLM step.
 *
 * Two jobs:
 *
 *   1. Match providers in the prompt (cheap lexical retrieval today,
 *      semantic retrieval in Phase 2).
 *   2. Surface providers the prompt LIKELY mentions but the registry
 *      doesn't know about yet — these become `unknownMentions` and
 *      the LLM gets told to add a warning for each.
 *
 * Why split this out from the LLM call:
 *   - Deterministic. Same prompt → same candidate set. Easier to test.
 *   - Bounds the LLM context. The model only sees vocabulary for
 *     providers we already have data on.
 *   - Cheap. No network call to pick candidates.
 *
 * Phase 2 will likely add:
 *   - Embedding-based retrieval (replace `lexicalMatch` with a
 *     vector search, same interface).
 *   - A larger "common provider names" list for `unknownMentions`
 *     (Salesforce, Linear, Zendesk, etc.) so warnings are richer.
 */

import { matchProvidersInPrompt } from "../registry/load";
import type { Provider } from "../types";

/**
 * Common provider names that show up in workflow prompts but might
 * not be in our registry yet. Used for the "you mentioned X but we
 * don't know about it" warning path.
 *
 * Lower-case keyword → display name.
 */
const KNOWN_PROVIDER_KEYWORDS = new Map<string, string>([
  ["salesforce", "Salesforce"],
  ["zendesk", "Zendesk"],
  ["intercom", "Intercom"],
  ["linear", "Linear"],
  ["jira", "Jira"],
  ["asana", "Asana"],
  ["trello", "Trello"],
  ["mailchimp", "Mailchimp"],
  ["sendgrid", "SendGrid"],
  ["twilio", "Twilio"],
  ["zapier", "Zapier"],
  ["make.com", "Make"],
  ["pipedrive", "Pipedrive"],
  ["close.com", "Close"],
  ["pipedream", "Pipedream"],
  ["segment", "Segment"],
  ["mixpanel", "Mixpanel"],
  ["amplitude", "Amplitude"],
  ["paypal", "PayPal"],
  ["square", "Square"],
  ["woocommerce", "WooCommerce"],
  ["magento", "Magento"],
  ["webflow", "Webflow"],
  ["framer", "Framer"],
  ["vercel", "Vercel"],
  ["aws", "AWS"],
  ["gcp", "Google Cloud"],
  ["dropbox", "Dropbox"],
  ["google drive", "Google Drive"],
  ["google sheets", "Google Sheets"],
  ["typeform", "Typeform"],
]);

export interface ParserResult {
  matched: Provider[];
  unknownMentions: string[];
}

export function parsePrompt(prompt: string): ParserResult {
  const matched = matchProvidersInPrompt(prompt);
  const matchedIds = new Set(matched.map((p) => p.id));
  const lower = prompt.toLowerCase();

  const unknownMentions: string[] = [];
  for (const [keyword, displayName] of KNOWN_PROVIDER_KEYWORDS) {
    if (matchedIds.has(keyword)) continue;
    if (lower.includes(keyword)) unknownMentions.push(displayName);
  }

  return { matched, unknownMentions };
}
