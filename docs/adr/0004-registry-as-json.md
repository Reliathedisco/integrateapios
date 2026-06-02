# ADR 0004 — Registry as versioned JSON files

- **Status:** accepted
- **Date:** 2026-06-01

## Context

The integration registry is the moat. It's the curated set of metadata — docs links, env vars, security checklists, common patterns, SDK references — that makes the planner's output trustworthy. The registry's storage format determines who can contribute, how it's reviewed, how it ships to users, and how it stays auditable.

## Decision

**Registry entries are versioned JSON files** living under `packages/registry/integrations/*.json`, validated at load time against a Zod schema in `packages/registry/src/schema.ts`.

## Consequences

- Every change to the registry shows up as a reviewable diff in git. No database, no admin panel, no behind-the-scenes edits.
- The registry ships with the app. Users get the registry the moment they install — no remote fetch required at runtime.
- Community contribution is a pull request. Marketplace plans for Phase 4 build on top of this primitive — signed JSON packs.
- The schema is the contract. If we ever need to add a field (e.g. a new pattern type), it's a schema migration committed in the same PR as the entries that use it.
- Storage cost is zero. No database, no caching infrastructure, no eventual-consistency story.

## Alternatives rejected

- **Postgres registry served from a cloud API.** Adds a backend we'd otherwise not need. Introduces an offline failure mode. Forces users to trust our infrastructure for the data the planner depends on.
- **MDX with frontmatter.** Pretty for documentation, but a worse fit for structured data. JSON keeps the schema enforceable and the parser trivial.
- **YAML.** Easier for humans to write, but the format is too lenient — JSON's strictness is a feature here.

## Future work

- A `pnpm registry:validate` script that runs the Zod parse on every JSON file in CI.
- A `pnpm registry:new <id>` generator that scaffolds a new entry from a template.
- Per-entry version pinning so the planner can warn when a registry entry is older than the user's installed SDK version.
