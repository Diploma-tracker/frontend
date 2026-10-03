# Component conventions

- Keep components reusable and domain-neutral. Do not add application routing,
  API calls, Reatom/product state, translations, or business rules.
- Use typed function components and declarative JSX. Extend underlying
  element/primitive props; forward relevant HTML props and refs, and preserve
  controlled/uncontrolled behavior.
- Compose primitives instead of hiding capabilities. Use stable `data-slot`
  attributes, established `asChild`/render patterns, and named exports for
  components and variants.
- Use `cn` for class merging and CVA for semantic, typed variants. Avoid
  accumulating boolean props; memoize only measured or expensive work.
- Every Tailwind utility uses the `ui:` prefix, including state variants. Use
  semantic tokens from `@repo/tailwind-config/tokens`, not product colors.
- Preserve responsive, dark, pointer, disabled, invalid, and focus-visible
  states. Maintain keyboard behavior, ARIA semantics, focus management, labels,
  and touch targets provided by accessible primitives.

Shared TypeScript and maintenance rules are in the
[root conventions](../../../docs/conventions.md).
