# Gemini Monorepo Style Guide

This guide defines strict coding standards for all packages and applications in the monorepo.  
All code must comply with the rules below.

---

## Additional Context

- reatom state manager context docs @./lib-context/reatom.md

---

## Core Principles

- Prioritize readability over cleverness.
- Maintain consistency across all packages.
- Avoid premature optimization.
- Follow accessibility best practices.

---

## Modular architecture of the `apps` in monorepo

Each application inside `apps` must follow a strict layered modular architecture.

### Root Structure

Every app must contain:

```bash
src/
  app/
  pages/
  modules/
  shared/
```

### `app/` — Application Layer

**Purpose:** global application configuration only.

**Allowed:**

- Route configuration
- Global providers
- Global state initialization
- App-level configuration

**Forbidden:**

- Business logic
- API calls
- Feature-specific logic
- UI specific to a single module

`app/` must remain thin and declarative.

---

### `pages/` — Composition Layer

**Purpose:** compose modules into screens.

**Rules:**

- Pages must not contain business logic.
- Pages must not implement data-fetching logic.
- Pages must only:
  - Compose features
  - Pass props
  - Configure layout

Pages reuse modules. They do not implement them.

---

### `modules/` — Feature-Based Modules

Each business domain must live inside its own module.

Example:

```bash
modules/
  auth/
    features/
    models/
    api/
    constants/
```

A module groups all logic related to a specific domain.

---

#### `features/`

UI parts responsible for a concrete user interaction.

**Rules:**

- May use models of the same module.
- May call module API of the same module.
- May use other modules **only through their public API**.
- Must not import internal files from other modules.
- Must not access shared global state outside allowed boundaries.

---

#### `models/`

Contains:

- Module state
- Async queries
- Async mutations
- Selectors
- Business logic

**Rules:**

- No JSX.
- No UI concerns.
- No direct DOM access.

Models are the source of truth for the module.

---

#### `api/`

Contains:

- API handlers
- DTO definitions
- External service communication

**Rules:**

- No UI logic.
- No business logic.
- Pure communication layer.

---

#### `constants/`

Contains:

- Module-specific constants only.

Must not contain global or cross-module constants.

---

### `shared/` — Cross-Application Layer

Contains reusable logic shared across the entire app.

Example structure:

```bash
shared/
  http/
  components/
  utils/
```

**Rules:**

- Must be domain-agnostic.
- Must not depend on any module.
- Must not contain business logic of a specific domain.
- If logic becomes domain-specific, move it to the corresponding module.

---

## Architectural Constraints (Strict)

1. Modules must not depend on other modules' internal implementation.
2. Modules may communicate only through explicitly defined public APIs.
3. `shared/` must not depend on modules.
4. Pages must not contain business logic.
5. App layer must not contain feature logic.
6. Business logic must live inside `models/`.
7. UI logic must live inside `features/`.
8. API communication must live inside `api/`.
9. Constants must not leak across modules.
10. Direct deep imports from another module (e.g. `modules/other/models/internal-file`) are forbidden.
11. Avoid circular dependencies at all costs.

---

## AI Review: Modular Architecture Enforcement

During review, the AI must additionally:

1. Detect business logic inside `pages/` or `app/`.
2. Detect API calls outside `modules/*/api`.
3. Detect state management outside `modules/*/models`.
4. Detect illegal cross-module imports (importing anything except the module's public API entry point).
5. Ensure cross-module communication happens only through public exports.
6. Detect domain-specific logic placed inside `shared/`.
7. Flag feature components that contain business logic instead of delegating to `models/`.
8. Ensure `shared/` remains framework-agnostic where possible.
9. Detect circular dependencies.
10. Flag oversized modules that mix multiple business domains.
11. Ensure each module follows the required internal structure.

Any cross-module dependency must be validated against the public API boundary.

---

## Formatting

- Separate logical blocks with a blank line.
- Do not mix unrelated concerns in a single block.
- Keep files logically structured and predictable.

---

## Naming Conventions

| Entity                | Convention                                              |
| --------------------- | ------------------------------------------------------- |
| Variables / Functions | `camelCase`                                             |
| Constants             | `UPPER_CASE`                                            |
| Types / Interfaces    | `PascalCase`                                            |
| React Components      | `PascalCase`                                            |
| Files                 | `kebab-case` or `camelCase` (no underscores, no spaces) |
| Folders               | `kebab-case`                                            |

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
