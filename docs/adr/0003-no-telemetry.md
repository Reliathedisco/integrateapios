# ADR 0003 — No telemetry by default

- **Status:** accepted
- **Date:** 2026-06-01

## Context

Most modern developer tools ship with anonymous usage telemetry on by default, with an opt-out. This is industry-standard and helps product teams understand behavior. It also undercuts a "nothing leaves your machine" promise, because something does leave your machine — telemetry pings, however anonymous.

## Decision

**No telemetry by default. Ever.** Not in the MVP, not at GA, not when we have paying customers. The product ships with zero outbound network traffic except to the user's chosen AI provider.

## Consequences

- We will not have a usage dashboard. We will measure traction via design partner conversations, waitlist conversion, and downloads — not via in-app analytics.
- Bug reports will be qualitative ("the app crashed when…") rather than telemetry-driven. We will lean on detailed, opt-in user reports for triage.
- Marketing claims about privacy become provable: a user can run mitmproxy or Little Snitch and confirm there are no outbound requests outside their chosen provider. This is a feature, not a constraint.
- Product decisions get made closer to users instead of from a dashboard. Trade-off accepted.

## Future revisits

If we ever introduce opt-in anonymous usage stats (the conversation is open for Phase 3+), this ADR will be superseded by a new ADR that documents the exact scope, the data collected, the user-visible toggle, and the audit method. Default-on is permanently off the table.

## Alternatives rejected

- **Opt-out telemetry.** Standard industry practice. Incompatible with the positioning.
- **Opt-in telemetry from day one.** Would still add a UI surface explaining the toggle, which adds noise and weakens the "we just don't" message. Defer to a later phase when there's a real reason to ask.
