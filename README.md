# IntegrateAPI OS

> The local-first AI integration console for developers. Your code stays yours.

## What this is

IntegrateAPI OS is a desktop console that helps developers connect Stripe, Clerk, Resend, Supabase, OpenAI, and hundreds of other services without uploading their code or trusting a third-party cloud. You bring your own AI provider key. We do not store conversations, repos, prompts, or integration history.

Think Cursor for integrations — local-first and built around trust.

## The flow

Understand → Structure → Build → Launch → Improve

- **Understand.** Type what you want to connect ("stripe subscriptions with clerk"). The local engine matches your prompt against a curated integration registry.
- **Structure.** Your chosen AI provider returns a transparent plan: architecture, files needed, env vars, security checklist, official docs.
- **Build.** Optional. Review diffs locally, approve per-file, apply changes only to your project folder.
- **Launch.** Ship to production with confidence — every change was reviewed, every secret stayed local.
- **Improve.** Re-scan your project anytime. The plan adapts to what you've already built.

## Stack

- **Desktop shell** — Tauri 2 (Rust core + system webview, signed binaries on macOS, Windows, Linux)
- **UI** — React, TypeScript, Tailwind, shadcn/ui, Framer Motion
- **Engine** — Node.js, TypeScript, local integration registry
- **AI layer** — OpenAI, Anthropic, Gemini, Ollama (bring your own key)
- **Storage** — none by default; optional OS keychain for API keys only

## Run locally

```bash
pnpm install
pnpm dev          # landing + console on http://localhost:3030
pnpm build        # full production build
pnpm typecheck    # typecheck across all workspace packages
```

The Tauri shell lands in Phase 1.5 — see [ROADMAP.md](./ROADMAP.md#phase-15--tauri-wrap).

## Workspace

```
apps/
  web/        Next.js 16 landing + console (Tailwind v4, shadcn-style components)
  engine/     Local integration intelligence engine (source-only TS package)
packages/
  registry/   Curated integration registry (JSON + Zod schema)
docs/
  adr/        Architectural Decision Records — load-bearing decisions
  screenshots/  Visual snapshots of the current build
```

## Deploy

- **Landing site** — Vercel (`apps/web`)
- **Desktop binaries** — GitHub Releases via Tauri's signed-update channel (Phase 1.5+)
- **No backend.** No cloud database, no auth server, no telemetry. The product runs entirely on the user's machine.

## System notes

- This project is built on the Reli Studio system: structure, restraint, depth.
- Brand foundation: Linear (system framing), Vercel (developer trust), Stripe (depth + docs).
- Distribution is the real bottleneck, not building. Every phase ships a public artifact.
- Non-goals are load-bearing — see [ROADMAP.md](./ROADMAP.md#non-goals).
