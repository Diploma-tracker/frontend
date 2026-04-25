import { DEFAULT_ACTIONS_PARAMS } from './constants';
import type { Action } from './types';

export const preprocessActions = <TData>(actions: Action<TData>[]): Action<TData>[] => {
  return actions.map((action) => {
    const newAction = { ...DEFAULT_ACTIONS_PARAMS, ...action };
    const originalAction = newAction.action;

    newAction.action = async (state: TData) => {
      try {
        await originalAction(state);
        newAction.onSuccess?.(state);
      } catch (error) {
        newAction.onError?.(state, error);
      }
    };

    if (!newAction.label) {
      newAction.label = newAction.key;
    }

    return newAction;
  });
};
