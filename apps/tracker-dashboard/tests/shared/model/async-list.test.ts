import { type AsyncListPagination, asyncList } from '@/shared/model/async-list';
import { describe, expect, it, vi } from 'vitest';

type Filters = AsyncListPagination & {
  search?: string;
};

function createList(
  fetch = vi.fn<(params: string, filters: Filters) => Promise<string[]>>(
    async () => ['result'],
  ),
  defaultFilters?: Filters,
) {
  return {
    fetch,
    list: asyncList<Filters, string, string[]>(
      { fetch, defaultFilters },
      'testList',
    ),
  };
}

describe('asyncList', () => {
  it('uses the default pagination without fetching on creation', () => {
    const { fetch, list } = createList();

    expect(list.filter()).toEqual({ page: 1, pageSize: 10 });
    expect(fetch).not.toHaveBeenCalled();
    expect(list.status().isEverPending).toBe(false);
  });

  it('uses custom filters and exposes fetched data and status', async () => {
    const defaultFilters = { page: 2, pageSize: 25, search: 'initial' };
    const { fetch, list } = createList(undefined, defaultFilters);

    await expect(list.fetch('round-1')).resolves.toEqual(['result']);

    expect(fetch).toHaveBeenCalledExactlyOnceWith('round-1', defaultFilters);
    expect(list.data()).toEqual(['result']);
    expect(list.status()).toMatchObject({
      isPending: false,
      isFulfilled: true,
      isRejected: false,
    });
  });

  it('keeps the current page when only the page filter changes', async () => {
    const defaultFilters = { page: 2, pageSize: 25, search: 'Ada' };
    const { fetch, list } = createList(undefined, defaultFilters);
    await list.fetch('round-1');
    fetch.mockResolvedValueOnce(['page 4 result']);

    list.setFilter({ page: 4 });

    expect(list.filter()).toEqual({ page: 4, pageSize: 25, search: 'Ada' });
    await vi.waitFor(() => {
      expect(list.data()).toEqual(['page 4 result']);
    });
    expect(fetch).toHaveBeenLastCalledWith('round-1', {
      page: 4,
      pageSize: 25,
      search: 'Ada',
    });
  });

  it.each([
    {
      name: 'a search change',
      update: { search: 'after' },
      expected: { page: 1, pageSize: 25, search: 'after' },
    },
    {
      name: 'a page size change',
      update: { pageSize: 50 },
      expected: { page: 1, pageSize: 50, search: 'before' },
    },
    {
      name: 'a search change with an explicit page',
      update: { page: 3, search: 'after' },
      expected: { page: 1, pageSize: 25, search: 'after' },
    },
  ])(
    'resets the page and refreshes data after $name',
    async ({ update, expected }) => {
      const { fetch, list } = createList(undefined, {
        page: 5,
        pageSize: 25,
        search: 'before',
      });
      await list.fetch('round-1');
      fetch.mockResolvedValueOnce(['updated result']);

      list.setFilter(update);

      expect(list.filter()).toEqual(expected);
      await vi.waitFor(() => {
        expect(list.data()).toEqual(['updated result']);
      });
      expect(fetch).toHaveBeenLastCalledWith('round-1', expected);
    },
  );

  it('does not fetch on filter changes or revalidation before params are known', async () => {
    const { fetch, list } = createList();

    list.setFilter({ page: 2 });
    list.setFilter({ page: 3 });
    await list.revalidate();

    expect(fetch).not.toHaveBeenCalled();
  });

  it('revalidates explicitly with the most recently fetched params', async () => {
    const { fetch, list } = createList();
    await list.fetch('round-1');
    await list.fetch('round-2');

    await list.revalidate();

    expect(fetch).toHaveBeenLastCalledWith('round-2', {
      page: 1,
      pageSize: 10,
    });
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('exposes a failed fetch and recovers by revalidating the same params', async () => {
    const error = new Error('Unable to load the list');
    const { fetch, list } = createList();
    fetch.mockRejectedValueOnce(error);

    await expect(list.fetch('round-1')).rejects.toBe(error);

    expect(list.data()).toBeUndefined();
    expect(list.status()).toMatchObject({
      isPending: false,
      isFulfilled: false,
      isRejected: true,
    });

    await list.revalidate();

    expect(fetch).toHaveBeenLastCalledWith('round-1', {
      page: 1,
      pageSize: 10,
    });
    expect(list.data()).toEqual(['result']);
    expect(list.status()).toMatchObject({
      isPending: false,
      isFulfilled: true,
      isRejected: false,
    });
  });

  it('preserves the previous data when refreshing fails', async () => {
    const { fetch, list } = createList();
    await list.fetch('round-1');
    const error = new Error('Unable to refresh the list');
    fetch.mockRejectedValueOnce(error);

    await expect(list.revalidate()).rejects.toBe(error);

    expect(list.data()).toEqual(['result']);
    expect(list.status()).toMatchObject({
      isPending: false,
      isRejected: true,
    });
  });

  it('keeps the latest result when an older filter refresh finishes later', async () => {
    const { fetch, list } = createList();
    await list.fetch('round-1');

    let resolveOlderRefresh!: (data: string[]) => void;
    const olderRefresh = new Promise<string[]>((resolve) => {
      resolveOlderRefresh = resolve;
    });
    fetch.mockReturnValueOnce(olderRefresh);
    fetch.mockResolvedValueOnce(['latest result']);

    try {
      list.setFilter({ page: 2 });
      await vi.waitFor(() => {
        expect(fetch).toHaveBeenLastCalledWith('round-1', {
          page: 2,
          pageSize: 10,
        });
        expect(list.status().isPending).toBe(true);
      });

      list.setFilter({ page: 3 });
      await vi.waitFor(() => {
        expect(list.data()).toEqual(['latest result']);
        expect(list.status().isPending).toBe(false);
      });
      expect(fetch).toHaveBeenLastCalledWith('round-1', {
        page: 3,
        pageSize: 10,
      });
    } finally {
      resolveOlderRefresh(['older result']);
      await olderRefresh;
    }

    expect(list.data()).toEqual(['latest result']);
    expect(list.status().isFulfilled).toBe(true);
  });

  it('preserves data and reports failed automatic refreshes, then recovers', async () => {
    const { fetch, list } = createList();
    await list.fetch('round-1');
    fetch.mockRejectedValueOnce(new Error('Unable to refresh the list'));

    list.setFilter({ page: 2 });

    await vi.waitFor(() => {
      expect(list.status()).toMatchObject({
        isPending: false,
        isRejected: true,
      });
    });
    expect(list.data()).toEqual(['result']);

    fetch.mockResolvedValueOnce(['recovered result']);
    list.setFilter({ page: 3 });

    await vi.waitFor(() => {
      expect(list.data()).toEqual(['recovered result']);
      expect(list.status()).toMatchObject({
        isPending: false,
        isFulfilled: true,
        isRejected: false,
      });
    });
  });

  it('fetches without params during revalidation when noParams is enabled', async () => {
    const fetch = vi.fn(
      async (_params: undefined, filters: AsyncListPagination) => [
        filters.pageSize,
      ],
    );
    const list = asyncList<AsyncListPagination, undefined, number[]>(
      { fetch, noParams: true },
      'noParamsTestList',
    );

    expect(fetch).not.toHaveBeenCalled();
    await list.revalidate();
    expect(list.data()).toEqual([10]);
    list.setFilter({ pageSize: 20 });

    await vi.waitFor(() => {
      expect(list.data()).toEqual([20]);
    });
    expect(fetch).toHaveBeenLastCalledWith(undefined, {
      page: 1,
      pageSize: 20,
    });
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
