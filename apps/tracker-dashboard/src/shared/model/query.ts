import { useEffect } from 'react';

import { action, atom, wrap } from '@reatom/core';

import type { RequiredDefined } from '../utils/types';

export interface QueryOptions<TParams, TResult> {
  // TODO: improve query types to avoid null if placeholder is used
  placeholder?: TResult;
  getKey?: (params: TParams) => string;
  ttl?: number;
}

export interface QueryInstance<TParams, TResult> {
  data: () => TResult | null;
  status: () => DataStatus;
  getByKey: (params: TParams) => TResult | null;
  fetch: () => Promise<void>;
  revalidate: () => Promise<void>;
  _options: RequiredDefined<QueryOptions<TParams, TResult>, 'getKey'>;
}

type DataStatus = 'idle' | 'loading' | 'error';

export type Query<TParams, TResult> = (
  params: TParams,
) => QueryInstance<TParams, TResult>;

const DEFAULT_OPTIONS: Partial<QueryOptions<unknown, unknown>> = {
  getKey: (params: unknown) => JSON.stringify(params),
  placeholder: null,
};

export const query = <TParams, TResult>(
  fetcher: (params: TParams) => Promise<TResult>,
  name: string,
  options?: QueryOptions<TParams, TResult>,
): Query<TParams, TResult> => {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...(options ?? {}) } as Required<
    QueryOptions<TParams, TResult>
  >;
  const { getKey, placeholder, ttl } = mergedOptions;

  const createExpiresAt = () => (ttl ? Date.now() + ttl : null);
  const isExpired = (expiresAt: number | null) =>
    expiresAt !== null && Date.now() > expiresAt;

  type CacheAtomData = {
    data: TResult | null;
    expiresAt: number | null;
    status: DataStatus;
  };

  const createCacheAtom = (key: string) => {
    const initState = {
      data: null,
      expiresAt: Date.now() - 1000,
      status: 'idle',
    } as CacheAtomData;

    return atom<CacheAtomData>(initState, `${name}.cacheAtom.${key}`).extend(
      (target) => ({
        isValid: () => !isExpired(target().expiresAt),
        setLoading: () => {
          target.set((prev) => ({ ...prev, status: 'loading' }));
        },
        setError: () => {
          target.set((prev) => ({ ...prev, status: 'error' }));
        },
        setNewData: (data: TResult) => {
          target.set({ data, expiresAt: createExpiresAt(), status: 'idle' });
        },
      }),
    );
  };

  type CacheAtom = ReturnType<typeof createCacheAtom>;

  const cacheAtoms = atom<Record<string, CacheAtom>>(
    {},
    `${name}.cacheAtoms`,
  ).extend((target) => ({
    get: (params: TParams) => {
      const key = getKey(params);

      const cacheAtom = target()[key];
      if (cacheAtom) {
        return cacheAtom;
      }

      const newCacheAtom = createCacheAtom(key);
      target.set((prev) => ({ ...prev, [key]: newCacheAtom }));

      return newCacheAtom;
    },
  }));

  const revalidateAction = action(async (params: TParams) => {
    const cacheAtom = cacheAtoms.get(params);
    try {
      const fetchData = wrap(fetcher(params));
      cacheAtom.setLoading();
      const result = await fetchData;
      cacheAtom.setNewData(result);
    } catch {
      cacheAtom.setError();
    }
  }, `${name}.revalidateAction`);

  const fetchAction = action(async (params: TParams) => {
    const cacheAtom = cacheAtoms.get(params);

    if (cacheAtom.isValid()) return;
    if (cacheAtom().status === 'loading') return;

    await wrap(revalidateAction(params));
  }, `${name}.fetchAction`);

  const getByKey = (params: TParams): TResult | null => {
    const cache = cacheAtoms()[getKey(params)];
    return cache?.().data ?? placeholder;
  };

  return (initialParams) => {
    const params = initialParams;
    const cacheAtom = cacheAtoms.get(params);
    cacheAtom();

    return {
      data: () => cacheAtom().data ?? placeholder,
      status: () => cacheAtom().status,
      getByKey: getByKey,
      fetch: () => fetchAction(params),
      revalidate: () => revalidateAction(params),
      _options: mergedOptions,
    };
  };
};

export const useQuery = <TParams, TResult>(
  query: Query<TParams, TResult>,
  params: TParams,
) => {
  const instance = query(params);
  const { fetch, _options } = instance;
  const currentKey = _options.getKey(params);

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey]);

  return instance;
};
