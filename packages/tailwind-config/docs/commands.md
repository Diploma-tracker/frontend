# Commands

Run from the repository root.

| Command                                            | Purpose                                  |
| -------------------------------------------------- | ---------------------------------------- |
| `pnpm --filter @repo/tailwind-config format:check` | Check package formatting, including docs |
| `pnpm --filter @repo/tailwind-config format`       | Format the package                       |
| `pnpm build --filter=@repo/ui-kit`                 | Build consuming component styles         |
| `pnpm --filter tracker-dashboard build`            | Check the app's theme integration        |

## Validation

Check package formatting first. For token/import changes, build the UI kit
before the dashboard, run affected consumer checks/tests, and inspect light/dark
and responsive states. This package has no standalone build, type-check, lint,
or test scripts; consumer builds and visual checks validate CSS behavior.
