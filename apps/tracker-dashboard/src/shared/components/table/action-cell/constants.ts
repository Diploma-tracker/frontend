import type { Action, ActionColumnOptions } from './types';

export const DEFAULT_ACTIONS_PARAMS: Partial<Action<unknown>> = {
  isActive: () => false,
  variant: 'default',
};

export const DEFAULT_MODAL_PARAMS: Partial<Action<unknown>['modal']> = {
  confirmVariant: 'default',
  enablePendingState: false,
};

export const DEFAULT_OPTIONS: Partial<ActionColumnOptions> = {
  singleButton: true,
  hideOnEmpty: true,
};
