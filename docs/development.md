# Development

## Requirements

- Use a Node.js version supported by the installed tools: Vite 7 requires
  `20.19+` or `22.12+`. The root manifest declares `>=18`, but Node.js 18 is not
  sufficient for all workspaces. CI uses Node.js 20.
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

Run tests for changed behavior, then the relevant type, lint, format, and build checks. The CI workflow checks formatting, linting, builds, and types, and runs monorepo tests through `pnpm run test`.

Use non-mutating checks when reviewing changes; fixing scripts rewrite files.
See [commands](commands.md) for task scope and workspace filtering.
