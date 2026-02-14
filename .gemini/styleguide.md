# Gemini Monorepo Style Guide

This guide defines strict coding standards for all packages and applications in the monorepo.  
All code must comply with the rules below.

---

## Core Principles

- Prioritize readability over cleverness.
- Maintain consistency across all packages.
- Avoid premature optimization.
- Follow accessibility best practices.

---

## Formatting

- Separate logical blocks with a blank line.
- Do not mix unrelated concerns in a single block.
- Keep files logically structured and predictable.

---

## Naming Conventions

| Entity | Convention |
| --------- | ---------- |
| Variables / Functions | `camelCase` |
| Constants | `UPPER_CASE` |
| Types / Interfaces | `PascalCase` |
| React Components | `PascalCase` |
| Files | `kebab-case` or `camelCase` (no underscores, no spaces) |
| Folders | `kebab-case` |

---

## React Guidelines

- Use function components with arrow functions.
- Do not use class components unless strictly required.
- Always type props explicitly.
- Extract complex logic into:
  - Custom hooks
  - Helper functions
  - Container components (when appropriate)
- JSX must remain declarative and focused on rendering.
- Avoid inline functions inside JSX.
- Avoid complex conditional logic inside JSX.
- Move handlers and conditions above `return`.
- Prefer composition over inheritance.
- Suggest advanced patterns (HOC, Render Props, Compound Components, Custom Hooks) only when complexity justifies it.

---

## TypeScript Rules

- Always annotate function parameters and return types.
- Avoid `any`.
- Use `unknown` instead of `any` where necessary.
- Prefer:
  - `interface` for public contracts
  - `type` for unions and utility types.
- Strict mode must be enabled in `tsconfig.json`.

---

## Documentation (JSDoc)

Use JSDoc only when:

- The function is reusable.
- The logic is non-obvious.
- The function has side effects.

Document:

- Short summary.
- Parameters.
- Return value.
- Side effects (if any).

Do not document trivial functions.

---

## Comments

- Explain **why**, not **what**.
- Use complete sentences.
- Do not leave commented-out code.
- Remove dead code before merging.

---

## Styling (Tailwind + UI Kit)

- Use Tailwind CSS utilities.
- Do not hardcode colors — use design tokens.
- Follow shared configuration from `@repo/tailwind-config`.
- UI Kit custom classes must use `ui-` prefix.
- Follow shadcn component philosophy and usage patterns.
- Use mobile-first responsive utilities.
- Prefer relative units over fixed pixels.
- Support dark mode.
- Use modern CSS functions (`clamp`, `min`, `max`, `minmax`) when appropriate.

---

## Error Handling

- Always handle errors from async operations.
- External service errors must be typed.
- Use:
  - `ErrorBoundary` for UI crashes.
  - `Suspense` for lazy-loaded components.
- Display user-friendly error messages.
- Do not leak sensitive data in production logs.

---

## Tooling Requirements (Must Pass)

- Prettier formatting.
- ESLint validation.
- TypeScript type checking.
- CI validation before merge.

---

## AI Code Review Enforcement Rules

During review, the AI must:

1. Detect violations of naming conventions.
2. Detect missing type annotations.
3. Detect `any` usage.
4. Detect inline JSX logic that should be extracted.
5. Suggest composition when a component becomes complex.
6. Check accessibility (ARIA usage, semantic HTML).
7. Detect Tailwind misuse (hardcoded colors, inconsistent spacing).
8. Ensure async errors are handled properly.
9. Flag dead code and commented-out code.
10. Detect duplicated logic across components.
11. Flag overly large components that violate single-responsibility principle.
12. Ensure separation of UI logic and business logic.

All violations must be explicitly reported with actionable recommendations.
