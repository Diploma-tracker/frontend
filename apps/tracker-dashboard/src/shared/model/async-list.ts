import { action, atom, withAsyncData, wrap } from '@reatom/core';

const DEFAULT_FILTERS = {
  page: 1,
  pageSize: 10,
} as AsyncListPagination;

export type AsyncListCreationOptions<TFetchParams, TData, TFilters extends AsyncListPagination> = {
  fetch: (params: TFetchParams, filters: TFilters) => Promise<TData>;
  defaultFilters?: TFilters;
  noParams?: boolean;
};

export type AsyncListPagination = {
  page: number;
  pageSize: number;
};

export function asyncList<
  TFilters extends AsyncListPagination = AsyncListPagination,
  TFetchParams = unknown,
  TData = unknown,
>({ fetch, defaultFilters, noParams = false }: AsyncListCreationOptions<TFetchParams, TData, TFilters>, name: string) {
  const filterAtom = atom<TFilters>(defaultFilters || (DEFAULT_FILTERS as TFilters), `${name}FilterAtom`);
  const lastParamsAtom = atom<TFetchParams | null>(null, `${name}LastParamsAtom`);

  const fetchDataAction = action(async (params: TFetchParams) => {
    lastParamsAtom.set(params);
    const filters = filterAtom();
    return await wrap(fetch(params, filters));
  }, `${name}FetchDataAction`).extend(withAsyncData({ status: true }));

  const setFilterAction = action((update: Partial<TFilters>) => {
    const current = filterAtom();
    // Reset to page 1 when any filter other than page changes
    const isPageChange = Object.keys(update).every((k) => k === 'page');
    filterAtom.set({
      ...current,
      ...update,
      page: isPageChange ? (update.page ?? current.page) : 1,
    });

    const lastParams = lastParamsAtom();
    if (noParams) {
      fetchDataAction(undefined as TFetchParams);
    } else if (lastParams !== null) {
      fetchDataAction(lastParams);
    }
  }, `${name}SetFilterAction`);

  return {
    data: fetchDataAction.data,
    status: fetchDataAction.status,
    filter: filterAtom,
    fetch: fetchDataAction,
    setFilter: setFilterAction,
  };
}
