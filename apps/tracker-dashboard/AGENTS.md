# Tracker Dashboard Guide for AI

- Keep `app/` declarative, `pages/` compositional, business state in `modules/*/models`, interaction UI in `modules/*/features`, and `shared/` domain-neutral.
- Import another module only through `@/modules/<domain>`; never deep-import its internals. Do not deepen the existing auth/user cycle.
- Never edit `src/app/routeTree.gen.ts`.
- Keep API access and Reatom state out of pages. Use `@repo/api` endpoints from module models and inspect `ApiResponse.ok`.
- Use `@repo/ui-kit`, semantic Tailwind tokens, accessible markup, and translation helpers for all user-facing text.
- Keep English and Ukrainian locale files synchronized.
- Document every app environment variable in `docs/environment.md` and `.env.example`; update both when adding, changing, or removing a variable.

Run relevant tests and the checks in [commands](docs/commands.md#validation).

## Documentation

- [Architecture](docs/architecture.md)
- [Development](docs/development.md)
- [Environment variables](docs/environment.md)
- [Conventions](docs/conventions.md)
- [Commands](docs/commands.md)
