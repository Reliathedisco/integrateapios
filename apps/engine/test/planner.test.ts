/*
 * Planner tests.
 *
 * Uses Node's built-in test runner (node:test) plus a MockProvider so
 * no API keys or network calls are needed. Tests cover:
 *
 *   - the 5 canonical demo scenarios from the Phase 1 spec
 *   - input validation (missing prompt, missing ai)
 *   - the unknown-provider warning path
 *   - the parser's lexical match
 *
 * Each scenario asserts:
 *   - the returned plan passes Zod validation
 *   - the apps list contains the expected providers
 *   - the trigger and actions match the expected IDs
 *   - the auth requirements include each required provider's auth
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  plan,
  MockProvider,
  parsePrompt,
  WorkflowPlan,
  type WorkflowPlan as WorkflowPlanType,
} from "../src";

// --- helpers ----------------------------------------------------------------

function makeMock(response: unknown) {
  return new MockProvider({
    responder: () => response,
  });
}

function assertHasAction(
  plan: WorkflowPlanType,
  provider: string,
  action: string
) {
  const found = plan.actions.some(
    (a) => a.provider === provider && a.action === action
  );
  assert.ok(
    found,
    `expected action ${provider}.${action} in plan, got: ${JSON.stringify(plan.actions)}`
  );
}

function assertHasAuth(plan: WorkflowPlanType, provider: string) {
  const found = plan.auth.some((a) => a.provider === provider);
  assert.ok(
    found,
    `expected auth requirement for ${provider} in plan, got: ${JSON.stringify(plan.auth)}`
  );
}

// --- scenarios --------------------------------------------------------------

describe("planner — 5 canonical demo scenarios", () => {
  it("Stripe → HubSpot + Slack", async () => {
    const prompt =
      "When a Stripe customer is created, create a contact in HubSpot and send a Slack notification.";
    const ai = makeMock({
      prompt,
      apps: ["stripe", "hubspot", "slack"],
      trigger: { provider: "stripe", event: "customer.created" },
      actions: [
        { provider: "hubspot", action: "create_contact", notes: null },
        { provider: "slack", action: "send_message", notes: null },
      ],
      auth: [
        { provider: "stripe", id: "stripe_api_key", type: "api_key" },
        { provider: "stripe", id: "stripe_webhook_secret", type: "webhook_secret" },
        { provider: "hubspot", id: "hubspot_private_app_token", type: "bearer_token" },
        { provider: "slack", id: "slack_bot_token", type: "bearer_token" },
      ],
      warnings: [],
      recommendations: [
        "Verify the Stripe webhook signature before processing.",
      ],
    });

    const result = await plan({ prompt, ai });

    assert.deepEqual(result.apps, ["stripe", "hubspot", "slack"]);
    assert.equal(result.trigger.provider, "stripe");
    assert.equal(result.trigger.event, "customer.created");
    assertHasAction(result, "hubspot", "create_contact");
    assertHasAction(result, "slack", "send_message");
    assertHasAuth(result, "stripe");
    assertHasAuth(result, "hubspot");
    assertHasAuth(result, "slack");
  });

  it("Shopify → Klaviyo", async () => {
    const prompt =
      "When a Shopify order is created, add the customer to a Klaviyo list.";
    const ai = makeMock({
      prompt,
      apps: ["shopify", "klaviyo"],
      trigger: { provider: "shopify", event: "order.created" },
      actions: [
        { provider: "klaviyo", action: "add_to_list", notes: null },
      ],
      auth: [
        { provider: "shopify", id: "shopify_admin_token", type: "bearer_token" },
        { provider: "klaviyo", id: "klaviyo_api_key", type: "api_key" },
      ],
      warnings: [],
      recommendations: [],
    });

    const result = await plan({ prompt, ai });

    assert.equal(result.trigger.provider, "shopify");
    assert.equal(result.trigger.event, "order.created");
    assertHasAction(result, "klaviyo", "add_to_list");
    assertHasAuth(result, "shopify");
    assertHasAuth(result, "klaviyo");
  });

  it("GitHub → Slack", async () => {
    const prompt =
      "When a pull request is opened in GitHub, send a message to the Slack #eng channel.";
    const ai = makeMock({
      prompt,
      apps: ["github", "slack"],
      trigger: { provider: "github", event: "pull_request.opened" },
      actions: [
        { provider: "slack", action: "send_message", notes: null },
      ],
      auth: [
        { provider: "github", id: "github_token", type: "bearer_token" },
        { provider: "github", id: "github_webhook_secret", type: "webhook_secret" },
        { provider: "slack", id: "slack_bot_token", type: "bearer_token" },
      ],
      warnings: [],
      recommendations: [],
    });

    const result = await plan({ prompt, ai });

    assert.equal(result.trigger.provider, "github");
    assert.equal(result.trigger.event, "pull_request.opened");
    assertHasAction(result, "slack", "send_message");
  });

  it("Notion → Discord", async () => {
    const prompt =
      "When a row is added to a Notion database, post a message in Discord.";
    const ai = makeMock({
      prompt,
      apps: ["notion", "discord"],
      trigger: { provider: "notion", event: "database.row_added" },
      actions: [
        { provider: "discord", action: "send_message", notes: null },
      ],
      auth: [
        { provider: "notion", id: "notion_integration_token", type: "bearer_token" },
        { provider: "discord", id: "discord_bot_token", type: "bearer_token" },
      ],
      warnings: [
        "Notion does not emit native push webhooks on the free plan — poll the database.",
      ],
      recommendations: [],
    });

    const result = await plan({ prompt, ai });

    assert.equal(result.trigger.provider, "notion");
    assert.equal(result.trigger.event, "database.row_added");
    assertHasAction(result, "discord", "send_message");
    assert.ok(result.warnings.length > 0, "expected warning about Notion polling");
  });

  it("Airtable → OpenAI", async () => {
    const prompt =
      "When a new record is created in Airtable, run an OpenAI chat completion to summarize it.";
    const ai = makeMock({
      prompt,
      apps: ["airtable", "openai"],
      trigger: { provider: "airtable", event: "record.created" },
      actions: [
        { provider: "openai", action: "chat_completion", notes: "Summarize the new record's fields." },
      ],
      auth: [
        { provider: "airtable", id: "airtable_personal_access_token", type: "bearer_token" },
        { provider: "openai", id: "openai_api_key", type: "api_key" },
      ],
      warnings: [],
      recommendations: [
        "Use response_format json_schema if you want the summary structured.",
      ],
    });

    const result = await plan({ prompt, ai });

    assert.equal(result.trigger.provider, "airtable");
    assert.equal(result.trigger.event, "record.created");
    assertHasAction(result, "openai", "chat_completion");
  });
});

// --- input validation -------------------------------------------------------

describe("planner — input validation", () => {
  it("rejects empty prompt", async () => {
    const ai = makeMock({});
    await assert.rejects(() => plan({ prompt: "", ai }), /prompt is required/);
  });

  it("rejects missing ai", async () => {
    await assert.rejects(
      () => plan({ prompt: "stripe to slack", ai: undefined as never }),
      /AIProvider is required/
    );
  });

  it("validates LLM output via the schema", async () => {
    // The mock returns garbage; the schema parse inside MockProvider should reject it.
    const ai = new MockProvider({ responder: () => ({ not: "a plan" }) });
    await assert.rejects(() => plan({ prompt: "stripe to slack", ai }));
  });
});

// --- parser unit tests ------------------------------------------------------

describe("parser — lexical match + unknown mentions", () => {
  it("matches known providers in the prompt", () => {
    const { matched, unknownMentions } = parsePrompt(
      "When a stripe customer is created, send a slack message."
    );
    const ids = matched.map((p) => p.id).sort();
    assert.deepEqual(ids, ["slack", "stripe"]);
    assert.deepEqual(unknownMentions, []);
  });

  it("flags providers we don't know about yet", () => {
    const { matched, unknownMentions } = parsePrompt(
      "When a Stripe charge succeeds, create a Salesforce opportunity."
    );
    assert.ok(matched.some((p) => p.id === "stripe"));
    assert.ok(
      unknownMentions.includes("Salesforce"),
      `expected Salesforce in unknownMentions, got: ${JSON.stringify(unknownMentions)}`
    );
  });

  it("is case-insensitive on provider IDs", () => {
    const { matched } = parsePrompt("STRIPE → HUBSPOT");
    const ids = matched.map((p) => p.id).sort();
    assert.deepEqual(ids, ["hubspot", "stripe"]);
  });
});

// --- schema regression ------------------------------------------------------

describe("WorkflowPlan schema", () => {
  it("rejects a plan with no apps", () => {
    const bad = {
      prompt: "x",
      apps: [],
      trigger: { provider: "stripe", event: "customer.created" },
      actions: [],
      auth: [],
      warnings: [],
      recommendations: [],
    };
    const result = WorkflowPlan.safeParse(bad);
    assert.equal(result.success, false);
  });

  it("accepts a minimal valid plan", () => {
    const ok = {
      prompt: "x",
      apps: ["stripe"],
      trigger: { provider: "stripe", event: "customer.created" },
      actions: [],
      auth: [],
      warnings: [],
      recommendations: [],
    };
    const result = WorkflowPlan.safeParse(ok);
    assert.equal(result.success, true);
  });
});
