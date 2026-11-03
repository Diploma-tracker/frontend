// @vitest-environment node
import { reatomMutation } from '@/shared/model/data-access/mutation';
import { reatomQuery } from '@/shared/model/data-access/query';
import { abortVar, context, isAbort, sleep, wrap } from '@reatom/core';
import { deferred, flush, testModel } from '@tests/utils/reatom-model-test';
import { describe, expect, it, vi } from 'vitest';

describe('reatomMutation', () => {
  it('tracks pending and fulfilled state and passes the result and original arguments to onSuccess', () =>
    context.start(async () => {
      const response = deferred<{ id: string; name: string }>();
      const mutationFn = vi.fn(
        (_id: string, _patch: { name: string }) => response.promise,
      );
      const onSuccess = vi.fn();
      const mutation = reatomMutation({
        name: 'mutation.success',
        mutationFn,
        onSuccess,
      });

      expect(mutation.ready()).toBe(true);
      expect(mutation.error()).toBeUndefined();
      expect(mutation.status()).toMatchObject({
        isPending: false,
        isEverPending: false,
        isSettled: false,
      });

      const patch = { name: 'Updated' };
      const call = mutation('a', patch);
      expect(mutationFn).toHaveBeenCalledExactlyOnceWith('a', patch);
      expect(mutation.ready()).toBe(false);
      expect(mutation.error()).toBeUndefined();
      expect(mutation.status()).toMatchObject({
        isPending: true,
        isFirstPending: true,
        isFulfilled: false,
        isRejected: false,
      });
      expect(onSuccess).not.toHaveBeenCalled();

      const result = { id: 'a', name: 'Updated' };
      response.resolve(result);
      expect(await wrap(call)).toBe(result);
      expect(onSuccess).toHaveBeenCalledExactlyOnceWith(result, 'a', patch);
      expect(onSuccess.mock.calls[0]?.[2]).toBe(patch);
      expect(mutation.ready()).toBe(true);
      expect(mutation.error()).toBeUndefined();
      await wrap(sleep(0));
      expect(mutation.status()).toMatchObject({
        isPending: false,
        isFulfilled: true,
        isRejected: false,
        isSettled: true,
      });
    }));

  it('exposes failures without onSuccess and clears the error on the next call', () =>
    testModel(async () => {
      const first = deferred<string>();
      const second = deferred<string>();
      const mutationFn = vi
        .fn<() => Promise<string>>()
        .mockImplementationOnce(() => first.promise)
        .mockImplementationOnce(() => second.promise);
      const onSuccess = vi.fn();
      const mutation = reatomMutation({
        name: 'mutation.error',
        mutationFn,
        onSuccess,
      });
      const call = mutation();
      const rejected = expect(call).rejects.toThrow('Update failed');
      const error = new Error('Update failed');
      first.reject(error);
      await wrap(rejected);

      expect(mutation.ready()).toBe(true);
      expect(mutation.error()).toBe(error);
      expect(mutation.status()).toMatchObject({
        isPending: false,
        isRejected: true,
        isFulfilled: false,
        isSettled: true,
        error,
      });
      expect(onSuccess).not.toHaveBeenCalled();

      const nextCall = mutation();
      expect(mutation.error()).toBeUndefined();
      expect(mutation.ready()).toBe(false);
      expect(mutation.status()).toMatchObject({
        isPending: true,
        error: undefined,
      });
      second.resolve('saved');
      await wrap(nextCall);
      expect(onSuccess).toHaveBeenCalledExactlyOnceWith('saved');
    }));

  it('runs calls in parallel by default and stays pending until both settle', () =>
    testModel(async () => {
      const first = deferred<string>();
      const second = deferred<string>();
      const mutationFn = vi.fn((id: string) =>
        id === 'first' ? first.promise : second.promise,
      );
      const onSuccess = vi.fn();
      const mutation = reatomMutation({
        name: 'mutation.parallel',
        mutationFn,
        onSuccess,
      });
      const firstCall = mutation('first');
      const secondCall = mutation('second');
      expect(mutationFn.mock.calls).toEqual([['first'], ['second']]);

      second.resolve('second result');
      expect(await wrap(secondCall)).toBe('second result');
      expect(mutation.ready()).toBe(false);
      expect(mutation.status().isPending).toBe(true);
      expect(onSuccess).toHaveBeenCalledExactlyOnceWith(
        'second result',
        'second',
      );

      first.resolve('first result');
      expect(await wrap(firstCall)).toBe('first result');
      expect(mutation.ready()).toBe(true);
      expect(mutation.error()).toBeUndefined();
      expect(onSuccess.mock.calls).toEqual([
        ['second result', 'second'],
        ['first result', 'first'],
      ]);
    }));

  it('last-in-win aborts the previous call without reporting an error or success for it', () =>
    testModel(async () => {
      const first = deferred<string>();
      const second = deferred<string>();
      const signals: AbortSignal[] = [];
      const onSuccess = vi.fn();
      const mutation = reatomMutation({
        name: 'mutation.lastInWin',
        abort: 'last-in-win',
        mutationFn: (id: string) => {
          signals.push(abortVar.require().signal);
          return id === 'first' ? first.promise : second.promise;
        },
        onSuccess,
      });
      const firstCall = mutation('first').catch((error: unknown) => error);
      const secondCall = mutation('second');
      await wrap(flush());

      expect(signals.map((signal) => signal.aborted)).toEqual([true, false]);
      expect(isAbort(await wrap(firstCall))).toBe(true);
      expect(mutation.error()).toBeUndefined();
      expect(mutation.ready()).toBe(false);
      expect(onSuccess).not.toHaveBeenCalled();

      second.resolve('latest result');
      expect(await wrap(secondCall)).toBe('latest result');
      first.resolve('obsolete result');
      await wrap(flush());
      expect(onSuccess).toHaveBeenCalledExactlyOnceWith(
        'latest result',
        'second',
      );
      expect(mutation.ready()).toBe(true);
      expect(mutation.error()).toBeUndefined();
      expect(mutation.status()).toMatchObject({
        isPending: false,
        isFulfilled: true,
        isRejected: false,
      });
    }));

  it('manual abort cancels all active calls and clears pending status without error or onSuccess', () =>
    testModel(async ({ watch }) => {
      const first = deferred<string>();
      const second = deferred<string>();
      const signals: AbortSignal[] = [];
      const onSuccess = vi.fn();
      const mutation = reatomMutation({
        name: 'mutation.manual',
        abort: 'manual',
        mutationFn: (id: string) => {
          signals.push(abortVar.require().signal);
          return id === 'first' ? first.promise : second.promise;
        },
        onSuccess,
      });
      watch(mutation.status);
      const firstCall = mutation('first').catch((error: unknown) => error);
      const secondCall = mutation('second').catch((error: unknown) => error);
      expect(signals.map((signal) => signal.aborted)).toEqual([false, false]);
      expect(mutation.ready()).toBe(false);
      expect(mutation.status().isPending).toBe(true);

      mutation.abort();
      expect(signals.every((signal) => signal.aborted)).toBe(true);
      expect(isAbort(await wrap(firstCall))).toBe(true);
      expect(isAbort(await wrap(secondCall))).toBe(true);
      await wrap(flush());
      expect(mutation.ready()).toBe(true);
      expect(mutation.error()).toBeUndefined();

      first.resolve('late first result');
      second.resolve('late second result');
      await wrap(flush());
      expect(onSuccess).not.toHaveBeenCalled();
      expect(mutation.error()).toBeUndefined();
      expect(mutation.status()).toMatchObject({
        isPending: false,
        isRejected: false,
        isFulfilled: false,
      });
    }));

  it('invalidates selected entities on success without creating queries for unseen entities', () =>
    testModel(async ({ watch }) => {
      const fetcher = vi.fn(async (id: string) => ({ id }));
      const query = reatomQuery({
        name: 'mutation.entity',
        key: (id: string) => id,
        queryFn: fetcher,
      });
      const mutation = reatomMutation({
        name: 'mutation.invalidate',
        mutationFn: async (id: string) => ({ id }),
      });
      const select = vi.fn((saved: { id: string }, _id: string) => [saved.id]);
      const unsubscribe = query.invalidateOn(mutation, select);
      const visible = query('visible');
      watch(visible.data);
      await wrap(flush());

      await wrap(mutation('visible'));
      await wrap(flush());
      expect(select).toHaveBeenLastCalledWith({ id: 'visible' }, 'visible');
      expect(fetcher.mock.calls).toEqual([
        [
          'visible',
          expect.objectContaining({ signal: expect.any(AbortSignal) }),
        ],
        [
          'visible',
          expect.objectContaining({ signal: expect.any(AbortSignal) }),
        ],
      ]);
      expect(query.find('visible')).toBe(visible);

      await wrap(mutation('unseen'));
      await wrap(flush());
      expect(query.find('unseen')).toBeUndefined();
      expect(fetcher).toHaveBeenCalledTimes(2);

      unsubscribe();
      await wrap(mutation('visible'));
      await wrap(flush());
      expect(select).toHaveBeenCalledTimes(2);
      expect(fetcher).toHaveBeenCalledTimes(2);
    }));
});
