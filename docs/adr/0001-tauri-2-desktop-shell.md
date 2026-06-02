# ADR 0001 — Tauri 2 as the desktop shell

- **Status:** accepted
- **Date:** 2026-06-01

## Context

IntegrateAPI OS positions itself as local-first: the user's code stays on their machine, sessions are ephemeral, and the only network call is to the user's chosen AI provider. The desktop shell choice has to reinforce that positioning, not undercut it.

Three viable options:

1. **Tauri 2** — Rust core + system webview. Small binaries, security-by-allowlist, sidecar support.
2. **Electron** — Node + bundled Chromium. Massive ecosystem, fastest onboarding.
3. **Web / PWA only** — Ships fastest, no install. Cannot reliably read the local filesystem.

## Decision

Use **Tauri 2** as the production desktop shell. Build the engine and UI as a Next.js application that runs on `localhost` through Phase 1, then wrap it in Tauri at Phase 1.5.

## Consequences

- Binaries land at ~3–15 MB instead of ~100+ MB.
- Filesystem access is limited via Tauri's allowlist — better security posture, more deliberate API surface.
- OS keychain integration is available via Tauri's plugin ecosystem on macOS, Windows, and Linux.
- Rust shows up in the dependency graph. We will not write Rust unless necessary; Tauri's TypeScript-facing IPC is sufficient for everything in Phases 1–3.
- The web-first development phase means the engine and UI are exercised against real browsers before being wrapped — easier iteration, easier demoing via Loom.

## Alternatives rejected

- **Electron** — bundling Chromium in a "local-first, lightweight, trust" product is a brand contradiction. A 100 MB+ download is the first impression and it would undercut the entire positioning.
- **Web/PWA only** — kills the strongest narrative ("nothing leaves your machine") because filesystem access in browsers is unreliable and gated. Useful as a development phase, not the final form.
