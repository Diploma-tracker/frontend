# Utility conventions

- Use focused modules, named exports, and explicit input/return types.
- Keep helpers deterministic and domain-neutral. Do not depend on React,
  browser globals, app modules, UI components, API clients, or product state.
- Validate boundary cases and make error behavior explicit. Do not silently
  introduce locale, timezone, network, or mutable global-state dependencies.
- Re-export third-party types only when they intentionally form part of the
  public contract, as with `Duration`.
- Use JSDoc for reusable or non-obvious behavior and examples, not trivial
  implementation details.
- Add package-level tests when behavior gains non-trivial branches or edge
  cases; consumer tests alone are not a substitute for utility coverage.

Shared TypeScript and maintenance rules are in the
[root conventions](../../../docs/conventions.md).
