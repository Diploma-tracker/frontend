# `@repo/tailwind-config`

Shared Tailwind CSS configurations used across the monorepo (design-tokens, themes, utilities).

## Exports

- `.` (shared-styles.css): Full Tailwind setup with preflight, theme tokens, and utilities. Use for global app styling.

- `./tokens` (tokens.css): Design tokens (CSS variables) only, for theming components and libraries. Use in UI packages to avoid duplicating Tailwind preflight.

- `./postcss`: PostCSS config for build system integration (for example for Next.js).

**Usage examples:**

- In an app: `@import '@repo/tailwind-config';`
- In a UI library: `@import '@repo/tailwind-config/tokens';`
