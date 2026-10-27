// @vitest-environment node
import {
  type AsyncListInput,
  reatomAsyncList,
} from '@/shared/model/data-access/async-list';
import { type QueryContext } from '@/shared/model/data-access/query';
import { atom, wrap } from '@reatom/core';
import { deferred, flush, testModel } from '@tests/utils/reatom-model-test';
import { describe, expect, it, vi } from 'vitest';

interface Filters {
  page: number;
  pageSize: number;
  search?: string;
  tags?: string[];
  sort: string;
}

interface Params {
  projectId: string;
}

function createList(params?: () => Params, ttl?: number) {
  const defaultFilters: Filters = {
    page: 1,
    pageSize: 20,
    tags: ['active'],
    sort: 'name',
  };
  const fetcher = vi.fn(
    async (
      { filters, params }: AsyncListInput<Filters, Params | undefined>,
      _ctx: QueryContext,
    ) => [
      `${params?.projectId ?? 'all'}:${filters.page}:${filters.search ?? ''}`,
    ],
  );
  const list = reatomAsyncList<Filters, string[], Params | undefined>(
    { defaultFilters, initState: [], params, queryFn: fetcher, ttl },
    'testList',
  );
  return { list, fetcher, defaultFilters };
}

describe('reatomAsyncList: filters', () => {
  it.each<{ name: string; update: Partial<Filters>; page: number }>([
    { name: 'search', update: { search: 'new' }, page: 1 },
    { name: 'page size', update: { pageSize: 50 }, page: 1 },
    { name: 'tags', update: { tags: ['archived'] }, page: 1 },
    { name: 'sort', update: { sort: 'date' }, page: 1 },
    { name: 'page alone', update: { page: 3 }, page: 3 },
    {
      name: 'explicit page with changed fields',
      update: { page: 3, search: 'new', pageSize: 50 },
      page: 3,
    },
    {
      name: 'explicit page equal to the current page',
      update: { page: 4, search: 'new' },
      page: 4,
    },
  ])('applies pagination rules when changing $name', ({ update, page }) =>
    testModel(async ({ watch }) => {
      const { list, fetcher, defaultFilters } = createList();
      list.setFilter({ page: 4 });
      watch(list.data);
      await wrap(flush());

      list.setFilter(update);
      await wrap(flush());

      const expected = { ...defaultFilters, ...update, page };
      expect(list.filter()).toEqual(expected);
      expect(fetcher).toHaveBeenCalledTimes(2);
      expect(fetcher.mock.lastCall?.[0].filters).toEqual(expected);
    }),
  );

  it('does not fetch or reset the page for unchanged values, including equal arrays', () =>
    testModel(async ({ watch }) => {
      const { list, fetcher } = createList();
      list.setFilter({ page: 4, search: 'same' });
      watch(list.data);
      const onFilter = vi.fn();
      watch(list.filter, onFilter);
      await wrap(flush());
      const previous = list.filter();

      list.setFilter({});
      list.setFilter({
        page: 4,
        pageSize: 20,
        search: 'same',
        tags: ['active'],
        sort: 'name',
      });
      await wrap(flush());

      expect(list.filter()).toBe(previous);
      expect(list.filter().page).toBe(4);
      expect(onFilter).toHaveBeenCalledTimes(1);
      expect(fetcher).toHaveBeenCalledTimes(1);
    }));

  it('clears filters with undefined and resets the page', () =>
    testModel(async ({ watch }) => {
      const { list, fetcher } = createList();
      list.setFilter({ page: 4, search: 'old' });
      watch(list.data);
      await wrap(flush());

      list.setFilter({ search: undefined, tags: undefined });
      await wrap(flush());

      expect(list.filter()).toMatchObject({
        page: 1,
        search: undefined,
        tags: undefined,
      });
      expect(fetcher).toHaveBeenCalledTimes(2);
      expect(fetcher.mock.lastCall?.[0].filters).toMatchObject({
        search: undefined,
        tags: undefined,
      });
    }));
});

describe('reatomAsyncList: requests and cache', () => {
  it('keeps previous rows while typing, aborts obsolete requests, and only accepts the latest result', () =>
    testModel(async ({ watch }) => {
      const { list, fetcher } = createList();
      const rows = vi.fn();
      watch(list.data, rows);
      await wrap(flush());
      expect(list.data()).toEqual(['all:1:']);

      const first = deferred<string[]>();
      const last = deferred<string[]>();
      fetcher
        .mockImplementationOnce(() => first.promise)
        .mockImplementationOnce(() => last.promise);
      list.setFilter({ search: 'a' });
      await wrap(flush());
      const obsoleteSignal = fetcher.mock.lastCall?.[1].signal;
      expect(list.status().isPending).toBe(true);
      expect(list.data()).toEqual(['all:1:']);

      list.setFilter({ search: 'ab' });
      await wrap(flush());
      expect(obsoleteSignal?.aborted).toBe(true);
      expect(fetcher.mock.lastCall?.[1].signal.aborted).toBe(false);
      expect(list.data()).toEqual(['all:1:']);

      last.resolve(['latest rows']);
      await wrap(flush());
      first.resolve(['obsolete rows']);
      await wrap(flush());

      expect(list.data()).toEqual(['latest rows']);
      expect(list.status().isPending).toBe(false);
      expect(list.error()).toBeUndefined();
      expect(rows.mock.calls).toEqual([[[]], [['all:1:']], [['latest rows']]]);
      expect(fetcher).toHaveBeenCalledTimes(3);
    }));

  it('reuses cached filter combinations beyond five pages until their ttl expires', () =>
    testModel(async ({ watch }) => {
      const { list, fetcher } = createList(undefined, 1_000);
      list.setFilter({ search: 'initial' });
      watch(list.data);
      await wrap(flush());
      list.setFilter({ page: 2 });
      await wrap(flush());
      list.setFilter({ search: 'a' });
      await wrap(flush());
      list.setFilter({ page: 2 });
      await wrap(flush());

      // Revisit a combination that includes both pagination and a filter.
      list.setFilter({ page: 1 });
      await wrap(flush());
      expect(list.filter()).toMatchObject({ page: 1, search: 'a' });
      expect(list.data()).toEqual(['all:1:a']);
      expect(fetcher).toHaveBeenCalledTimes(4);

      list.setFilter({ search: 'b' });
      await wrap(flush());
      expect(fetcher).toHaveBeenCalledTimes(5);

      list.setFilter({ search: 'initial' });
      await wrap(flush());
      expect(list.data()).toEqual(['all:1:initial']);
      expect(fetcher).toHaveBeenCalledTimes(5);

      list.setFilter({ search: 'c' });
      await wrap(flush());
      expect(fetcher).toHaveBeenCalledTimes(6);

      list.setFilter({ search: 'initial' });
      await wrap(flush());
      expect(list.data()).toEqual(['all:1:initial']);
      expect(fetcher).toHaveBeenCalledTimes(6);

      // New keys evict idle pages once their retention period has elapsed.
      await wrap(vi.advanceTimersByTimeAsync(1_000));
      list.setFilter({ search: 'after expiry' });
      await wrap(flush());
      expect(fetcher).toHaveBeenCalledTimes(7);

      list.setFilter({ search: 'a' });
      await wrap(flush());
      expect(list.data()).toEqual(['all:1:a']);
      expect(fetcher).toHaveBeenCalledTimes(8);
    }));

  it('invalidates and reloads the current page with its current filters', () =>
    testModel(async ({ watch }) => {
      const { list, fetcher } = createList();
      list.setFilter({ page: 3, search: 'current' });
      watch(list.data);
      await wrap(flush());
      fetcher.mockResolvedValueOnce(['refreshed page 3']);

      list.invalidate();
      await wrap(flush());

      expect(fetcher).toHaveBeenCalledTimes(2);
      expect(fetcher.mock.lastCall?.[0].filters).toMatchObject({
        page: 3,
        search: 'current',
      });
      expect(list.filter()).toMatchObject({ page: 3, search: 'current' });
      expect(list.data()).toEqual(['refreshed page 3']);
    }));
});

describe('reatomAsyncList: external params', () => {
  it('resets filters to defaults and makes exactly one request when params change', () =>
    testModel(async ({ watch }) => {
      const params = atom({ projectId: 'a' });
      const { list, fetcher, defaultFilters } = createList(params);
      watch(list.data);
      await wrap(flush());
      list.setFilter({ page: 4, search: 'custom', tags: ['archived'] });
      await wrap(flush());
      expect(fetcher).toHaveBeenCalledTimes(2);

      const response = deferred<string[]>();
      fetcher.mockImplementationOnce(() => response.promise);
      params.set({ projectId: 'b' });
      await wrap(flush());

      expect(list.filter()).toEqual(defaultFilters);
      expect(fetcher).toHaveBeenCalledTimes(3);
      expect(fetcher.mock.lastCall?.[0]).toMatchObject({
        params: { projectId: 'b' },
        filters: defaultFilters,
      });
      response.resolve(['project b rows']);
      await wrap(flush());
      expect(fetcher).toHaveBeenCalledTimes(3);
      expect(list.data()).toEqual(['project b rows']);
    }));

  it('preserves filters configured before the first subscription', () =>
    testModel(async ({ watch }) => {
      const params = atom({ projectId: 'a' });
      const { list, fetcher } = createList(params);
      list.setFilter({ page: 3, search: 'preset', tags: ['archived'] });
      params.set({ projectId: 'b' });
      await wrap(flush());
      expect(fetcher).not.toHaveBeenCalled();

      watch(list.data);
      await wrap(flush());

      expect(list.filter()).toMatchObject({ page: 3, search: 'preset' });
      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(fetcher.mock.lastCall?.[0]).toMatchObject({
        params: { projectId: 'b' },
        filters: { page: 3, search: 'preset', tags: ['archived'] },
      });
    }));

  it('does not reset filters or fetch for new params with equal contents', () =>
    testModel(async ({ watch }) => {
      const params = atom({ projectId: 'a' });
      const { list, fetcher } = createList(params);
      list.setFilter({ page: 4, search: 'keep' });
      watch(list.data);
      await wrap(flush());
      const previousFilters = list.filter();

      params.set({ projectId: 'a' });
      await wrap(flush());

      expect(list.filter()).toBe(previousFilters);
      expect(list.filter()).toMatchObject({ page: 4, search: 'keep' });
      expect(list.data()).toEqual(['a:4:keep']);
      expect(fetcher).toHaveBeenCalledTimes(1);
    }));
});
