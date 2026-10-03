# Commands

Run from the repository root.

| Command                                              | Purpose                                     |
| ---------------------------------------------------- | ------------------------------------------- |
| `pnpm --filter @repo/typescript-config format:check` | Check package formatting, including docs    |
| `pnpm --filter @repo/typescript-config format`       | Format the package                          |
| `pnpm check-types`                                   | Validate compiler presets through consumers |
| `pnpm build`                                         | Validate consuming builds and emission      |

## Validation

Check package formatting, then run root type checks after preset changes.
For emit-related changes, also build at least one representative consumer.
There are no package-local build, type-check, lint, or test scripts; consumers
provide integration validation.
