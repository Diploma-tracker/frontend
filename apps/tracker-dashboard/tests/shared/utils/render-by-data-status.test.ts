import { renderByDataStatus } from '@/shared/utils/render-by-data-status';
import { describe, expect, it } from 'vitest';

describe('renderByDataStatus', () => {
  it.each([
    [false, false, false, 'content'],
    [false, false, true, 'content'],
    [false, true, false, 'error'],
    [false, true, true, 'error'],
    [true, false, false, 'loading'],
    [true, false, true, 'loading'],
    [true, true, false, 'loading'],
    [true, true, true, 'loading'],
  ] as const)(
    'selects %s/%s/%s (pending/rejected/fulfilled) as %s',
    (isPending, isRejected, isFulfilled, expected) => {
      expect(
        renderByDataStatus(
          { isPending, isRejected, isFulfilled },
          { pending: 'loading', rejected: 'error', fulfilled: 'content' },
        ),
      ).toBe(expected);
    },
  );

  it.each(['pending', 'rejected', 'fulfilled'] as const)(
    'returns null when the selected %s entry is absent without using another entry',
    (key) => {
      const map: Partial<Record<typeof key, string>> = {
        pending: 'loading',
        rejected: 'error',
        fulfilled: 'content',
      };
      delete map[key];

      expect(
        renderByDataStatus(
          {
            isPending: key === 'pending',
            isRejected: key === 'rejected',
            isFulfilled: key === 'fulfilled',
          },
          map,
        ),
      ).toBeNull();
    },
  );

  it.each(['pending', 'rejected', 'fulfilled'] as const)(
    'preserves falsy values and converts nullish values to null for %s',
    (key) => {
      const status = {
        isPending: key === 'pending',
        isRejected: key === 'rejected',
        isFulfilled: key === 'fulfilled',
      };

      for (const value of [false, 0, ''] as const) {
        expect(renderByDataStatus(status, { [key]: value })).toBe(value);
      }

      for (const value of [null, undefined]) {
        expect(renderByDataStatus(status, { [key]: value })).toBeNull();
      }
    },
  );
});
