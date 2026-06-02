# @integrateapi/engine

The local integration intelligence engine.

This package is **source-only** — no compile step, no emitted artifacts. It is consumed directly by `apps/web` (and later the Tauri shell) via the pnpm workspace link.

## What lives here

- `session.ts` — ephemeral, in-memory session primitive. No persistence, ever.
- `ai.ts` — provider-agnostic AI request contract. Adapters land in Phase 1.
- `planner.ts` — combines the registry with the AI tunnel to produce an `IntegrationPlan`.

## What does not live here

- Provider adapters (OpenAI, Anthropic, Gemini, Ollama) — Phase 1.
- Project scanner — Phase 2.
- Diff / file-write primitives — Phase 3.
- Anything that reads from or writes to the network outside the user's chosen AI provider.

The engine is allowed to read the user's project filesystem (Phase 2+) and call exactly one network endpoint: the AI provider URL configured by the user. Nothing else.
