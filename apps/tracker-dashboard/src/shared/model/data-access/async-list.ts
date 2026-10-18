import {
  type Action,
  type Atom,
  type WithCacheOptions,
  action,
  atom,
  computed,
  isDeepEqual,
  withChangeHook,
} from '@reatom/core';

import { type QueryAtom, reatomQuery } from './query';

/** Required pagination fields for list filters. */
export interface AsyncListPagination {
  page: number;
  pageSize: number;
}

/** Context passed to `fetcher` on each request. */
export interface AsyncListContext<TFilters, TParams> {
  /** Current table filters. */
  filters: TFilters;
  /** Current value of the external `params()`. */
  params: TParams;
  /** Aborted when the request becomes obsolete. Pass this signal to `fetch`. */
  signal: AbortSignal;
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
  /** `withCache` options. Caches 5 filter combinations by default. */
  cache?: WithCacheOptions;
  /**
   * External reactive inputs. Read atoms synchronously and only here.
   * When the value changes, filters reset to `defaultFilters`.
   */
  params?: () => TParams;
  /** Fetch a page. IO only: atoms read here are not tracked. */
  fetcher: (ctx: AsyncListContext<TFilters, TParams>) => Promise<TData>;
}

/** List model. */
export interface AsyncListResult<TFilters extends AsyncListPagination, TData> {
  /** Current page data. Previous data is preserved while loading. */
  data: QueryAtom<TData, TData>['data'];
  /** Detailed request status (`isPending`, etc.). */
  status: QueryAtom<TData, TData>['status'];
  /** Current filters. Update them through `setFilter`. */
  filter: Atom<TFilters>;
  /**
   * Partially update filters. Changing any field except `page` resets it to 1.
   * An explicit `page` takes precedence. Unchanged values have no effect;
   * `undefined` clears a field.
   */
  setFilter: Action<[update: Partial<TFilters>], TFilters>;
  /** Page cache. `cacheAtom.invalidate()` refetches the current page. */
  cacheAtom: QueryAtom<TData, TData>['cacheAtom'];
  /** Underlying query with `abort()`, `ready()`, `error()`, etc. */
  query: QueryAtom<TData, TData>;
}

/**
 * A paginated, filterable list built on `reatomQuery`.
 * @param options {@link AsyncListOptions}
 * @param name Name for devtools and logs.
 * @returns {@link AsyncListResult}
 * @example
 * const teachersList = reatomAsyncList<TeacherFilters, Page<Teacher>>({
 *   defaultFilters: { page: 1, pageSize: 20 },
 *   initState: { items: [], total: 0 },
 *   fetcher: ({ filters, signal }) => api.teachers(filters, { signal }),
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
    cache,
    params,
    fetcher,
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
    params: () => ({ filters: filter(), params: external().value }),
    fetcher: ({ params: input, signal }) => fetcher({ ...input, signal }),
    initState,
    cache,
  });

  const setFilter = action((update: Partial<TFilters>) => {
    return filter.set((current) => {
      const changed = (Object.keys(update) as Array<keyof TFilters>).filter(
        (key) => !isDeepEqual(update[key], current[key]),
      );
      if (changed.length === 0) return current;

      const filtersChanged = changed.some((key) => key !== 'page');

      return {
        ...current,
        ...update,
        page: update.page ?? (filtersChanged ? 1 : current.page),
      };
    });
  }, `${name}.setFilter`);

  return {
    data: query.data,
    status: query.status,
    filter,
    setFilter,
    cacheAtom: query.cacheAtom,
    query,
  };
}
