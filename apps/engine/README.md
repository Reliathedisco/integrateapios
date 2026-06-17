# @integrateapi/engine

The local integration intelligence engine.

Takes a natural-language workflow description and returns a structured
`WorkflowPlan` — apps, trigger, actions, auth requirements, warnings,
recommendations. Planning is fully decoupled from execution: this package
never makes a call into any of the apps it plans about. The user's chosen
AI provider is the only outbound call.

## Shape

```
apps/engine/
  src/
    types.ts                  core types + Zod schemas
    providers/
      index.ts                barrel
      openai.ts               OpenAI adapter (Chat Completions + json_schema)
      anthropic.ts            Anthropic adapter (Messages + tool use)
      mock.ts                 Mock adapter for tests / offline dev
    planner/
      index.ts                public plan({ prompt, ai }) API
      parser.ts               deterministic lexical match + unknown-mention surfacing
      workflow-builder.ts     LLM call: matched providers' vocab → WorkflowPlan
    registry/
      load.ts                 typed registry loader (Integration → Provider)
  test/
    planner.test.ts           node:test suite, all 5 demo scenarios via MockProvider
  scripts/
    run-examples.ts           live LLM run via tsx
```

## Public API

```ts
import { plan, OpenAIProvider } from "@integrateapi/engine";

const ai = new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY! });

const workflow = await plan({
  prompt: "When a Stripe customer is created, add them to HubSpot and ping Slack.",
  ai,
});
// → { apps, trigger, actions, auth, warnings, recommendations, prompt }
```

Swap `OpenAIProvider` for `AnthropicProvider` or `MockProvider` —
nothing else changes. The planner is provider-agnostic.

## Commands

```bash
pnpm --filter @integrateapi/engine typecheck   # tsc --noEmit
pnpm --filter @integrateapi/engine test        # node:test via tsx (no API key needed)
pnpm --filter @integrateapi/engine examples    # live run, needs OPENAI_API_KEY or ANTHROPIC_API_KEY
```

## Why this shape

- **Provider vocabulary lives in the registry**, not inlined in the engine.
  Adding a new integration is one JSON file in `packages/registry/integrations/`.
- **Two-stage planning** (deterministic match → LLM extraction) scales to
  thousands of providers without inflating the LLM prompt. Phase 2 swaps the
  lexical match for semantic retrieval; nothing else changes.
- **Constrained generation** (OpenAI `response_format: json_schema` + Anthropic
  tool use) means the model can't return malformed plans. Zod validation at
  the boundary is the second line of defense.
- **Planning is not execution.** A `WorkflowPlan` is a pure data structure.
  The executor (Phase 3) will consume it; the planner never imports anything
  from the execution side.

## What's deliberately not here yet

- Multi-turn clarification ("did you mean X?") — Phase 2.
- Semantic provider retrieval — Phase 2.
- Caching of generated plans — Phase 2.
- Actual execution of plans — Phase 3.
- A CLI / interactive REPL — likely Phase 1.5 when the desktop shell lands.
