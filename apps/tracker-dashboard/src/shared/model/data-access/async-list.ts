import {
  type Action,
  type Atom,
  type Computed,
  type Unsubscribe,
  action,
  atom,
  computed,
  isDeepEqual,
  peek,
  withChangeHook,
} from '@reatom/core';

import {
  type InvalidationSource,
  type QueryAtom,
  type QueryContext,
  reatomQuery,
} from './query';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** `JSON.stringify` replacer: sorts object keys so equal filters give the same cache key. */
const sortKeys = (_key: string, value: unknown): unknown => {
  if (!isRecord(value)) return value;

  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(value).sort()) sorted[key] = value[key];
  return sorted;
};

/** Required pagination fields for list filters. */
export interface AsyncListPagination {
  page: number;
  pageSize: number;
}

/** Input passed to `queryFn` on each request. */
export interface AsyncListInput<TFilters, TParams> {
  /** Current table filters. */
  filters: TFilters;
  /** Current value of the external `params()`. */
  params: TParams;
}

/** List options. */
export interface AsyncListOptions<
  TFilters extends AsyncListPagination,
  TData,
  TParams = void,
> {
  /** Initial filters, also restored when `params` change. */
  defaultFilters: TFilters;
  /** Initial value of `data()`. */
  initState: TData;
  /**
   * External reactive inputs, e.g. the selected faculty. Read atoms synchronously.
   * When the value changes, filters reset to `defaultFilters`.
   */
  params?: () => TParams;
  /**
   * Fetch a page. IO only: atoms read here are not tracked.
   * `filters` and `params` must be JSON-serializable: they form the cache key
   * (field order does not matter).
   */
  queryFn: (
    input: AsyncListInput<TFilters, TParams>,
    ctx: QueryContext,
  ) => Promise<TData>;
  /** How long a page without subscribers stays cached, in ms. Defaults to 5 min. */
  ttl?: number;
}

/** List model. */
export interface AsyncListResult<TFilters extends AsyncListPagination, TData> {
  /** Current page data. Previous data is preserved while a new page loads. */
  data: Computed<TData>;
  /** Detailed status of the current page request (`isPending`, etc.). */
  status: Computed<ReturnType<QueryAtom<TData, TData>['status']>>;
  /** `false` while the current page is loading. */
  ready: Computed<boolean>;
  /** Latest error of the current page request. */
  error: Computed<Error | undefined>;
  /** Current filters. Update them through `setFilter`. */
  filter: Atom<TFilters>;
  /**
   * Partially update filters. Changing a field other than `page` resets it to 1.
   * An explicit `page` takes precedence. Unchanged values have no effect;
   * `undefined` clears a field.
   */
  setFilter: Action<[update: Partial<TFilters>], TFilters>;
  /** Refetch the current page; other cached pages reload when shown again. */
  invalidate: Action<[], void>;
  /**
   * Invalidate the list after every successful `source` call.
   * Call once at module level.
   * @returns Function that removes the subscription.
   */
  invalidateOn: <TArgs extends unknown[], TResult>(
    source: InvalidationSource<TArgs, TResult>,
  ) => Unsubscribe;
  /** Cancel the current page request. */
  abort: Action<[], void>;
}

/**
 * A paginated, filterable list built on a keyed `reatomQuery`:
 * every filter combination is a separate cached instance.
 * @param options {@link AsyncListOptions}
 * @param name Name for devtools and logs.
 * @returns {@link AsyncListResult}
 * @example
 * const teachersList = reatomAsyncList<TeacherFilters, Page<Teacher>>({
 *   defaultFilters: { page: 1, pageSize: 20 },
 *   initState: { items: [], total: 0 },
 *   queryFn: ({ filters }, { signal }) => api.teachers(filters, { signal }),
 * }, 'teachersList');
 */
export function reatomAsyncList<
  TFilters extends AsyncListPagination,
  TData,
  TParams = void,
>(
  {
    defaultFilters,
    initState,
    params,
    queryFn,
    ttl,
  }: AsyncListOptions<TFilters, TData, TParams>,
  name: string,
): AsyncListResult<TFilters, TData> {
  const filter = atom<TFilters>(defaultFilters, `${name}.filter`);

  const external = computed(
    () => ({ value: params?.() as TParams }),
    `${name}.params`,
  );

  if (params) {
    external.extend(
      withChangeHook((next, prev) => {
        if (!prev || isDeepEqual(next.value, prev.value)) return;
        filter.set(defaultFilters);
      }),
    );
  }

  const query = reatomQuery({
    name: `${name}.query`,
    key: (input) => JSON.stringify(input, sortKeys),
    queryFn,
    initState,
    ttl,
  });

  const current = computed(
    () => query({ filters: filter(), params: external().value }),
    `${name}.current`,
  );

  const status = computed(() => current().status(), `${name}.status`);

  const data = computed((previous?: TData) => {
    const page = current();
    return status().isPending && previous !== undefined
      ? previous
      : page.data();
  }, `${name}.data`);

  const setFilter = action((update: Partial<TFilters>) => {
    return filter.set((state) => {
      const changed = (Object.keys(update) as Array<keyof TFilters>).filter(
        (key) => !isDeepEqual(update[key], state[key]),
      );
      if (changed.length === 0) return state;

      const filtersChanged = changed.some((key) => key !== 'page');

      return {
        ...state,
        ...update,
        page: update.page ?? (filtersChanged ? 1 : state.page),
      };
    });
  }, `${name}.setFilter`);

  return {
    data,
    status,
    ready: computed(() => !status().isPending, `${name}.ready`),
    error: computed(() => current().error(), `${name}.error`),
    filter,
    setFilter,
    invalidate: action(() => query.invalidate(), `${name}.invalidate`),
    invalidateOn: (source) => query.invalidateOn(source),
    abort: action(() => {
      peek(current).abort();
    }, `${name}.abort`),
  };
}
