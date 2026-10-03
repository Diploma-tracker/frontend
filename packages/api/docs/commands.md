# Commands

Run from the repository root.

| Command                                | Purpose                                       |
| -------------------------------------- | --------------------------------------------- |
| `pnpm --filter @repo/api generate`     | Regenerate from the configured backend schema |
| `pnpm generate`                        | Generate and format through the root workflow |
| `pnpm --filter @repo/api format:check` | Check package formatting, including docs      |
| `pnpm --filter @repo/api format`       | Format the package                            |

## Validation

Run `format:check`, then affected consumer type checks/tests and the root build
after API changes. Generation needs a reachable compatible schema; do not run
it solely to validate documentation.

There are no package-local lint, type-check, build, or test scripts. Validate
runtime and contract changes through consumers rather than assuming the root
tasks check this package independently.
