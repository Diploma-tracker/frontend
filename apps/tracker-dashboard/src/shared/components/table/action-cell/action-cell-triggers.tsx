import { DotsThreeVerticalIcon } from '@phosphor-icons/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui-kit/components/dropdown-menu';

import type { ActionCellTriggerProps } from './types';

export const ActionCellDropdown = <TData,>({ actions, actionOnSelects }: ActionCellTriggerProps<TData>) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-xs">
          <DotsThreeVerticalIcon weight="bold" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map(({ key, label }) => (
          <DropdownMenuItem key={key} variant="default" onSelect={() => actionOnSelects[key]?.()}>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const ActionCellButton = <TData,>({ actions, actionOnSelects }: ActionCellTriggerProps<TData>) => {
  const action = actions[0];
  if (!action) return null;
  const { key, label, variant, size, intent } = action;

  return (
    <Button variant={variant} size={size} intent={intent} onClick={() => actionOnSelects[key]?.()}>
      {label}
    </Button>
  );
};
