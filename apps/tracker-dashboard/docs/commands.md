# Commands

Run from the repository root.

| Command                                              | Purpose                                |
| ---------------------------------------------------- | -------------------------------------- |
| `pnpm --filter tracker-dashboard dev`                | Start Vite                             |
| `pnpm --filter tracker-dashboard build`              | Type-check and build production assets |
| `pnpm --filter tracker-dashboard preview`            | Preview the production build           |
| `pnpm --filter tracker-dashboard test`               | Run Vitest once                        |
| `pnpm --filter tracker-dashboard test:watch`         | Run Vitest in watch mode               |
| `pnpm --filter tracker-dashboard check-types`        | Type-check source                      |
| `pnpm --filter tracker-dashboard check-types:test`   | Type-check tests                       |
| `pnpm --filter tracker-dashboard lint:check`         | Check ESLint rules                     |
| `pnpm --filter tracker-dashboard lint`               | Apply ESLint fixes                     |
| `pnpm --filter tracker-dashboard format:check`       | Check source/test formatting           |
| `pnpm --filter tracker-dashboard format`             | Format source/tests                    |
| `pnpm --filter tracker-dashboard i18n:check-locales` | Compare locale keys                    |
| `pnpm --filter tracker-dashboard i18n:audit`         | Audit used and unused locale keys      |
| `pnpm --filter tracker-dashboard i18n:fix`           | Preview locale fixes without writing   |
| `pnpm --filter tracker-dashboard i18n:fix:write`     | Apply locale fixes; review the diff    |

## Validation

Run relevant tests, `check-types`, `check-types:test`, `lint:check`,
`format:check`, and `build` for application changes. Locale changes also need
`i18n:check-locales` and `i18n:audit`. The root type task does not include
`check-types:test`; run it explicitly.

Formatting targets `src/` and `tests/`, not this workspace's README or docs. See
the [documentation formatting command](../../../docs/commands.md#documentation-formatting).
