# TypeScript Config Guide for AI

- Keep compiler presets portable; workspace paths and aliases belong to consumers.
- Never weaken `strict`, `noUncheckedIndexedAccess`, or isolated-module compatibility for one consumer.
- Validate shared changes through [consumer type checks and builds](docs/commands.md#validation).

## Documentation

- [Architecture](docs/architecture.md)
- [Development](docs/development.md)
- [Conventions](docs/conventions.md)
- [Commands](docs/commands.md)
