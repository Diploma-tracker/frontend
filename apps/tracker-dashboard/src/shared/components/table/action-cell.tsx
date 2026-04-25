import { useState, type ReactNode } from 'react';

import { ConfirmationModal } from '@/shared/components';
import { DotsThreeVerticalIcon } from '@phosphor-icons/react';
import { type Row } from '@tanstack/react-table';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui-kit/components/dropdown-menu';

type ActionVariant = 'default' | 'destructive';

interface Action<TData> {
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

interface ActionColumnOptions {
  // If true, only one action will be shown as a button, and the rest will be in the dropdown. If false, all actions will be in the dropdown.
  singleButton?: boolean;
  // If true, the action cell will be hidden if there are no active actions. If false, the cell will be rendered but empty.
  hideOnEmpty?: boolean;
}

const DEFAULT_ACTIONS_PARAMS: Partial<Action<unknown>> = {
  isActive: () => false,
  variant: 'default',
};

const DEFAULT_MODAL_PARAMS: Partial<Action<unknown>['modal']> = {
  confirmVariant: 'default',
  enablePendingState: false,
};

const DEFAULT_OPTIONS: Partial<ActionColumnOptions> = {
  singleButton: true,
  hideOnEmpty: true,
};

type ActionCellTriggerProps<TData> = {
  actions: Action<TData>[];
  actionOnSelects: Record<string, () => void>;
};

// eslint-disable-next-line react-refresh/only-export-components
const ActionCellDropdown = <TData,>({ actions, actionOnSelects }: ActionCellTriggerProps<TData>) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-xs">
          <DotsThreeVerticalIcon weight="bold" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map(({ key, label, variant }) => (
          <DropdownMenuItem key={key} variant={variant} onSelect={() => actionOnSelects[key]?.()}>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
const ActionCellButton = <TData,>({ actions, actionOnSelects }: ActionCellTriggerProps<TData>) => {
  const action = actions[0];
  if (!action) return null;
  const { key, label, variant } = action;

  const handleClick = () => {
    actionOnSelects[key]?.();
  };

  return (
    <Button variant={variant} onClick={handleClick}>
      {label}
    </Button>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
const ActionConfirmationModal = <TData,>({
  action,
  state,
  open,
  onOpenChange,
}: {
  action: Action<TData>;
  state: TData;
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) => {
  const modal = { ...DEFAULT_MODAL_PARAMS, ...action.modal };
  const [isPending, setIsPending] = useState(false);

  const handleConfirm = async () => {
    if (!modal?.enablePendingState) {
      await action.action(state);
      onOpenChange(false);
      return;
    }
    setIsPending(true);
    await action.action(state);
    setIsPending(false);
    onOpenChange(false);
  };

  const handleOpenChange = (value: boolean) => {
    if (!isPending) onOpenChange(value);
  };

  return (
    <ConfirmationModal
      open={open}
      onOpenChange={handleOpenChange}
      isPending={isPending}
      onConfirm={handleConfirm}
      title={modal?.title}
      description={modal?.description}
      confirmLabel={modal?.confirmLabel}
      cancelLabel={modal?.cancelLabel}
      confirmVariant={modal?.confirmVariant}
    />
  );
};

const preprocessActions = <TData,>(actions: Action<TData>[]): Action<TData>[] => {
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

export const actionCell = <TData,>(actions: Action<TData>[], options?: ActionColumnOptions) => {
  actions = preprocessActions(actions);
  options = { ...DEFAULT_OPTIONS, ...(options ?? {}) };

  // eslint-disable-next-line react/display-name
  return ({ row }: { row: Row<TData> }) => {
    const state = row.original;
    const [modalsOpen, setModalsOpen] = useState<Record<string, boolean>>({});

    const setModalOpen = (modalType: string) => (value: boolean) =>
      setModalsOpen((prev) => ({ ...prev, [modalType]: value }));

    const isModalOpen = (modalType: string) => !!modalsOpen[modalType];

    const activeActions = actions.filter(({ isActive }) => isActive(state));
    const actionOnSelects = activeActions.reduce(
      (acc, { key, action, modal }) => {
        if (modal) {
          acc[key] = () => setModalOpen(key)(true);
        } else {
          acc[key] = () => action(state);
        }
        return acc;
      },
      {} as Record<string, () => void>
    );

    const renderActionTrigger = () => {
      if (options.hideOnEmpty && !activeActions.length) return null;
      if (options.singleButton && activeActions.length === 1) {
        return <ActionCellButton actions={activeActions} actionOnSelects={actionOnSelects} />;
      }
      return <ActionCellDropdown actions={activeActions} actionOnSelects={actionOnSelects} />;
    };

    return (
      <>
        {renderActionTrigger()}
        {activeActions
          .filter(({ modal }) => !!modal)
          .map((action) => (
            <ActionConfirmationModal
              key={action.key}
              open={isModalOpen(action.key)}
              onOpenChange={setModalOpen(action.key)}
              action={action}
              state={state}
            ></ActionConfirmationModal>
          ))}
      </>
    );
  };
};
