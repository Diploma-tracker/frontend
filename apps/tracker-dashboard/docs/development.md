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

## Usage of Reatom state manager

Use the data-access utilities from `@/shared/model` for server data displayed in
the UI. Choose the utility by its purpose:

| Task                                                     | Tool                           |
| -------------------------------------------------------- | ------------------------------ |
| Read server data with caching and request status         | `reatomQuery`                  |
| Read the same entity type for multiple IDs independently | `reatomQuery` with `key`       |
| Display a table with pagination and filters              | `reatomAsyncList`              |
| Change server data with status in the UI                 | `reatomMutation`               |
| Manage other state or workflows                          | `action` / `atom` / `computed` |

### Rules

1. Read reactive request inputs **synchronously in `params`**. Keep `fetcher`
   limited to the request, using the supplied inputs; atom reads there are not
   tracked.
2. Pass the supplied `signal` to every query/list request so obsolete requests
   are actually cancelled.
3. Use `cacheAtom.invalidate()` to force a fresh request. `retry()` may reuse
   cached data. For a keyed query, use `query.invalidate()` to invalidate all
   instances: visible ones refetch, while hidden ones are evicted.
4. In mutation `onSuccess`, invalidate an existing keyed instance with
   `query.find(id)?.cacheAtom.invalidate()`. Do not call `query(id)` there: it
   creates an instance if none exists.
5. Wrap event handlers in `reatomComponent` with `wrap`. In async actions, use
   `await wrap(promise)` to preserve Reatom context across awaits.

For lists, update filters through `setFilter`. Changing a filter other than
`page` resets the page to `1` unless an explicit page is supplied. Changes to
external `params` restore `defaultFilters`.

### When to use plain Reatom primitives

These utilities are not a general wrapper for every async operation:

- **Data used only inside an action:** await the request in that action; do not
  create a query. Add `withAsync({ status: true })` only if the UI needs status.
- **Multi-step workflows:** use one async action that awaits each step, then
  invalidates affected queries. Avoid chains of mutations calling one another
  through `onSuccess`.
- **Analytics or logging without UI status:** use a plain action and handle any
  async failures.
- **Local or derived state:** use `atom` / `computed` for dialogs, selected tabs,
  totals, and similar values.
- **Server-pushed data (WebSocket/SSE):** use `atom` with `withConnectHook` to
  manage the subscription lifecycle.
- **Forms:** use `reatomForm`'s submit status and error handling; do not wrap its
  submit in a mutation.

`reatomMutation` combines `action`, `withAsync({ status: true })`, and an optional
`onSuccess` hook, with optional cancellation support. If neither the hook nor
cancellation is needed, an action extended with `withAsync({ status: true })`
is sufficient.
