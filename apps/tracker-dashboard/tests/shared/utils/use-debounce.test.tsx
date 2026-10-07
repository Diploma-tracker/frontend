import { useDebounce } from '@/shared/utils/use-debounce';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function advanceTime(milliseconds: number) {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
}

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('skips the initial invocation and debounces later changes by 300ms by default', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ value }) => useDebounce(() => callback(value), [value]),
      { initialProps: { value: 'initial' } },
    );

    advanceTime(300);
    expect(callback).not.toHaveBeenCalled();

    rerender({ value: 'updated' });
    advanceTime(299);
    expect(callback).not.toHaveBeenCalled();

    advanceTime(1);
    expect(callback).toHaveBeenCalledExactlyOnceWith('updated');
  });

  it('restarts the custom delay on each dependency change and invokes only the latest value', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ value }) => useDebounce(() => callback(value), [value], 100),
      { initialProps: { value: 'initial' } },
    );

    advanceTime(100);
    rerender({ value: 'first change' });
    advanceTime(75);
    rerender({ value: 'latest change' });
    advanceTime(99);
    expect(callback).not.toHaveBeenCalled();

    advanceTime(1);
    expect(callback).toHaveBeenCalledExactlyOnceWith('latest change');
  });

  it('invokes the callback on mount when invokeOnStart is enabled', () => {
    const callback = vi.fn();
    renderHook(() => useDebounce(callback, [], 100, { invokeOnStart: true }));

    advanceTime(100);
    expect(callback).toHaveBeenCalledTimes(1);

    advanceTime(100);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('uses the latest callback without restarting the timer when dependencies are unchanged', () => {
    const originalCallback = vi.fn();
    const latestCallback = vi.fn();
    const { rerender } = renderHook(
      ({ callback, value }) => useDebounce(callback, [value], 100),
      { initialProps: { callback: originalCallback, value: 'initial' } },
    );

    advanceTime(100);
    rerender({ callback: originalCallback, value: 'updated' });
    advanceTime(50);
    rerender({ callback: latestCallback, value: 'updated' });
    advanceTime(50);

    expect(originalCallback).not.toHaveBeenCalled();
    expect(latestCallback).toHaveBeenCalledTimes(1);
  });

  it('cancels a pending invocation and allows a later dependency change to schedule another', () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(() => callback(value), [value], 100),
      { initialProps: { value: 'initial' } },
    );

    advanceTime(100);
    rerender({ value: 'cancelled' });
    advanceTime(50);
    act(() => result.current[1]());
    advanceTime(100);
    expect(callback).not.toHaveBeenCalled();

    rerender({ value: 'rescheduled' });
    advanceTime(100);
    expect(callback).toHaveBeenCalledExactlyOnceWith('rescheduled');
  });

  it('clears pending work on unmount', () => {
    const callback = vi.fn();
    const { rerender, unmount } = renderHook(
      ({ value }) => useDebounce(callback, [value], 100),
      { initialProps: { value: 'initial' } },
    );

    advanceTime(100);
    rerender({ value: 'updated' });
    unmount();
    advanceTime(100);

    expect(callback).not.toHaveBeenCalled();
  });
});
