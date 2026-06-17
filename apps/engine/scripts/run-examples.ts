#!/usr/bin/env tsx
/*
 * Live planner examples.
 *
 * Runs the 5 canonical demo scenarios against a real AI provider and
 * prints each WorkflowPlan as pretty JSON.
 *
 * Usage:
 *   # OpenAI (default)
 *   OPENAI_API_KEY=sk-... pnpm --filter @integrateapi/engine examples
 *
 *   # Anthropic
 *   ANTHROPIC_API_KEY=sk-ant-... AI_PROVIDER=anthropic pnpm ... examples
 *
 *   # Or pick a specific scenario by name:
 *   ... pnpm --filter @integrateapi/engine examples stripe-hubspot-slack
 *
 * Why this isn't a test:
 *   - Real API calls cost money and need keys; not appropriate for CI.
 *   - The output is judged by reading, not assertions — for tuning the
 *     prompt and seeing what each provider produces given the same input.
 */

import { plan, OpenAIProvider, AnthropicProvider, type AIProvider } from "../src";

const SCENARIOS: Array<{ name: string; prompt: string }> = [
  {
    name: "stripe-hubspot-slack",
    prompt:
      "When a Stripe customer is created, create a contact in HubSpot and send a Slack notification.",
  },
  {
    name: "shopify-klaviyo",
    prompt:
      "When a Shopify order is created, add the customer to a Klaviyo list and trigger a welcome flow.",
  },
  {
    name: "github-slack",
    prompt:
      "When a pull request is opened in GitHub, send a message to the Slack #eng channel.",
  },
  {
    name: "notion-discord",
    prompt:
      "When a row is added to a Notion database, post a message in Discord with the new row's properties.",
  },
  {
    name: "airtable-openai",
    prompt:
      "When a new record is created in Airtable, run an OpenAI chat completion to summarize the record's fields back into the record.",
  },
];

function selectProvider(): AIProvider {
  const choice = (process.env.AI_PROVIDER ?? "openai").toLowerCase();
  if (choice === "anthropic") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY env var is required for AI_PROVIDER=anthropic");
    }
    return new AnthropicProvider({ apiKey });
  }
  if (choice === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY env var is required (or set AI_PROVIDER=anthropic)");
    }
    return new OpenAIProvider({ apiKey });
  }
  throw new Error(`Unknown AI_PROVIDER: ${choice} (expected "openai" or "anthropic")`);
}

async function main() {
  const ai = selectProvider();
  const filter = process.argv[2];

  const toRun = filter
    ? SCENARIOS.filter((s) => s.name === filter)
    : SCENARIOS;
  if (toRun.length === 0) {
    console.error(`No scenarios match "${filter}".`);
    console.error(`Available: ${SCENARIOS.map((s) => s.name).join(", ")}`);
    process.exit(1);
  }

  console.log(`Running ${toRun.length} scenario(s) via ${ai.name} (${ai.model}):\n`);

  for (const scenario of toRun) {
    console.log(`── ${scenario.name} ─────────────────────────────────────`);
    console.log(`prompt: ${scenario.prompt}\n`);
    const t0 = Date.now();
    try {
      const result = await plan({ prompt: scenario.prompt, ai });
      const ms = Date.now() - t0;
      console.log(`✓ plan generated in ${ms}ms\n`);
      console.log(JSON.stringify(result, null, 2));
    } catch (err) {
      const ms = Date.now() - t0;
      console.log(`✗ failed in ${ms}ms`);
      console.error(err instanceof Error ? err.message : err);
    }
    console.log("\n");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
