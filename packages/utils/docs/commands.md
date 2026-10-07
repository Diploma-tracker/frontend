# Commands

Run from the repository root.

| Command                                      | Purpose                       |
| -------------------------------------------- | ----------------------------- |
| `pnpm --filter @repo/utils build`            | Compile to `dist/`            |
| `pnpm --filter @repo/utils test`             | Run Vitest once               |
| `pnpm --filter @repo/utils test:watch`       | Run Vitest in watch mode      |
| `pnpm --filter @repo/utils check-types`      | Type-check without emitting   |
| `pnpm --filter @repo/utils check-types:test` | Type-check tests              |
| `pnpm --filter @repo/utils lint:check`       | Check ESLint rules            |
| `pnpm --filter @repo/utils lint`             | Apply ESLint fixes            |
| `pnpm --filter @repo/utils format:check`     | Check source formatting       |
| `pnpm --filter @repo/utils format`           | Format source                 |
| `pnpm --filter @repo/utils clean`            | Remove this package's `dist/` |

## Validation

Run `test`, `check-types`, `check-types:test`, `lint:check`, `format:check`, and
`build` for utility changes. Add focused tests for new non-trivial behavior and
check affected consumers. The root `pnpm check-types` task runs both source and
test type checks, including in CI.

Formatting scripts target `src/`; check README/docs with the
[documentation formatting command](../../../docs/commands.md#documentation-formatting).
