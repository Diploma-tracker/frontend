# Tailwind Config Guide for AI

- Keep this package design-system-only; no components or product-specific logic/layout.
- Define literal colors only in `tokens.css`; semantic tokens need light/dark values and readable contrast.
- Libraries import tokens; apps import full styles. Avoid duplicate preflight.

Validate token/import changes in [both UI consumers](docs/commands.md#validation).

## Documentation

- [Architecture](docs/architecture.md)
- [Development](docs/development.md)
- [Conventions](docs/conventions.md)
- [Commands](docs/commands.md)
