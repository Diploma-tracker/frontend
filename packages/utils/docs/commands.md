# Commands

Run from the repository root.

| Command                                  | Purpose                       |
| ---------------------------------------- | ----------------------------- |
| `pnpm --filter @repo/utils build`        | Compile to `dist/`            |
| `pnpm --filter @repo/utils check-types`  | Type-check without emitting   |
| `pnpm --filter @repo/utils lint:check`   | Check ESLint rules            |
| `pnpm --filter @repo/utils lint`         | Apply ESLint fixes            |
| `pnpm --filter @repo/utils format:check` | Check source formatting       |
| `pnpm --filter @repo/utils format`       | Format source                 |
| `pnpm --filter @repo/utils clean`        | Remove this package's `dist/` |

## Validation

Run `check-types`, `lint:check`, `format:check`, and `build` for utility changes.
There is currently no test framework or test script configured; add focused
tests for new non-trivial behavior and check affected consumers.

Formatting scripts target `src/`; check README/docs with the
[documentation formatting command](../../../docs/commands.md#documentation-formatting).
