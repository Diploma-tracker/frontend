import {
  type AbortExt,
  type Action,
  type AsyncExt,
  action,
  withAbort,
  withAsync,
  withCallHook,
  wrap,
} from '@reatom/core';

/**
 * Mutation cancellation strategy:
 * - `'last-in-win'`: a new call cancels the previous one;
 * - `'manual'`: calls are cancelled only through `mutation.abort()`.
 */
export type MutationAbortStrategy = 'last-in-win' | 'manual';

/** Mutation options. */
export interface MutationOptions<TArgs extends unknown[], TResult> {
  /** Name for devtools and logs. */
  name: string;
  /** Server request receiving the mutation call arguments. */
  mutationFn: (...args: TArgs) => Promise<TResult>;
  /**
   * Receives the result and original arguments on success. Use it for side effects
   * such as toasts or navigation; invalidate queries with `query.invalidateOn(mutation)`.
   */
  onSuccess?: (result: TResult, ...args: TArgs) => void;
  /** Enable cancellation. Access the signal in `mutationFn` via `abortVar.require().signal`. */
  abort?: MutationAbortStrategy;
}

/**
 * Mutation: `mutation(...args)` returns `Promise<TResult>`.
 * - `ready()` is `false` while running; `error()` holds the latest error;
 *   `status()` provides detailed state.
 * - `onFulfill`, `onReject`, and `onSettle` are events available for subscription.
 */
export type MutationResult<TArgs extends unknown[], TResult> = Action<
  TArgs,
  Promise<TResult>
> &
  AsyncExt<TArgs, TResult, Error | undefined>;

/**
 * A mutation with cancellation support.
 * @param options {@link MutationOptions} with `abort`.
 * @returns {@link MutationResult} plus `abort()` to cancel all active calls.
 */
export function reatomMutation<TArgs extends unknown[], TResult>(
  options: MutationOptions<TArgs, TResult> & { abort: MutationAbortStrategy },
): MutationResult<TArgs, TResult> & AbortExt;
/**
 * A mutation whose calls run in parallel without cancellation.
 * @param options {@link MutationOptions}
 * @returns {@link MutationResult}
 * @example
 * const updateTeacher = reatomMutation({
 *   name: 'updateTeacher',
 *   mutationFn: (id: string, patch: Partial<Teacher>) => api.updateTeacher(id, patch),
 * });
 *
 * teacherById.invalidateOn(updateTeacher, (_saved, id) => [id]);
 */
export function reatomMutation<TArgs extends unknown[], TResult>(
  options: MutationOptions<TArgs, TResult>,
): MutationResult<TArgs, TResult>;
export function reatomMutation<TArgs extends unknown[], TResult>({
  name,
  mutationFn,
  onSuccess,
  abort,
}: MutationOptions<TArgs, TResult>) {
  const target = action(
    async (...args: TArgs): Promise<TResult> => await wrap(mutationFn(...args)),
    name,
  );

  const mutation = abort
    ? target.extend(withAbort(abort), withAsync({ status: true }))
    : target.extend(withAsync({ status: true }));

  if (onSuccess) {
    mutation.onFulfill.extend(
      withCallHook(({ payload, params }) => onSuccess(payload, ...params)),
    );
  }

  return mutation;
}
