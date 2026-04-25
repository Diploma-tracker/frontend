import type { ReactNode } from 'react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';

export type ActionVariant = 'default' | 'destructive';

export interface Action<TData> {
  action: (state: TData) => Promise<void>;
  isActive: (state: TData) => boolean;
  key: string;
  label?: ReactNode;
  variant?: ActionVariant;
  onSuccess?: (state: TData) => void;
  onError?: (state: TData, error: unknown) => void;
  modal?: {
    title: ReactNode;
    description?: ReactNode;
    confirmLabel?: ReactNode;
    cancelLabel?: ReactNode;
    confirmVariant?: React.ComponentProps<typeof Button>['variant'];
    // If true, the confirmation button will show a loading state while the action is being executed.
    enablePendingState?: boolean;
  };
}

export interface ActionColumnOptions {
  // If true, only one action will be shown as a button, and the rest will be in the dropdown. If false, all actions will be in the dropdown.
  singleButton?: boolean;
  // If true, the action cell will be hidden if there are no active actions. If false, the cell will be rendered but empty.
  hideOnEmpty?: boolean;
}

export type ActionCellTriggerProps<TData> = {
  actions: Action<TData>[];
  actionOnSelects: Record<string, () => void>;
};
