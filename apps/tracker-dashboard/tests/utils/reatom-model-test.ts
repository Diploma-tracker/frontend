import { type AtomLike, context, wrap } from '@reatom/core';
import { vi } from 'vitest';

export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

export function flush() {
  return vi.advanceTimersByTimeAsync(0);
}

interface ModelTest {
  watch: <T>(
    target: AtomLike<T, [], T>,
    listener?: (value: T) => void,
  ) => () => void;
}

/** Isolate a Reatom model test and clean up its subscriptions and timers. */
export function testModel(run: (test: ModelTest) => Promise<void>) {
  return context.start(async () => {
    vi.useFakeTimers();
    const subscriptions: Array<() => void> = [];
    try {
      await wrap(
        run({
          watch: (target, listener = vi.fn()) => {
            const unsubscribe = target.subscribe(listener);
            subscriptions.push(unsubscribe);
            return unsubscribe;
          },
        }),
      );
    } finally {
      for (const unsubscribe of subscriptions.reverse()) unsubscribe();

      await wrap(flush());

      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });
}
