import {
  type Action,
  type AsyncDataExt,
  type AsyncExt,
  type Computed,
  type Unsubscribe,
  abortVar,
  action,
  addCallHook,
  atom,
  computed,
  isConnected,
  peek,
  withAsyncData,
  withConnectHook,
  wrap,
} from '@reatom/core';

/** Context passed to `queryFn` on each request. */
export interface QueryContext {
  /** Aborted when the request becomes obsolete. Pass this signal to `fetch`. */
  signal: AbortSignal;
}

/** Any async action with `onFulfill`, e.g. a `reatomMutation`. */
export type InvalidationSource<TArgs extends unknown[], TResult> = Pick<
  AsyncExt<TArgs, TResult, unknown>,
  'onFulfill'
>;

interface BaseQueryOptions<TInit> {
  /** Name for devtools and logs. */
  name: string;
  /** Initial value of `data()`. When provided, `data()` excludes `undefined`. */
  initState?: TInit;
}

/** Single query options. */
export interface QueryOptions<
  TData,
  TInit extends TData | undefined = undefined,
> extends BaseQueryOptions<TInit> {
  /** Server request. IO only: atoms read here are not tracked. */
  queryFn: (ctx: QueryContext) => Promise<TData>;
  key?: never;
  scope?: never;
  ttl?: never;
}

/** Keyed query options: a separate instance for each key. */
export interface KeyedQueryOptions<
  TArg,
  TData,
  TInit extends TData | undefined = undefined,
> extends BaseQueryOptions<TInit> {
  /**
   * String key for the argument. Must include every field the request depends on,
   * e.g. both `teacherId` and `semester` for `{ teacherId, semester }`.
   */
  key: (arg: TArg) => string;
  /** Request for a specific argument. IO only: atoms read here are not tracked. */
  queryFn: (arg: TArg, ctx: QueryContext) => Promise<TData>;
  /** All instances reset when this value changes. Return a primitive. */
  scope?: () => unknown;
  /**
   * How long an instance without subscribers is kept, in ms, counted from the
   * moment its last subscriber left. Defaults to 5 min; `Infinity` keeps instances forever.
   */
  ttl?: number;
}

type QueryComputed<TData> = Computed<Promise<TData>>;

/**
 * Query atom:
 * - `data()` holds the data; `ready()` is `false` while loading;
 *   `error()` holds the latest error.
 * - `status()` provides detailed state (`isPending`, etc.).
 * - `retry()` refetches now.
 * - `invalidate()` refetches now if subscribed, otherwise on the next subscription.
 * - `abort()` cancels the current request.
 *
 * A pending request is aborted when the last subscriber leaves and restarts
 * when a subscriber returns.
 */
export type QueryAtom<TData, TInit = undefined> = QueryComputed<TData> &
  AsyncDataExt<[], TData, TData, TInit, Error | undefined> & {
    invalidate: Action<[], void>;
  };

/** Single query: a {@link QueryAtom} that can subscribe to mutations. */
export type SingleQuery<TData, TInit = undefined> = QueryAtom<TData, TInit> & {
  /**
   * Invalidate the query after every successful `source` call.
   * Call once at module level.
   * @returns Function that removes the subscription.
   */
  invalidateOn: <TArgs extends unknown[], TResult>(
    source: InvalidationSource<TArgs, TResult>,
  ) => Unsubscribe;
};

/** Keyed query. Calling `query(arg)` returns the {@link QueryAtom} for that key. */
export type KeyedQuery<TArg, TData, TInit = undefined> = ((
  arg: TArg,
) => QueryAtom<TData, TInit>) & {
  /** Existing instance or `undefined`. Creates nothing. */
  find: (arg: TArg) => QueryAtom<TData, TInit> | undefined;
  /** Invalidate every instance. */
  invalidate: Action<[], void>;
  /** Remove all instances. Subscribed components receive new ones. */
  clear: Action<[], void>;
  /**
   * Invalidate instances after every successful `source` call.
   * Call once at module level.
   * @param source Mutation or another async action.
   * @param select Returns the arguments whose instances to invalidate.
   *   Without it, every instance is invalidated.
   * @returns Function that removes the subscription.
   */
  invalidateOn: <TArgs extends unknown[], TResult>(
    source: InvalidationSource<TArgs, TResult>,
    select?: NoInfer<(result: TResult, ...args: TArgs) => readonly TArg[]>,
  ) => Unsubscribe;
};

function createQueryAtom<TData>(
  name: string,
  queryFn: (ctx: QueryContext) => Promise<TData>,
  initState: TData | undefined,
): QueryAtom<TData>;
function createQueryAtom<TData>(
  name: string,
  queryFn: (ctx: QueryContext) => Promise<TData>,
  initState: TData | undefined,
) {
  const needsRefetch = atom(false, `${name}._needsRefetch`);

  const target = computed(async () => {
    await wrap(Promise.resolve());
    return await wrap(queryFn({ signal: abortVar.require().signal }));
  }, name).extend(withAsyncData({ initState, status: true }));

  const refetch = () => {
    target.retry().catch(() => {});
  };

  return target.extend(
    withConnectHook(() => {
      if (peek(needsRefetch)) {
        needsRefetch.set(false);
        refetch();
      }
      return () => {
        if (peek(target.ready)) return;
        needsRefetch.set(true);
        target.abort('idle');
      };
    }),
    () => ({
      invalidate: action(() => {
        if (isConnected(target)) refetch();
        else needsRefetch.set(true);
      }, `${name}.invalidate`),
    }),
  );
}

function reatomSingleQuery<TData>({
  name,
  queryFn,
  initState,
}: QueryOptions<TData, TData | undefined>): SingleQuery<TData> {
  const query = createQueryAtom(name, queryFn, initState);

  return Object.assign(query, {
    invalidateOn: <TArgs extends unknown[], TResult>(
      source: InvalidationSource<TArgs, TResult>,
    ) => addCallHook(source.onFulfill, () => query.invalidate()),
  });
}

function reatomKeyedQuery<TArg, TData>({
  name,
  key,
  queryFn,
  initState,
  scope,
  ttl = 5 * 60_000,
}: KeyedQueryOptions<TArg, TData, TData | undefined>): KeyedQuery<TArg, TData> {
  interface Entry {
    instance: QueryAtom<TData>;
    idleSince: number | null;
  }

  const generation = atom(0, `${name}._generation`);

  const registry = computed(() => {
    generation();
    scope?.();
    return new Map<string, Entry>();
  }, `${name}._registry`);

  const evictIdle = (map: Map<string, Entry>) => {
    if (ttl === Infinity) return;
    const now = Date.now();
    for (const [id, entry] of map) {
      if (entry.idleSince !== null && now - entry.idleSince >= ttl) {
        map.delete(id);
      }
    }
  };

  const create = (map: Map<string, Entry>, id: string, arg: TArg) => {
    evictIdle(map);

    const instance = createQueryAtom(
      `${name}#${id}`,
      (ctx) => queryFn(arg, ctx),
      initState,
    );
    const entry: Entry = { instance, idleSince: Date.now() };

    instance.extend(
      withConnectHook(() => {
        entry.idleSince = null;
        return () => {
          entry.idleSince = Date.now();
        };
      }),
    );

    map.set(id, entry);
    return instance;
  };

  const query = (arg: TArg): QueryAtom<TData> => {
    const map = registry();
    const id = key(arg);
    return map.get(id)?.instance ?? create(map, id, arg);
  };

  const find = (arg: TArg) => peek(registry).get(key(arg))?.instance;

  const invalidate = action(() => {
    for (const { instance } of peek(registry).values()) instance.invalidate();
  }, `${name}.invalidate`);

  return Object.assign(query, {
    find,
    invalidate,
    clear: action(() => {
      generation.set((n) => n + 1);
    }, `${name}.clear`),
    invalidateOn: <TArgs extends unknown[], TResult>(
      source: InvalidationSource<TArgs, TResult>,
      select?: NoInfer<(result: TResult, ...args: TArgs) => readonly TArg[]>,
    ) =>
      addCallHook(source.onFulfill, ({ payload, params }) => {
        if (!select) return invalidate();
        for (const arg of select(payload, ...params)) find(arg)?.invalidate();
      }),
  });
}

const isKeyed = <TArg, TData>(
  options:
    | QueryOptions<TData, TData | undefined>
    | KeyedQueryOptions<TArg, TData, TData | undefined>,
): options is KeyedQueryOptions<TArg, TData, TData | undefined> =>
  typeof options.key === 'function';

/**
 * Keyed query: a separate instance for each key.
 * With `initState`, `data()` excludes `undefined`.
 * @param options {@link KeyedQueryOptions}
 * @returns {@link KeyedQuery}: `query(arg)`, `find`, `invalidate`, `invalidateOn`, `clear`
 * @example
 * const teacherById = reatomQuery({
 *   name: 'teacherById',
 *   key: (id: string) => id,
 *   queryFn: (id, { signal }) => api.teacher(id, { signal }),
 * });
 */
export function reatomQuery<
  TArg,
  TData,
  TInit extends TData | undefined = undefined,
>(
  options: KeyedQueryOptions<TArg, TData, TInit>,
): KeyedQuery<TArg, TData, TInit>;
/**
 * Single query. The request starts on the first subscription.
 * With `initState`, `data()` excludes `undefined`.
 * @param options {@link QueryOptions}
 * @returns {@link SingleQuery}
 * @example
 * const currentUser = reatomQuery({
 *   name: 'currentUser',
 *   queryFn: ({ signal }) => api.me({ signal }),
 * });
 */
export function reatomQuery<TData, TInit extends TData | undefined = undefined>(
  options: QueryOptions<TData, TInit>,
): SingleQuery<TData, TInit>;
export function reatomQuery<TArg, TData>(
  options:
    | QueryOptions<TData, TData | undefined>
    | KeyedQueryOptions<TArg, TData, TData | undefined>,
) {
  return isKeyed(options)
    ? reatomKeyedQuery(options)
    : reatomSingleQuery(options);
}
