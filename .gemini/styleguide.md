# Gemini Project Context

Use the repository's shared AI instructions as the canonical source of project
context. Do not maintain a separate Gemini-specific set of architecture or
coding rules.

## Instruction scope

1. Read [`../AGENTS.md`](../AGENTS.md) for repository-wide requirements.
2. When reviewing files under `apps/*` or `packages/*`, also read the nearest
   workspace `AGENTS.md`. Its workspace-specific guidance supplements the root
   instructions.
3. Follow the documentation linked from the applicable `AGENTS.md`. Root docs
   define shared practices, while workspace docs define local architecture,
   development setup, conventions, environment requirements, and validation
   commands.
4. If guidance differs by scope, use the most specific applicable workspace
   guidance without disregarding repository-wide constraints.

## Shared documentation

- [Architecture](../docs/architecture.md)
- [Development setup](../docs/development.md)
- [Conventions](../docs/conventions.md)
- [Commands and validation](../docs/commands.md)

## Workspace instructions

- [Tracker dashboard](../apps/tracker-dashboard/AGENTS.md)
- [API package](../packages/api/AGENTS.md)
- [Code tools configuration](../packages/code-tools-config/AGENTS.md)
- [Tailwind configuration](../packages/tailwind-config/AGENTS.md)
- [TypeScript configuration](../packages/typescript-config/AGENTS.md)
- [UI kit](../packages/ui-kit/AGENTS.md)
- [Utilities](../packages/utils/AGENTS.md)

For implementation and review, use the commands documented for the affected
workspace and keep generated files out of manual edits.
