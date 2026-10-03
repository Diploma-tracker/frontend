# Development

## Setup

Complete the [repository setup](../../../docs/development.md), then run from the
repository root:

```bash
cp apps/tracker-dashboard/.env.example apps/tracker-dashboard/.env
pnpm build --filter=@repo/ui-kit
pnpm --filter tracker-dashboard dev
```

Configure the dashboard's `.env` using the
[environment variable reference](environment.md).

The UI kit exports built files. Build it before starting the dashboard alone;
use its [watch tasks](../../../packages/ui-kit/docs/commands.md) when editing
components alongside the app, or use root `pnpm dev` to start all dev tasks.

## Configuration

- `vite.config.ts`: React, Tailwind, SVG, and TanStack Router plugins; `@` and `@tests` aliases.
- `src/app/config/router`: typed router context.
- `src/app/config/i18n`: English/Ukrainian resources and i18next setup.
- `src/app/providers`: global provider composition.
- `vitest.config.ts`: jsdom tests and shared setup.

Tests use Testing Library and the MSW server in `tests/setup`. Add endpoint handlers there instead of calling a real backend.
