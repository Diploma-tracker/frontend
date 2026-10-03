# Commands

Run from the repository root. `build` and `dev` are workspace Turbo tasks, not
package scripts; use the root task with a filter for orchestration.

| Command                                       | Purpose                                  |
| --------------------------------------------- | ---------------------------------------- |
| `pnpm build --filter=@repo/ui-kit`            | Build components, then styles            |
| `pnpm dev --filter=@repo/ui-kit`              | Watch components and styles together     |
| `pnpm --filter @repo/ui-kit dev:components`   | Watch TypeScript output                  |
| `pnpm --filter @repo/ui-kit dev:styles`       | Watch Tailwind output                    |
| `pnpm --filter @repo/ui-kit build:components` | Clean `dist/` and compile components     |
| `pnpm --filter @repo/ui-kit build:styles`     | Build CSS; run after the component build |
| `pnpm --filter @repo/ui-kit check-types`      | Type-check without emitting              |
| `pnpm --filter @repo/ui-kit lint:check`       | Check ESLint rules                       |
| `pnpm --filter @repo/ui-kit lint`             | Apply ESLint fixes                       |
| `pnpm --filter @repo/ui-kit format:check`     | Check source formatting                  |
| `pnpm --filter @repo/ui-kit format`           | Format source                            |
| `pnpm --filter @repo/ui-kit clean`            | Remove this package's `dist/`            |

## Validation

Run `check-types`, `lint:check`, `format:check`, then the ordered build. This
package has no test script: verify changed behavior in focused consumer tests
and manually check keyboard/focus, light/dark themes, and responsive states.

Formatting scripts target `src/`; check README/docs with the
[documentation formatting command](../../../docs/commands.md#documentation-formatting).
