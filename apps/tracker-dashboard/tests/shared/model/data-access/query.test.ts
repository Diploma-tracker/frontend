// @vitest-environment node
import {
  type QueryContext,
  reatomQuery,
} from '@/shared/model/data-access/query';
import { atom, computed, isConnected, peek, wrap } from '@reatom/core';
import { deferred, flush, testModel } from '@tests/utils/reatom-model-test';
import { describe, expect, it, vi } from 'vitest';

describe('reatomQuery: single query', () => {
  it('starts on subscription, shares one request, and publishes loading and data', () =>
    testModel(async ({ watch }) => {
      const response = deferred<string>();
      const fetcher = vi.fn((_ctx: QueryContext<void>) => response.promise);
      const query = reatomQuery({ name: 'single.lazy', fetcher });
      const firstReader = vi.fn();
      const secondReader = vi.fn();

      await wrap(flush());
      expect(fetcher).not.toHaveBeenCalled();
      expect(isConnected(query)).toBe(false);

      watch(query.data, firstReader);
      watch(query.data, secondReader);
      await wrap(flush());

      expect(isConnected(query)).toBe(true);
      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(fetcher.mock.calls[0]?.[0].signal).toBeInstanceOf(AbortSignal);
      expect(fetcher.mock.calls[0]?.[0].signal.aborted).toBe(false);
      expect(query.ready()).toBe(false);
      expect(query.error()).toBeUndefined();
      expect(query.status()).toMatchObject({ isPending: true });

      response.resolve('loaded');
      await wrap(flush());

      expect(query.data()).toBe('loaded');
      expect(query.ready()).toBe(true);
      expect(query.status()).toMatchObject({
        isPending: false,
        isFulfilled: true,
      });
      expect(firstReader.mock.calls).toEqual([[undefined], ['loaded']]);
      expect(secondReader.mock.calls).toEqual(firstReader.mock.calls);
    }));

  it('exposes a rejected request as error and becomes ready', () =>
    testModel(async ({ watch }) => {
      const response = deferred<string>();
      const query = reatomQuery({
        name: 'single.error',
        fetcher: () => response.promise,
      });
      watch(query.data);
      await wrap(flush());
      expect(query.ready()).toBe(false);

      const error = new Error('Request failed');
      response.reject(error);
      await wrap(flush());

      expect(query.error()).toBe(error);
      expect(query.ready()).toBe(true);
      expect(query.data()).toBeUndefined();
      expect(query.status()).toMatchObject({
        isPending: false,
        isRejected: true,
        error,
      });
    }));

  it('aborts obsolete params and ignores their late response', () =>
    testModel(async ({ watch }) => {
      const id = atom('first');
      const first = deferred<string>();
      const last = deferred<string>();
      const fetcher = vi.fn(({ params }: QueryContext<string>) =>
        params === 'first' ? first.promise : last.promise,
      );
      const query = reatomQuery({
        name: 'single.params',
        params: id,
        fetcher,
      });
      watch(query.data);
      await wrap(flush());
      const firstSignal = fetcher.mock.calls[0]?.[0].signal;

      id.set('last');
      await wrap(flush());
      expect(fetcher).toHaveBeenCalledTimes(2);
      expect(firstSignal?.aborted).toBe(true);
      expect(fetcher.mock.calls[1]?.[0].signal.aborted).toBe(false);

      last.resolve('latest result');
      await wrap(flush());
      first.resolve('obsolete result');
      await wrap(flush());
      expect(query.data()).toBe('latest result');
      expect(query.error()).toBeUndefined();
    }));

  it('reuses cached params for navigation and retry, but always fetches on invalidate', () =>
    testModel(async ({ watch }) => {
      const id = atom('a');
      const fetcher = vi.fn(async ({ params }: QueryContext<string>) => params);
      const query = reatomQuery({
        name: 'single.cache',
        params: id,
        fetcher,
      });
      watch(query.data);
      await wrap(flush());
      id.set('b');
      await wrap(flush());
      expect(query.data()).toBe('b');

      id.set('a');
      await wrap(flush());
      expect(query.data()).toBe('a');
      expect(fetcher).toHaveBeenCalledTimes(2);

      query.retry();
      await wrap(flush());
      expect(fetcher).toHaveBeenCalledTimes(2);

      for (const expectedCalls of [3, 4]) {
        query.cacheAtom.invalidate();
        await wrap(flush());
        expect(fetcher).toHaveBeenCalledTimes(expectedCalls);
        expect(fetcher.mock.lastCall?.[0].params).toBe('a');
      }
    }));

  it('manual abort preserves previous data without error or an automatic restart', () =>
    testModel(async ({ watch }) => {
      const response = deferred<string>();
      const fetcher = vi
        .fn<(ctx: QueryContext<void>) => Promise<string>>()
        .mockResolvedValueOnce('previous')
        .mockImplementation(() => response.promise);
      const query = reatomQuery({ name: 'single.abort', fetcher });
      watch(query.data);
      await wrap(flush());
      query.cacheAtom.invalidate();
      await wrap(flush());
      expect(query.ready()).toBe(false);

      query.abort();
      await wrap(flush());
      expect(fetcher.mock.lastCall?.[0].signal.aborted).toBe(true);
      expect(query.error()).toBeUndefined();
      expect(query.data()).toBe('previous');
      expect(query.ready()).toBe(true);

      response.resolve('late result');
      await wrap(flush());
      expect(query.data()).toBe('previous');
      expect(query.error()).toBeUndefined();
      expect(fetcher).toHaveBeenCalledTimes(2);
    }));
});

const isolatedFetcher = vi.fn(async (id: string) => id);
const isolatedQuery = reatomQuery({
  name: 'keyed.contextIsolation',
  key: (id: string) => id,
  fetcher: isolatedFetcher,
});

describe('reatomQuery: keyed queries', () => {
  it.each([1, 2])('isolates the module-level registry in context %s', () =>
    testModel(async ({ watch }) => {
      expect(isolatedQuery.find('a')).toBeUndefined();
      expect(isolatedFetcher).not.toHaveBeenCalled();
      watch(isolatedQuery('a').data);
      await wrap(flush());
      expect(isolatedFetcher).toHaveBeenCalledExactlyOnceWith(
        'a',
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    }),
  );

  it('shares instances by key and find never creates or fetches a missing key', () =>
    testModel(async ({ watch }) => {
      const fetcher = vi.fn(async ({ id }: { id: string }) => id);
      const query = reatomQuery({
        name: 'keyed.identity',
        key: ({ id }: { id: string }) => id,
        fetcher,
      });

      expect(query.find({ id: 'missing' })).toBeUndefined();
      await wrap(flush());
      expect(fetcher).not.toHaveBeenCalled();

      const a = query({ id: 'a' });
      const sameA = query({ id: 'a' });
      const b = query({ id: 'b' });
      expect(sameA).toBe(a);
      expect(b).not.toBe(a);
      expect(query.find({ id: 'a' })).toBe(a);
      watch(a.data);
      watch(sameA.data);
      watch(b.data);
      await wrap(flush());

      expect(fetcher.mock.calls.map(([arg]) => arg.id)).toEqual(['a', 'b']);
      expect(a.data()).toBe('a');
      expect(b.data()).toBe('b');
      expect(query.find({ id: 'missing' })).toBeUndefined();
    }));

  it.each(['clear', 'scope'] as const)(
    '%s gives subscribers and external callers the same fresh instance',
    (reset) =>
      testModel(async ({ watch }) => {
        const scope = atom('old');
        const fetcher = vi.fn(async (id: string) => id);
        const query = reatomQuery({
          name: `keyed.${reset}`,
          key: (id: string) => id,
          scope,
          fetcher,
        });
        const reader = computed(() => {
          const instance = query('a');
          return { instance, data: instance.data() };
        });
        const listener = vi.fn();
        watch(reader, listener);
        await wrap(flush());
        const previous = peek(reader).instance;
        expect(peek(reader).data).toBe('a');

        if (reset === 'clear') query.clear();
        else scope.set('new');
        await wrap(flush());

        const current = peek(reader).instance;
        expect(current).not.toBe(previous);
        expect(query('a')).toBe(current);
        expect(query.find('a')).toBe(current);
        expect(peek(reader).data).toBe('a');
        expect(listener).toHaveBeenLastCalledWith({
          instance: current,
          data: 'a',
        });
        expect(fetcher).toHaveBeenCalledTimes(2);
      }),
  );

  it('invalidates visible instances now and evicts hidden ones until shown again', () =>
    testModel(async ({ watch }) => {
      const fetcher = vi.fn(async (id: string) => id);
      const query = reatomQuery({
        name: 'keyed.invalidate',
        key: (id: string) => id,
        fetcher,
      });
      const visible = query('visible');
      const hidden = query('hidden');
      watch(visible.data);
      const hide = watch(hidden.data);
      await wrap(flush());
      hide();
      await wrap(flush());
      expect(isConnected(hidden)).toBe(false);

      query.invalidate();
      await wrap(flush());
      expect(query.find('visible')).toBe(visible);
      expect(query.find('hidden')).toBeUndefined();
      expect(fetcher.mock.calls.map(([id]) => id)).toEqual([
        'visible',
        'hidden',
        'visible',
      ]);

      const shownAgain = query('hidden');
      expect(shownAgain).not.toBe(hidden);
      watch(shownAgain.data);
      await wrap(flush());
      expect(shownAgain.data()).toBe('hidden');
      expect(fetcher).toHaveBeenCalledTimes(4);
    }));

  it('evicts an unused instance exactly at gcTime', () =>
    testModel(async ({ watch }) => {
      const fetcher = vi.fn(async (id: string) => id);
      const query = reatomQuery({
        name: 'keyed.gc',
        key: (id: string) => id,
        fetcher,
        gcTime: 1_000,
      });
      const instance = query('a');
      const hide = watch(instance.data);
      await wrap(flush());
      hide();
      await wrap(flush());

      await wrap(vi.advanceTimersByTimeAsync(999));
      expect(query.find('a')).toBe(instance);
      await wrap(vi.advanceTimersByTimeAsync(1));
      expect(query.find('a')).toBeUndefined();
      expect(fetcher).toHaveBeenCalledTimes(1);
    }));

  it('preserves the instance and cached result across a quick unmount and remount', () =>
    testModel(async ({ watch }) => {
      const fetcher = vi.fn(async (id: string) => id);
      const query = reatomQuery({
        name: 'keyed.remount',
        key: (id: string) => id,
        fetcher,
        gcTime: 1_000,
      });
      const instance = query('a');
      const hide = watch(instance.data);
      await wrap(flush());
      hide();
      watch(query('a').data);
      await wrap(vi.advanceTimersByTimeAsync(1_000));

      expect(query.find('a')).toBe(instance);
      expect(isConnected(instance)).toBe(true);
      expect(instance.data()).toBe('a');
      expect(fetcher).toHaveBeenCalledTimes(1);
    }));
});
