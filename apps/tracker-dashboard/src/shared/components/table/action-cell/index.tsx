import { useState } from 'react';

import { type Row } from '@tanstack/react-table';

import { ActionCellButton, ActionCellDropdown } from './action-cell-triggers';
import { ActionConfirmationModal } from './action-confirmation-modal';
import { DEFAULT_OPTIONS } from './constants';
import type { Action, ActionColumnOptions } from './types';
import { preprocessActions } from './utils';

export const actionCell = <TData,>(actions: Action<TData>[], options?: ActionColumnOptions) => {
  actions = preprocessActions(actions);
  options = { ...DEFAULT_OPTIONS, ...(options ?? {}) };

  // eslint-disable-next-line react/display-name
  return ({ row }: { row: Row<TData> }) => {
    const state = row.original;
    const [modalsOpen, setModalsOpen] = useState<Record<string, boolean>>({});

    const setModalOpen = (key: string) => (value: boolean) => setModalsOpen((prev) => ({ ...prev, [key]: value }));

    const isModalOpen = (key: string) => !!modalsOpen[key];

    const activeActions = actions.filter(({ isActive }) => isActive(state));
    const actionOnSelects = activeActions.reduce(
      (acc, { key, action, modal }) => {
        acc[key] = modal ? () => setModalOpen(key)(true) : () => action(state);
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
            />
          ))}
      </>
    );
  };
};
