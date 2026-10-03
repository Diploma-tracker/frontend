# Monorepo architecture

## Layout

- `apps/` contains deployable products.
- `packages/` contains reusable runtime libraries and shared configuration.
- `tools/` contains repository-only utilities, including the i18n checker.

The pnpm workspace includes `apps/*` and `packages/*`. Turborepo coordinates their scripts and runs upstream tasks where configured.

## Dependency flow

```text
apps
  -> runtime packages (@repo/api, @repo/ui-kit, @repo/utils)
      -> lower-level utilities and shared configuration
```

- Import workspace packages through declared `@repo/*` entry points.
- Never import another workspace through a relative path or its `src/` directory.
- Shared packages do not depend on applications.
- Configuration packages contain no product logic.
- Declare internal workspace dependencies with `workspace:*`.

## Public boundaries

Package `exports` and intentional barrel files define the supported API. When adding or moving a public symbol, update those boundaries and affected documentation together. Generated outputs and build artifacts are implementation products, not editing targets.

## Documentation structure

The root and every workspace use a short `README.md` as an overview and index,
with the same files under `docs/`:

| File              | Content                                        |
| ----------------- | ---------------------------------------------- |
| `architecture.md` | Structure, boundaries, and public entry points |
| `development.md`  | Getting started and configuration              |
| `conventions.md`  | Coding and maintenance practices               |
| `commands.md`     | Available scripts and validation               |

Root docs describe shared practices; workspace docs describe only local details
and link back for shared setup. Keep `AGENTS.md` limited to critical AI rules and
links to these docs. See the [workspace index](../README.md#workspaces).
