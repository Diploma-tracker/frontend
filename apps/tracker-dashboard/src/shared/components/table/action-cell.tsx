import { useState } from 'react';

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
  name: string;
  variant?: ActionVariant;
  onSuccess?: (state: TData) => void;
  onError?: (state: TData, error: unknown) => void;
  modal?: {
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmVariant?: React.ComponentProps<typeof Button>['variant'];
    // If true, the confirmation button will show a loading state while the action is being executed.
    enablePandingState?: boolean;
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
  enablePandingState: false,
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
        {actions.map(({ name, variant }) => (
          <DropdownMenuItem key={name} variant={variant} onSelect={() => actionOnSelects[name]?.()}>
            {name}
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
  const { name, variant } = action;

  const handleClick = () => {
    actionOnSelects[name]?.();
  };

  return (
    <Button variant={variant} onClick={handleClick}>
      {name}
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
    if (!modal?.enablePandingState) {
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

export const actionCell = <TData,>(actions: Action<TData>[], options?: ActionColumnOptions) => {
  actions = actions.map((action) => ({ ...DEFAULT_ACTIONS_PARAMS, ...action }));
  for (const action of actions) {
    action.action = async (state: TData) => {
      try {
        await action.action(state);
        action.onSuccess?.(state);
      } catch (error) {
        action.onError?.(state, error);
      }
    };
  }
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
      (acc, { name, action, modal }) => {
        if (modal) {
          acc[name] = () => setModalOpen(name)(true);
        } else {
          acc[name] = () => action(state);
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
              key={action.name}
              open={isModalOpen(action.name)}
              onOpenChange={setModalOpen(action.name)}
              action={action}
              state={state}
            ></ActionConfirmationModal>
          ))}
      </>
    );
  };
};
