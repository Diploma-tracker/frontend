# Token and styling conventions

- Own design primitives and shared vendor theming, not React components,
  product-specific layouts, or business rules.
- Literal color values belong only in `tokens.css`. Consumers use semantic
  variables/utilities, not hardcoded colors.
- Reuse existing semantic names before adding tokens. Add each token in light
  and dark themes and map it through `@theme inline` when it needs a utility.
- Every color/status token needs readable foreground contrast.
- Prefer relative units and modern CSS functions where practical. Scope vendor
  overrides beneath their library root; reserve `!important` for unavoidable
  vendor specificity.
- Libraries import tokens only; applications import full styles to avoid
  duplicate preflight.

Shared maintenance rules are in the [root conventions](../../../docs/conventions.md).
