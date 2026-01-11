# Gemini Monorepo Style Guide

## Introduction

This style guide defines coding conventions for all code in the Gemini monorepo. It is based on widely accepted standards for TypeScript, React, and modern frontend tooling, with adjustments for our monorepo structure and workflows.

## Key Principles

- **Readability:** Code should be clear and easy to follow.
- **Maintainability:** Favor patterns that make future changes simple.
- **Consistency:** Use the same style across all packages and apps.
- **Performance:** Write efficient code, but never sacrifice clarity.

## General Formatting

### Line Length

- **Maximum line length:** 100 characters.

### Indentation

- **Use 2 spaces per indentation level.**
- **No tabs.**

### Imports

- **Group imports:**
  1. Node.js/standard library (if any)
  2. Third-party modules
  3. Internal packages (monorepo)
  4. Local files
- **Sort imports alphabetically within groups.**
- **Prefer absolute imports for internal packages.**

### Naming Conventions

- **Variables & Functions:** `camelCase`
- **Constants:** `UPPER_CASE`
- **Types & Interfaces:** `PascalCase`
- **Components:** `PascalCase`
- **Files:** `kebab-case` or `camelCase` (no spaces, no underscores)
- **Folders:** `kebab-case`

### React & TypeScript

- **Use function components with arrow functions unless class is required.**
- **Always type props and state.**
- **Prefer explicit return types for exported functions/components.**
- **Use hooks for state and side effects.**
- **Use `useEffect` cleanup when needed.**

### Doc Comments

- **Use JSDoc for exported functions, types, and components.**
- **First line:** Short summary.
- **Document parameters, return values, and side effects.**
- **Example:**

  ```ts
  /**
   * Increments a counter.
   * @param count Current count value.
   * @returns New count value.
   */
  export function increment(count: number): number {
    return count + 1;
  }
  ```

### TypeScript

- **Always use type annotations for function parameters and return values.**
- **Prefer interfaces for public APIs, types for unions.**
- **Avoid `any` and `unknown` unless absolutely necessary.**
- **Use strict mode in `tsconfig.json`.**

### Comments

- **Explain "why", not "what".**
- **Use complete sentences.**
- **Avoid commented-out code in main branches.**

### CSS & Tailwind

- **Use Tailwind CSS utility classes for styling.**
- **Prefer shared config from [`@repo/tailwind-config`](packages/tailwind-config/package.json).**
- **Prefix custom classes in `ui-kit` with `ui-` to avoid conflicts.**
- **Use CSS modules or scoped styles for custom CSS.**

### Error Handling

- **Handle errors gracefully in UI and logic.**
- **Show user-friendly messages for UI errors.**
- **Log errors in development, avoid leaking sensitive info in production.**

### Tooling

- **Formatter:** [Prettier](https://prettier.io/) (see [`prettier.config.js`](apps/tracker-dashboard/prettier.config.js))
- **Linter:** [ESLint](https://eslint.org/) (see [`@repo/code-tools-config`](packages/code-tools-config/package.json))
- **Type Checker:** [TypeScript](https://www.typescriptlang.org/)
- **CI:** All code is checked for formatting, lint, and types in [`ci.yml`](github/workflows/ci.yml)

## Example

```tsx
/**
 * Button component for Gemini UI.
 * @param props Button props.
 * @returns JSX.Element
 */
import React from "react";

type ButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  disabled = false,
}) => (
  <button
    className="ui-btn px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
    onClick={onClick}
    disabled={disabled}
  >
    {label}
  </button>
);
```
