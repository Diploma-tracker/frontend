# API Package Guide for AI

- Keep transport code framework-independent: no React, UI, app modules, or product state.
- Never hand-edit `src/generated/`; change generator inputs/configuration and regenerate only when needed.
- Preserve the `ApiResponse<T>` discriminated union and typed failure metadata.
- Upload through unauthenticated presigned URLs; finish all uploads before commit.
- Document every package environment variable in `docs/environment.md` and `.env.example`; update both when adding, changing, or removing a variable.

Validate through [package and consumer checks](docs/commands.md#validation).

## Documentation

- [Architecture](docs/architecture.md)
- [Development](docs/development.md)
- [Environment variables](docs/environment.md)
- [Conventions](docs/conventions.md)
- [Commands](docs/commands.md)
