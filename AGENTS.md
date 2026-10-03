# Repository Guide for AI

- Use pnpm `10.19.0` and run tasks through the existing pnpm/Turbo scripts.
- Read the nearest workspace `AGENTS.md` before changing files below `apps/*` or `packages/*`.
- Preserve dependency direction: apps may consume `@repo/*` packages; packages must not import apps. Never import another workspace's `src/` directly.
- Keep TypeScript strict, avoid authored `any`, and handle async failures without exposing secrets.
- Do not hand-edit generated files such as `src/generated/**` or `src/app/routeTree.gen.ts`.
- Keep public exports, workspace dependencies, and documentation synchronized with code changes.
- Run relevant tests and applicable type, lint, format, and build checks, narrowest first. Prefer non-mutating checks; CI runs monorepo tests through `pnpm run test`.
- Leave touched code cleaner without expanding scope.

## Documentation

- [Architecture](docs/architecture.md)
- [Development setup](docs/development.md)
- [Conventions](docs/conventions.md)
- [Commands](docs/commands.md)
