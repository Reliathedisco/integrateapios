# ADR 0002 — BYOK only, no proxied AI

- **Status:** accepted
- **Date:** 2026-06-01

## Context

Every AI-assisted developer tool faces a fork: ship with vendor-provided model access (we hold the key, we pay the bill, we proxy requests) or require the user to bring their own provider key. The choice has product, brand, and legal consequences.

## Decision

**Bring Your Own Key only.** IntegrateAPI OS will never proxy AI requests through our infrastructure, and will never ship with a vendor key embedded. Supported providers at launch: OpenAI, Anthropic, Gemini, and Ollama (local).

## Consequences

- Onboarding has friction: the user must paste a provider key before they get any value. This is the cost of the positioning.
- Pricing is decoupled from inference cost. We do not pay for AI calls; the user does, directly to their provider.
- The trust narrative becomes provable rather than promised: there is no proxy that could log prompts, so there is no risk that we are logging prompts.
- Provider outages are not our outages.
- We can support local models (Ollama) symmetrically — no special case for self-hosted setups, no premium-tier gating.

## Alternatives rejected

- **Vendor-provided keys with usage tier.** Faster onboarding, but introduces a proxy, which introduces a logging risk, which kills the positioning. Every "we don't log" promise is unenforceable without auditing infrastructure we don't run.
- **Hybrid (vendor key for free tier, BYOK for paid).** Same logging risk for any user on the free tier. Splits the product personality into two contradictory halves.

## Mitigations for onboarding friction

- The empty state explains BYOK clearly with one-paragraph framing and a link to each provider's API key page.
- Ollama is supported from day one so privacy-maximalist users have a zero-account path.
- Keys are stored in the OS keychain (never in plaintext on disk) once the Tauri shell ships at Phase 1.5.
