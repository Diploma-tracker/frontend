# Root commands

Run these commands from the repository root.

| Command                  | Purpose                                                     |
| ------------------------ | ----------------------------------------------------------- |
| `pnpm dev`               | Run workspace development tasks                             |
| `pnpm build`             | Build participating workspaces                              |
| `pnpm test`              | Run workspace tests                                         |
| `pnpm check-types`       | Type-check participating workspaces                         |
| `pnpm lint:check`        | Check lint rules without fixes                              |
| `pnpm lint`              | Run ESLint with fixes                                       |
| `pnpm format:check`      | Check top-level root files and workspace formatting targets |
| `pnpm format`            | Format top-level root files and workspace targets           |
| `pnpm format:check:root` | Check top-level root files only                             |
| `pnpm format:root`       | Format top-level root files only                            |
| `pnpm generate`          | Run configured generators and post-generation formatting    |
| `pnpm create:app`        | Generate an app workspace                                   |
| `pnpm create:package`    | Generate a package workspace                                |

## Workspace tasks

- `pnpm --filter <workspace-name> <script>` runs a declared workspace script.
- `pnpm <root-task> --filter=<workspace-name>` filters a Turbo task and preserves
  its configured dependency ordering. This also supports workspace Turbo tasks
  that have no matching package script.
- `pnpm --filter <workspace-name> run` lists local scripts.
- `pnpm list -r --depth -1` lists workspaces.

Only configured tasks run; consult each [workspace's commands](../README.md#workspaces).
Tests must be run explicitly, including workspace-only checks not in the root
pipeline.

## Documentation formatting

Root formatting scripts do not recurse into root `docs/`. Some workspace
formatting scripts target only source/tests and also omit README/docs. For a
documentation-only change, check all documentation explicitly:

```bash
pnpm exec prettier --check README.md AGENTS.md "docs/**/*.md" "apps/*/README.md" "apps/*/AGENTS.md" "apps/*/docs/**/*.md" "packages/*/README.md" "packages/*/AGENTS.md" "packages/*/docs/**/*.md"
```

Use `--write` instead of `--check` only when formatting is intended.
