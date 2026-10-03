# Engineering conventions

These rules apply across the monorepo. Workspace-specific rules live in each workspace's `docs/conventions.md`.

## TypeScript and naming

- Keep strict TypeScript enabled. Type parameters and return values explicitly and use `unknown` instead of `any` when narrowing is needed.
- Prefer `interface` for public contracts and `type` for unions and utility types.
- Use `camelCase` for values/functions, `UPPER_CASE` for constants, and `PascalCase` for types and components.
- Use `kebab-case` for folders and normally for files; do not use spaces or underscores.

## Reliability and maintenance

- Handle async failures and expose user-safe messages. Do not log tokens, secrets, or sensitive payloads.
- Comments explain why. Remove dead code and do not leave commented-out implementations.
- Add tests for changed behavior. Prefer observable behavior over implementation details.
- Keep changes formatted with the shared Prettier configuration and warning-free under ESLint.

## Tooling and contributions

- Extend shared tooling presets instead of copying them; keep local options in
  the consuming workspace. Configuration and UI rules live in the corresponding
  [workspace docs](../README.md#workspaces).
- Use Conventional Commits, enforced by the `commit-msg` hook. Branch names use
  a permitted prefix and `/` separator; see
  [`branchlint.config.js`](../branchlint.config.js).
- The pre-commit hook runs lint-staged; pre-push checks the branch name. Neither
  replaces the [validation commands](commands.md).

## New workspaces

Declare internal dependencies with `workspace:*` and expose deliberate public
entry points. Add only scripts supported by the workspace's tooling:

| Script                    | When needed                             | Typical command                                          |
| ------------------------- | --------------------------------------- | -------------------------------------------------------- |
| `lint:check` / `lint`     | ESLint configured                       | `eslint src/ --max-warnings 0` / add `--fix`             |
| `format:check` / `format` | Prettier configured                     | `prettier --check src/ --ignore-unknown` / use `--write` |
| `check-types`             | TypeScript configured                   | `tsc --noEmit`                                           |
| `test`                    | Tests configured                        | Non-watch test runner                                    |
| `build` / `dev`           | Build or development tooling configured | Tool-specific command                                    |

Use `.` instead of `src/` for config-only workspaces. Turbo picks up configured
tasks from workspace scripts; see [`turbo.json`](../turbo.json). Add the
[standard documentation files](architecture.md#documentation-structure) and
link the workspace README from the root index.
