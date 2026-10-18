import {
  type Action,
  type AsyncDataExt,
  type CacheAtom,
  type Computed,
  type WithCacheOptions,
  abortVar,
  action,
  atom,
  computed,
  isConnected,
  peek,
  withAsyncData,
  withCache,
  withConnectHook,
  wrap,
} from '@reatom/core';

/** Context passed to `fetcher` on each request. */
export interface QueryContext<TParams> {
  /** Value of `params()` for this request. */
  params: TParams;
  /** Aborted when the request becomes obsolete. Pass this signal to `fetch`. */
  signal: AbortSignal;
}

interface BaseQueryOptions<TData, TParams> {
  /** Name for devtools and logs. */
  name: string;
  /**
   * Reactive inputs. Read atoms synchronously and only here.
   * Changes restart the request, and the returned value is the cache key.
   */
  params?: () => TParams;
  /** Initial value of `data()`. When provided, `data()` excludes `undefined`. */
  initState?: TData;
  /** `withCache` options: `length`, `staleTime`, `swr`, etc. */
  cache?: WithCacheOptions;
}

/** Single query options. */
export interface QueryOptions<TData, TParams = void> extends BaseQueryOptions<
  TData,
  TParams
> {
  /** Server request. IO only: atoms read here are not tracked. */
  fetcher: (ctx: QueryContext<TParams>) => Promise<TData>;
  key?: never;
  scope?: never;
  gcTime?: never;
}

/** Keyed query options: a separate instance for each key. */
export interface KeyedQueryOptions<
  TArg,
  TData,
  TParams = void,
> extends BaseQueryOptions<TData, TParams> {
  /** String key for the argument. Must fully identify what `fetcher` loads. */
  key: (arg: TArg) => string;
  /** Request for a specific argument. IO only. */
  fetcher: (arg: TArg, ctx: QueryContext<TParams>) => Promise<TData>;
  /** All instances reset when this value changes. Return a primitive. */
  scope?: () => unknown;
  /** Retention time without subscribers, in ms. Defaults to 5 min; `Infinity` keeps instances forever. */
  gcTime?: number;
}

type QueryComputed<TData> = Computed<Promise<TData>>;

/**
 * Query atom:
 * - `data()` holds the data; `ready()` is `false` while loading;
 *   `error()` holds the latest error.
 * - `status()` provides detailed state (`isPending`, `isSWR`, etc.).
 * - `cacheAtom.invalidate()` clears the cache and refetches.
 * - `retry()` restarts the query and may reuse cached data.
 * - `abort()` cancels the current request.
 */
export type QueryAtom<TData, TInit = undefined> = QueryComputed<TData> &
  AsyncDataExt<[], TData, TData, TInit, Error | undefined> & {
    cacheAtom: CacheAtom<QueryComputed<TData>>;
  };

/** Keyed query. Calling `query(arg)` returns the {@link QueryAtom} for that key. */
export type KeyedQuery<TArg, TData, TInit = undefined> = ((
  arg: TArg,
) => QueryAtom<TData, TInit>) & {
  /** Existing instance or `undefined`. Creates nothing; intended for mutations. */
  find: (arg: TArg) => QueryAtom<TData, TInit> | undefined;
  /** Refetch visible instances now; evict hidden ones to reload when shown. */
  invalidate: Action<[], void>;
  /** Remove all instances. Visible components receive new ones. */
  clear: Action<[], void>;
};

function reatomSingleQuery<TData, TParams>(
  options: Omit<QueryOptions<TData, TParams>, 'key' | 'scope' | 'gcTime'>,
): QueryAtom<TData>;
function reatomSingleQuery<TData, TParams>({
  name,
  params,
  fetcher,
  initState,
  cache,
}: Omit<QueryOptions<TData, TParams>, 'key' | 'scope' | 'gcTime'>) {
  return computed(async () => {
    const currentParams = params?.() as TParams;

    await wrap(Promise.resolve());

    return await wrap(
      fetcher({ params: currentParams, signal: abortVar.require().signal }),
    );
  }, name).extend(withAsyncData({ initState, status: true }), withCache(cache));
}

function reatomKeyedQuery<TArg, TData, TParams>(
  options: KeyedQueryOptions<TArg, TData, TParams>,
): KeyedQuery<TArg, TData> {
  const { name, key, fetcher, scope, gcTime = 5 * 60_000, ...rest } = options;
  type Instance = QueryAtom<TData>;

  const generation = atom(0, `${name}._generation`);

  const registry = computed(() => {
    generation();
    scope?.();
    return new Map<string, Instance>();
  }, `${name}._registry`);

  const create = (map: Map<string, Instance>, id: string, arg: TArg) => {
    let evictTimer: ReturnType<typeof setTimeout> | undefined;

    const instance: Instance = reatomSingleQuery<TData, TParams>({
      ...rest,
      name: `${name}#${id}`,
      fetcher: (ctx) => fetcher(arg, ctx),
    }).extend(
      withConnectHook(() => {
        clearTimeout(evictTimer);
        return () => {
          if (gcTime === Infinity) return;
          evictTimer = setTimeout(() => {
            if (map.get(id) === instance) map.delete(id);
          }, gcTime);
        };
      }),
    );

    map.set(id, instance);
    return instance;
  };

  const query = (arg: TArg): Instance => {
    const map = registry();
    const id = key(arg);
    return map.get(id) ?? create(map, id, arg);
  };

  return Object.assign(query, {
    find: (arg: TArg) => peek(registry).get(key(arg)),
    invalidate: action(() => {
      const map = peek(registry);
      for (const [id, instance] of map) {
        if (isConnected(instance)) instance.cacheAtom.invalidate();
        else map.delete(id);
      }
    }, `${name}.invalidate`),
    clear: action(() => {
      generation.set((n) => n + 1);
    }, `${name}.clear`),
  });
}

const isKeyed = <TArg, TData, TParams>(
  options:
    QueryOptions<TData, TParams> | KeyedQueryOptions<TArg, TData, TParams>,
): options is KeyedQueryOptions<TArg, TData, TParams> =>
  typeof options.key === 'function';

/**
 * Keyed query with `initState`: a separate instance for each key.
 * @param options {@link KeyedQueryOptions}
 * @returns {@link KeyedQuery}: `query(arg)`, `find`, `invalidate`, `clear`
 */
export function reatomQuery<TArg, TData, TParams = void>(
  options: KeyedQueryOptions<TArg, TData, TParams> & { initState: TData },
): KeyedQuery<TArg, TData, TData>;
/**
 * Keyed query: a separate instance for each key.
 * @param options {@link KeyedQueryOptions}
 * @returns {@link KeyedQuery}: `query(arg)`, `find`, `invalidate`, `clear`
 * @example
 * const teacherById = reatomQuery({
 *   name: 'teacherById',
 *   key: (id: string) => id,
 *   fetcher: (id, { signal }) => api.teacher(id, { signal }),
 * });
 */
export function reatomQuery<TArg, TData, TParams = void>(
  options: KeyedQueryOptions<TArg, TData, TParams>,
): KeyedQuery<TArg, TData>;
/**
 * Single query with `initState`: `data()` excludes `undefined`.
 * @param options {@link QueryOptions}
 * @returns {@link QueryAtom}
 */
export function reatomQuery<TData, TParams = void>(
  options: QueryOptions<TData, TParams> & { initState: TData },
): QueryAtom<TData, TData>;
/**
 * Single query. The request starts on the first read in a component.
 * @param options {@link QueryOptions}
 * @returns {@link QueryAtom}
 * @example
 * const currentUser = reatomQuery({
 *   name: 'currentUser',
 *   fetcher: ({ signal }) => api.me({ signal }),
 * });
 */
export function reatomQuery<TData, TParams = void>(
  options: QueryOptions<TData, TParams>,
): QueryAtom<TData>;
export function reatomQuery<TArg, TData, TParams>(
  options:
    QueryOptions<TData, TParams> | KeyedQueryOptions<TArg, TData, TParams>,
) {
  return isKeyed(options)
    ? reatomKeyedQuery(options)
    : reatomSingleQuery(options);
}
