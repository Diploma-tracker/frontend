# Development

## Requirements

- Node.js `24.15.0` or newer, as declared in the root `package.json` and required
  by the installed test tools. CI uses the latest Node.js 24 release.
- pnpm `10.19.0`, pinned in the root `package.json`.

## Setup

```bash
pnpm install
```

Follow the relevant [workspace README](../README.md#workspaces) for local
configuration, environment variables, and any required build artifacts. There
is no repository-wide runtime `.env`; keep workspace `.env` files local and
never commit secrets.

Start all available development tasks:

```bash
pnpm dev
```

Use a filter when working on one workspace:

```bash
pnpm --filter <workspace-name> <script>
```

## Before submitting changes

Run tests for changed behavior, then the relevant type, lint, format, and build
checks. The CI workflow runs two independent jobs in parallel: Code quality
checks formatting, linting, builds, and types; Tests runs monorepo tests through
`pnpm run test`. Each job installs dependencies from the frozen lockfile.

Use non-mutating checks when reviewing changes; fixing scripts rewrite files.
See [commands](commands.md) for task scope and workspace filtering.
