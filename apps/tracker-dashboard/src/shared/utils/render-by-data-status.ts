/**
 * Minimal structural type that matches any reatom `AsyncStatus`.
 *
 * `AsyncStatus` is not part of `@reatom/core`'s public exports, so instead of
 * importing from internal paths we declare the shape we actually need.
 * TypeScript's structural typing guarantees that any real `AsyncStatus` value
 * satisfies this type.
 */
export type AsyncStatusLike = {
  isPending: boolean;
  isRejected: boolean;
  isFulfilled: boolean;
};

type StatusKey = 'pending' | 'rejected' | 'fulfilled';

/**
 * Selects a value from the provided map based on the current async status.
 *
 * `pending` and `rejected` are checked first as override states.
 * `fulfilled` is the **default/fallback** — it is returned when neither pending
 * nor rejected, including the initial state where the action has never been
 * triggered (reatom's `AsyncStatusNeverPending`).
 *
 * This mirrors the standard if-else pattern from reatom docs:
 * ```
 * if (status.isPending) return <Spinner />
 * if (status.isRejected) return <Error />
 * return <Content />  // default — also covers "never triggered" state
 * ```
 *
 * @param status - The `AsyncStatus` value from a reatom status atom (e.g. `action.status()`).
 *                 Typed as {@link AsyncStatusLike} since `AsyncStatus` is not publicly exported from `@reatom/core`.
 * @reference https://v1000.reatom.dev/handbook/async/#status-properties
 *
 * @param map - Mapping of status keys to values. `pending` and `rejected` act as
 *              overrides; `fulfilled` is the default shown in all other cases.
 *
 * @returns The value for the active status, or null if the matched key is absent from the map.
 *
 * @example
 * // Action never triggered → returns fulfilled value (initial/default state)
 * const status = { isPending: false, isRejected: false, isFulfilled: false };
 * renderByDataStatus(status, { pending: <Spinner />, rejected: <Error />, fulfilled: <Data /> }); // <Data />
 *
 * // Action pending → returns pending value
 * renderByDataStatus({ ...status, isPending: true }, { pending: <Spinner />, fulfilled: <Data /> }); // <Spinner />
 */
export function renderByDataStatus<T>(status: AsyncStatusLike, map: Partial<Record<StatusKey, T>>): T | null {
  if (status.isPending) return map.pending ?? null;
  if (status.isRejected) return map.rejected ?? null;

  // Default case: covers isFulfilled=true AND the initial "never triggered" state
  return map.fulfilled ?? null;
}
