# Preset architecture

## ESLint

Presets export named `config` arrays and build on each other:

| Public subpath      | Responsibility                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `eslint/base`       | Recommended JS/TypeScript rules, Prettier compatibility, Turbo environment checks, console limits, `dist/` ignore |
| `eslint/react-base` | Base plus React/hooks rules, browser globals, component naming, module-boundary restrictions                      |
| `eslint/react-vite` | React base plus React Refresh behavior and Vite output ignores                                                    |

Import these under `@repo/code-tools-config/`. The React preset's module rule
allows public `@/modules/<name>` imports and rejects internal subpaths; its
application-specific usage is documented by the consuming app.

## Prettier

- `prettier/base`: semicolons, single quotes, trailing commas, 80-column width,
  two-space indentation, and LF endings.
- `prettier/react`: base plus import and Tailwind class sorting. Import groups
  are built-ins, React, third-party, `@repo/*`, relative paths, then styles.

These are default exports. Keep `package.json#exports` synchronized with preset
files; the package has no runtime or compiled output.
