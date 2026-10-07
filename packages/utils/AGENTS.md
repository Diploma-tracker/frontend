# Utils Package Guide for AI

- Keep utilities deterministic and domain-neutral: no React, browser globals, UI, API clients, or product state.
- Preserve deliberate public exports and validate edge cases at utility boundaries.
- Do not introduce implicit locale, timezone, network, or mutable global-state behavior.

Run Vitest tests and the source/test type checks with the other
[package checks](docs/commands.md#validation).

## Documentation

- [Development](docs/development.md)
- [Conventions](docs/conventions.md)
- [Commands](docs/commands.md)
