import type { ReactNode } from 'react';

export type ActionVatiant = 'default' | 'destructive';

export interface Action<TData> {
  key: string;
  label?: ReactNode;
  icon?: ReactNode;
  isActive?: (state: TData) => boolean;
  variant?: ActionVatiant;
  action?: (state: TData) => Promise<void>;
  link?: (state: TData) => {
    to: string;
    params?: Record<string, string | number>;
  };
  onSuccess?: (state: TData) => void;
  onError?: (state: TData, error: unknown) => void;
  modal?: {
    title: ReactNode;
    description?: ReactNode;
    confirmLabel?: ReactNode;
    cancelLabel?: ReactNode;
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
