# IntegrateAPI OS — Roadmap

> Strategic roadmap. Not a build plan. The build plan is downstream of this.

A 4-phase plan (plus Phase 0 foundations and a Phase 1.5 wrap step) sequenced for a solo founder. Distribution is treated as a first-class deliverable in every phase — it is the real bottleneck, not the code.

---

## Strategic foundations

### Positioning

> The AI integration console that keeps your code yours.

Three things are simultaneously true and must remain so:
- **Local-first.** No repo uploads. No cloud storage of code, prompts, or AI responses. Sessions vanish on close.
- **BYOK.** The user supplies their own AI provider key. We never proxy, never log, never train.
- **Plan before code.** The product generates understanding before it generates files. Code generation is a Phase 3 surface, not a Phase 1 one.

### Audience priority

In order of who we serve first:

1. Solo developers shipping integrations across multiple SaaS APIs
2. Startup founders connecting Stripe + Clerk + Supabase + Resend + a frontend
3. Security-conscious teams that cannot upload code to a third-party cloud
4. Agencies standardizing integration architecture across client projects
5. AI-assisted developers who already use GPT / Claude / Gemini and want them grounded in real registry data

We do **not** target enterprises with procurement cycles before Phase 4.

### Non-goals

These are not "not yet" — these are load-bearing constraints. Drifting from them breaks the positioning.

- No general-purpose AI coding assistant. Cursor exists. This is integration-specific.
- No repo uploads, ever.
- No storage of user prompts, code, or AI responses outside the user's machine.
- No training on user data, ever.
- No code generation before Phase 3.
- No marketplace before Phase 4.
- No user accounts before team mode (Phase 4).
- No telemetry in MVP. Opt-in anonymous usage stats are a Phase 3+ conversation, not a default.
- No Electron. The brand cannot ship a 100MB binary.

### Stack decision: Tauri 2, web-developed

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **Tauri 2** | ~3–15MB binaries, security-by-allowlist, sidecar support, Rust core, matches brand | Smaller ecosystem, native debugging slower | **Chosen** |
| Electron | Massive ecosystem, Node built-in, fastest onboarding for Node devs | 100MB+ binaries with bundled Chromium, off-brand | Rejected |
| Web / PWA only | Ships fastest, zero install friction | Can't reliably touch local filesystem, kills the "local-first" narrative | Rejected as final form |

**Implementation order:** build the engine + UI as a Next.js app on `localhost` through Phase 1, then wrap in Tauri 2 at Phase 1.5. The React app moves over unchanged; Tauri adds OS keychain access, filesystem reads for project scanning, and signed binaries. This sequencing trades a week of wrap-up effort for ~4 weeks of faster iteration during the period when the product still needs to find its shape.

---

## Phase 0 — Foundations

> Lock the brand, the stack, the registry seed, and the distribution surface. Two weeks.

### Scope

- Name and domain confirmed (`integrateapios.com`)
- Monorepo scaffolded with Turborepo: `apps/web` (Next.js landing + console), `apps/engine` (TS package, the integration intelligence engine), `packages/registry` (JSON registry + types)
- Landing page deployed using the Linear foundation from the Reli Studio system (hero → flow → feature triptych → trust panel → waitlist CTA)
- Architectural Decision Records (`docs/adr/`) committed for the four critical decisions: Tauri 2, BYOK only, no telemetry, registry-as-JSON-files
- Registry seeded with the first 4 integrations: Stripe, Clerk, Resend, Supabase (one JSON file each, validated by Zod schema)
- BYOK provider list locked: OpenAI, Anthropic, Gemini, Ollama
- Build-in-public surface live: X account, build log on the landing page, first post shipped

### Exit criteria

- Landing page live with working waitlist
- 50+ waitlist signups OR 7 consecutive days of build-in-public posts
- `pnpm build` green across the monorepo
- All four ADRs merged

### Distribution checkpoint

- Build-in-public account active
- Landing page collecting emails
- One "Show HN: building a local-first integration console" warning-shot post drafted but not shipped (saved for Phase 1.5)

---

## Phase 1 — MVP: plan-only console

> A developer types "stripe subscriptions with clerk" and gets a safe, transparent, useful plan in under 10 seconds, using their own AI key. Three to four weeks.

This is the proof point. It demonstrates the entire product thesis without touching code generation.

### Scope

- **Command palette UI** — `CommandBox`, result pane, persistent `TrustPanel`
- **Ephemeral session layer** — in-memory only, destroyed on close, zero persistence
- **AI tunnel** — OpenAI Responses API + Anthropic Messages API; Gemini and Ollama deferred to Phase 1.5
- **BYOK key entry** — for the web build, `localStorage` with a banner saying "this is a prototype, use the desktop app for keychain storage"; the production answer ships with Tauri in 1.5
- **Local registry with ≥ 10 integrations** — Stripe, Clerk, Resend, Supabase, OpenAI, Anthropic, Vercel, Next.js, Postgres, Pinecone
- **Planner output** — architecture plan, files needed, env vars, security checklist, official docs links. Always all five. Always.
- **Trust panel** — always visible, never collapsed, copy locked from the spec

### Exit criteria

- 5 different integration queries produce useful, accurate plans (manually evaluated against the official docs)
- Zero network traffic except to the user's chosen AI provider (verifiable in DevTools)
- Demo Loom under 90 seconds, watchable without sound
- 10 design partners actively using it weekly

### Distribution checkpoint

- Loom demo published
- Design partner outreach via DM / Slack / Discord (target: 10 commits to weekly use)
- One long-form post on the landing blog: "what 'local-first' actually means here"

---

## Phase 1.5 — Tauri wrap

> Take the proven web product and ship it as a downloadable desktop app. One to two weeks.

### Scope

- Tauri 2 shell wrapping the Next.js export
- OS keychain integration: macOS Keychain, Windows Credential Manager, Linux Secret Service (Tauri's `keyring` plugin or equivalent)
- Code-signed builds for macOS (Apple Developer ID, $99/year) and Windows (EV cert deferred to Phase 2 if budget tight; ship unsigned with documented SmartScreen workaround in the meantime)
- Auto-update channel via Tauri's updater + GitHub Releases
- Gemini and Ollama provider support added (now that no browser CORS concerns exist)
- Landing page CTA changes from "join waitlist" to "download for macOS / Windows / Linux"

### Exit criteria

- Signed builds for all three platforms (Windows may be unsigned at launch with workaround docs)
- Binary < 20MB
- Auto-update tested end-to-end
- Download page live with checksums published

### Distribution checkpoint

- **Product Hunt launch.** A downloadable binary makes the launch credible — this is the moment to ship the Show HN post too.
- 3 long-form posts queued: "Why local-first integration", "What we don't store", "BYOK vs trust me bro"

---

## Phase 2 — Local intelligence

> The console understands the user's actual project without uploading anything. Six weeks.

This is where the moat opens. Generic AI chat cannot do this. A cloud product would have to upload your repo. We read locally, plan locally, and the result is dramatically better than anything a chat window can produce.

### Scope

- **Local project scan** — user opens a folder, scan stays local, filesystem reads only via Tauri's allowlisted fs API
- **Framework detection** — Next.js (App Router vs Pages Router), Remix, Astro, SvelteKit, Express, Hono, Rails, Django
- **Package manifest parsing** — `package.json`, `Gemfile`, `pyproject.toml`, lockfile-aware version detection
- **Env var validation** — cross-check `.env` (and `.env.local`, `.env.example`) against registry-required vars; flag missing, deprecated, or misnamed
- **Architecture detection** — monorepo vs single, route structure, where API handlers live
- **Plan output references the user's real paths** — "create `src/app/api/stripe/webhook/route.ts`" instead of "create a webhook route"

### Exit criteria

- 10 design partners say "this knows my project" unprompted
- Scan completes in < 2 seconds on a typical Next.js repo (~500 files)
- Zero network traffic during scan, verifiable with mitmproxy / Little Snitch
- Five framework detectors pass test fixtures

### Distribution checkpoint

- "How it scans without uploading" technical post — the trust narrative made concrete
- Open the design partner channel publicly (Discord or similar)
- First conference / podcast outreach: target one mid-tier developer podcast for a Phase 3 appearance

---

## Phase 3 — Safe code surface

> When the user wants code, they get reviewable diffs, not blind file dumps. Eight weeks.

This is where the product earns the right to "build" in the flow. Until now it has only "understood" and "structured." Phase 3 adds the "build" surface — but with transparency as the load-bearing constraint, not an afterthought.

### Scope

- **Diff preview UI** — Monaco editor, side-by-side, per-file
- **Per-file confirmation** — every file write requires an explicit click; no batch "apply all" before Phase 4
- **Scoped writes only** — patch primitive writes only inside the opened project folder, never outside, never to system paths, no shell execution from AI output
- **"Why this code?" inline annotations** — the planner explains each non-trivial chunk inline
- **Rollback / undo** — every applied change writes a reversible patch to a local `.integrateapi/undo/` directory (gitignored)
- **Full transparency mode** — every AI request and response viewable in a session log (in-memory, exportable to file if the user chooses, never sent anywhere)
- **Monetization surface launched** — Stripe billing (eat your own dog food), Pro tier introduces priority registry updates and team-shared registry overrides

### Exit criteria

- 20 design partners ship at least one real integration via the app
- Zero "the AI changed something I didn't see" reports across the cohort
- First 100 paying users on Stripe
- Pricing page live with three tiers (Free, Pro, Team) — Team tier is a waitlist, not yet shippable

### Distribution checkpoint

- Public launch post on every channel
- Conference talk submission: "How we built a console that doesn't trust itself" — target a Linear-style craft conference (Reactathon, CityJS, JSConf)
- First paid acquisition experiment (if and only if organic CAC is unclear)

---

## Phase 4 — Platform expansion

> Deepen the moat. Each milestone is its own sub-phase with its own exit criteria; do not start the next one until the previous one is loved. Ongoing.

### Scope (sequenced, not parallel)

1. **Local LLM support via Ollama.** No key required. Privacy story becomes airtight. Performance trade-off accepted; the user makes the call.
2. **MCP server support.** Consume MCP tools from the registry. Expose IntegrateAPI as an MCP server so Cursor, Claude Desktop, and other clients can call the planner directly.
3. **Team mode.** Shared registry overrides via signed local files synced over the user's own git remote — not a cloud account, not a SaaS backend. Trust model unchanged.
4. **Integration packs marketplace.** Community-contributed registry entries, signed and reviewable. Free-tier consumers, Pro-tier publishers. This is the first time we touch a public listing surface.

### Exit criteria per milestone

Each milestone exits when it has ≥ 50 active users and a public artifact (blog post, demo, talk) documenting the design. Do not move on until both are true.

### Distribution checkpoint

- Developer conference talk delivered
- Long-running build log compiled into a "how we built this" article series (5+ posts)
- First sponsorship / community partnership conversation (e.g., a hosted-AI provider that wants to be a default option)

---

## Strategic decision log

Open questions to resolve as they become urgent. Each decision goes into `docs/adr/` once made.

| Decision | Open question | When it becomes urgent |
|---|---|---|
| Pricing tiers | Free with no cap? Pro at $20/mo? Team at $20/seat? | Phase 3 monetization launch |
| Open vs closed source | Registry should likely be open (community packs). Engine private? | Phase 2 — before scan logic is locked |
| Code signing for Windows | $300/year EV cert vs shipping unsigned with SmartScreen workaround | Phase 1.5 — Windows download readiness |
| Telemetry | Default off forever, or opt-in anonymous usage stats for the planner quality loop? | Phase 3 — when planner improvements need real-world feedback |
| Hosting | Vercel for landing is fine. Do we ever need a backend? Only for team mode (Phase 4) git sync brokering | Phase 4 — team mode scope |
| AI provider defaults | Which provider is recommended in the empty state? | Phase 1 — first install copy |
| Registry contribution model | Pull requests on GitHub, or in-app submission? | Phase 4 — marketplace launch |

---

## Anti-roadmap

Things that look like good ideas but would break the system. Document so future-me does not relitigate.

- A hosted "free tier" with our keys — kills BYOK trust positioning.
- A VS Code or Cursor extension before the desktop app finds its shape — splits the product surface before it has identity.
- A "ChatGPT plugin" — wrong abstraction; we are not a chatbot.
- A general-purpose code generator that competes with Cursor — different product, different DNA.
- A "Connect 100+ services in one click" pitch — implies cloud orchestration we do not do.
- Multi-tenant SaaS — adds a backend and an attack surface for zero product value before Phase 4.

---

## Cadence

- Build-in-public cadence: 2–3 posts per week minimum across phases
- Design partner sync: weekly during Phases 1–3, biweekly thereafter
- Roadmap review: this document gets reread at the start of every phase. Drift gets caught here, not in code review.
