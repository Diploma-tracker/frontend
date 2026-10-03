# Commands

Run from the repository root.

| Command                                              | Purpose                                                    |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| `pnpm --filter @repo/code-tools-config format:check` | Check package formatting, including docs                   |
| `pnpm --filter @repo/code-tools-config format`       | Format the package                                         |
| `pnpm lint:check`                                    | Validate shared lint rules in consumers                    |
| `pnpm format:check`                                  | Validate formatting presets in configured consumer targets |

## Validation

Check package formatting first, then root lint and formatting checks for preset
changes. Inspect every affected consumer when changing shared rules or plugins.
There are no package-local build, type-check, lint, or test scripts; consumer
checks serve as integration validation.
