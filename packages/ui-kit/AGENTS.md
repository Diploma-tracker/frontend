# UI Kit Guide for AI

- Keep components domain-neutral: no routing, API calls, product state, or translations.
- Use `ui:`-prefixed Tailwind utilities and shared semantic tokens; preserve accessibility and dark mode.
- Preserve explicit public subpaths; consumers use built exports, not `src/`.
- Build components before styles: the component build clears `dist`.

Run the [package and consumer checks](docs/commands.md#validation).

## Documentation

- [Architecture](docs/architecture.md)
- [Development](docs/development.md)
- [Conventions](docs/conventions.md)
- [Commands](docs/commands.md)
