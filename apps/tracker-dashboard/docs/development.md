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

Utils live in `apps/tracker-dashboard/src/shared/model/data-access/`:
`query.ts` (`reatomQuery`), `mutation.ts` (`reatomMutation`), `async-list.ts` (`reatomAsyncList`).

### Choose the tool

- Server data shown in UI → `reatomQuery`. Tables with filters/pagination → `reatomAsyncList`.
  Server writes with UI status → `reatomMutation`. Everything else → `atom` / `computed` / `action`.
- Create queries, mutations and lists at module level only, never inside components or render.

### Reatom basics

- Give every atom/computed/action a unique name (last argument).
- Every `await` inside actions and tests → `await wrap(...)`.
- Components that read atoms → `reatomComponent(render, 'Name')`. Event handlers → `wrap(...)`.
- Custom action with abort + status: `.extend(withAbort(...), withAsync(...))` (`withAbort` first,
  otherwise `status().isPending` stays `true` after `abort()`).
- Never use `any`.

### reatomQuery

- No input: `reatomQuery({ name, queryFn: ({ signal }) => api.x({ signal }) })`.
- With input: `reatomQuery({ name, key, queryFn: (arg, { signal }) => ... })`.
  - Put all request inputs in ONE argument. Write the key explicitly and include EVERY field:
    ``key: ({ teacherId, semester }) => `${teacherId}:${semester}` ``.
  - A missing field merges different requests into one instance (semester 2 would show semester 1 data).
- `queryFn` is IO only: atoms read inside are NOT tracked. Add reactivity by composition:
  `computed(() => query(input()))`.
- Always pass `signal` to `fetch`.
- Options: `initState` (removes `undefined` from `data()`). Keyed only: `scope` (resets all instances
  when it changes; return a primitive), `ttl` (ms an instance is kept without subscribers; default
  5 min; `Infinity` = forever).
- Instance: `data()`, `ready()`, `error()`, `status()`, `retry()` (refetch now),
  `invalidate()` (now if subscribed, otherwise on next subscription), `abort()`.
- Keyed: `query(arg)`, `find(arg)` (never creates), `invalidate()`, `clear()`, `invalidateOn()`.
- Requests start lazily on first subscription; one instance = one shared request.
  Returning to an already loaded input shows data without a request.
- Calling `query(arg)` in render is fine. In actions/mutations never call `query(arg)` just to
  refresh (it creates and loads an instance) → use `find(arg)?.invalidate()` or `invalidateOn`.

### Invalidation

- Declare it in the query module, once, at module level:
  - `query.invalidateOn(mutation)` → invalidates everything;
  - `keyed.invalidateOn(mutation, (result, ...args) => [arg])` → only listed inputs. Always
    return an array. Missing instances are not created.
- Fires on success only. Works with any action extended with `withAsync`. Returns an unsubscribe.
- `onSuccess` is for side effects only (toast, navigation), never for invalidation.
- Queries import mutations, never the reverse.

### reatomMutation

- `reatomMutation({ name, mutationFn: (...args) => api.x(...args), onSuccess?, abort? })`.
- Calling it returns `Promise<TResult>`. `ready()` / `error()` / `status()` are shared across calls.
- In async handlers: `await wrap(mutation(...))`. Prevent double submit with `disabled={!mutation.ready()}`.
- Unmounting a component does not cancel a mutation.

### Cancellation (all optional)

- Query/list: a loading instance that loses all subscribers (unmount, input switch) is aborted
  automatically and restarts when a subscriber returns. `retry()` / `invalidate()` during loading
  restart the request. `clear()` / `scope` change abort pending requests of old instances.
- Manual `query.abort()` does NOT auto-restart; call `retry()` or `invalidate()`.
- Abort is not an error: `error()` stays empty, `ready()` becomes `true`, `data()` keeps the previous value.
- Mutation `abort` option: `'last-in-win'` (a new call aborts the previous one) or `'manual'`
  (`abort()` cancels all running calls). Get the signal via `abortVar.require().signal`, which works
  only with the `abort` option (otherwise "Variable is not set").
- An aborted mutation call: promise rejects, `onSuccess` / `invalidateOn` don't fire, no unhandled rejection.
- Never use `'first-in-win'`: in Reatom 1001.3.0 the ignored call throws synchronously.
- React StrictMode (dev only): reading `ready()` keeps the previous instance connected when a
  component switches inputs. For switching instances check `status().isPending` instead.

### reatomAsyncList

- `reatomAsyncList<Filters, Data, Params?>({ defaultFilters, initState, params?, ttl?,
queryFn: ({ filters, params }, { signal }) => ... }, 'name')`.
- Returns: `data`, `status`, `ready`, `error`, `filter`, `setFilter`, `invalidate`, `invalidateOn`, `abort`.
- Change filters only via `setFilter`:
  - changing any field except `page` resets `page` to 1;
  - an explicit `page` wins;
  - no-op updates are ignored;
  - `undefined` clears a field.
- Each filter combination is a cached instance. Previous rows stay visible while a page loads.
  Fast typing aborts stale requests.
- A `params` change resets filters to `defaultFilters` with exactly one request. Filters set before
  the first mount are kept. `filters` and `params` must be JSON-serializable (field order does not matter).

### Do NOT use the utils for

- Data needed only inside an action → `await wrap(api.x())` in a plain `action`.
- Multi-step flows → one `action` + `withAsync` (it can still be an `invalidateOn` source),
  not chained mutations.
- Fire-and-forget (analytics, logging) → plain `action`.
- Local/derived state → `atom` / `computed`. Server push (WebSocket/SSE) → `atom` + `withConnectHook`.
  Forms → `reatomForm` `submit`.

### Testing (vitest)

```ts
export const test = (name: string, fn: () => unknown) =>
  viTest(name, () => context.start(fn));
export const subscribe = <T>(target: AtomLike<T>) => {
  const spy = vi.fn<(state: T) => void>();
  return Object.assign(spy, { unsubscribe: target.subscribe(spy) });
};
```

- Run every test in `context.start` (helper above). State, including keyed registries, is per context.
- Every `await` in a test → `await wrap(...)`; otherwise the context is silently lost.
- Queries are lazy: subscribe (`subscribe(query.data)`) to trigger requests.
- Mock the API layer (`vi.spyOn(api, ...)`). Don't use Reatom `mock()` on mutations (it fails).
- Prefer fake timers: `vi.useFakeTimers()` + `await wrap(vi.advanceTimersByTimeAsync(ms))`.
  `ttl` uses `Date.now()` → control it with `vi.setSystemTime`.
- Unsubscribe is processed asynchronously: advance by 0 ms before asserting abort or `ttl`.
- Mutation `status()`:
  - it settles one tick after the promise;
  - under fake timers it never reaches `isFulfilled`.
    → Assert mutation `status()` with real timers + `await wrap(sleep(0))`. Under fake timers assert
    `ready()`, `error()` and the promise result. Queries and lists are unaffected.
- Assert cancellation via `signal.aborted` taken from the mock call arguments.
- React tests: subscriptions happen in effects flushed when `act` ends, so trigger and wait in
  separate `act` calls. For a custom context use `reatomContext.Provider value={context.start()}`
  and `wrap` handlers.
