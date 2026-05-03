import { DotsThreeVerticalIcon } from '@phosphor-icons/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui-kit/components/dropdown-menu';

import type { ActionCellTriggerProps } from './types';
import { actionToButton } from './utils';

export const ActionCellDropdown = <TData,>({
  actions,
  actionOnSelects,
}: ActionCellTriggerProps<TData>) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-xs">
          <DotsThreeVerticalIcon weight="bold" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map(({ key, label, variant }) => (
          <DropdownMenuItem
            key={key}
            variant={variant}
            onSelect={() => actionOnSelects[key]?.()}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const ActionCellButton = <TData,>({
  actions,
  actionOnSelects,
}: ActionCellTriggerProps<TData>) => {
  const action = actions[0];
  if (!action) return null;
  const { key, label, variant, icon } = action;

  const renderLabel = () => {
    if (icon) return icon;
    return label;
  };

  return (
    <Button
      {...actionToButton(variant, !!icon)}
      onClick={() => actionOnSelects[key]?.()}
    >
      {renderLabel()}
    </Button>
  );
};
