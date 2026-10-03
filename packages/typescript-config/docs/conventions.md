# Compiler preset conventions

- Keep presets portable and free of application-specific aliases, includes,
  or environment assumptions.
- Do not weaken `strict`, `noUncheckedIndexedAccess`, or isolated-module
  compatibility for one consumer. Fix the consumer or justify a narrower preset.
- Add an option to `base.json` only when valid for every TypeScript workspace.
  React, library-emission, and Vite-specific options belong in derived presets.
- Preserve valid TypeScript configuration inheritance and the bundler module
  resolution strategy. Review inherited options before introducing overrides.
- Compiler changes can affect declarations and emitted JavaScript as well as
  diagnostics; validate representative consumers accordingly.

Shared TypeScript practices are in the [root conventions](../../../docs/conventions.md).
