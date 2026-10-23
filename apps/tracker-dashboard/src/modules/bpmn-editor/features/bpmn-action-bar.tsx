import type { ReactNode } from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import {
  ArrowUUpLeftIcon,
  ArrowUUpRightIcon,
  ArrowsOutIcon,
  CopyIcon,
  MagnifyingGlassIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { Shortcut } from '@repo/ui-kit/components/common/data-display/shortcut';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/ui-kit/components/common/floating/tooltip';
import { InlineInput } from '@repo/ui-kit/components/common/form/inline-input';
import { Card } from '@repo/ui-kit/components/common/layout/card';
import { Separator } from '@repo/ui-kit/components/common/layout/separator';

import {
  canRedoAtom,
  canUndoAtom,
  deleteSelected,
  duplicateSelected,
  fitViewport,
  redo,
  renameSelected,
  selectedElementAtom,
  undo,
  zoomIn,
  zoomOut,
} from '../models/editor-model';
import { setCommandPaletteOpen } from '../models/editor-model';

interface ActionProps {
  labelKey: string;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  active?: boolean;
}

export const BpmnSearch = reatomComponent(function BpmnSearch() {
  const { t } = useTranslation();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          intent="neutral"
          size="icon-sm"
          className="ui:size-8"
          aria-label={t('bpmnEditor.command.open')}
          onClick={() => setCommandPaletteOpen(true)}
        >
          <MagnifyingGlassIcon className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <span className="flex items-center gap-2">
          {t('bpmnEditor.command.open')}
          <Shortcut keys="Mod+k" />
        </span>
      </TooltipContent>
    </Tooltip>
  );
});

const Action = ({
  labelKey,
  children,
  onClick,
  disabled,
  destructive = false,
  active = false,
}: ActionProps) => {
  const { t } = useTranslation();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={active ? 'solid' : 'ghost'}
          intent={active ? 'primary' : destructive ? 'destructive' : 'neutral'}
          size="icon-sm"
          className="size-8"
          aria-label={t(labelKey)}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{t(labelKey)}</TooltipContent>
    </Tooltip>
  );
};

/** Swaps between the general viewport actions and the selection actions. */
const ContextActions = reatomComponent(function ContextActions() {
  const { t } = useTranslation();
  const selected = selectedElementAtom();

  if (!selected) {
    return (
      <>
        <Action labelKey="bpmnEditor.toolbar.zoomOut" onClick={() => zoomOut()}>
          <MagnifyingGlassMinusIcon className="size-4" />
        </Action>
        <Action labelKey="bpmnEditor.toolbar.zoomIn" onClick={() => zoomIn()}>
          <MagnifyingGlassPlusIcon className="size-4" />
        </Action>
        <Action labelKey="bpmnEditor.toolbar.fit" onClick={() => fitViewport()}>
          <ArrowsOutIcon className="size-4" />
        </Action>
      </>
    );
  }

  return (
    <>
      <InlineInput
        className="w-min max-w-48 text-sm"
        value={selected.name}
        placeholder={t('bpmnEditor.menu.untitled')}
        onValueChange={renameSelected}
      />

      <Separator orientation="vertical" className="max-h-5" />

      <Action
        labelKey="bpmnEditor.menu.duplicate"
        onClick={() => duplicateSelected()}
      >
        <CopyIcon className="size-4" />
      </Action>
      <Action
        labelKey="bpmnEditor.menu.delete"
        destructive
        onClick={() => deleteSelected()}
      >
        <TrashIcon className="size-4" />
      </Action>
    </>
  );
});

interface BpmnActionBarProps {
  centerContent?: ReactNode;
  rightActions?: ReactNode;
}

/**
 * Single-row top action bar. Three fixed zones so the bar never reflows:
 * history on the left, context-aware actions in the middle, global actions on
 * the right. The centre swaps between viewport controls and the actions for the
 * current selection.
 */
export const BpmnActionBar = reatomComponent(function BpmnActionBar({
  centerContent,
  rightActions,
}: BpmnActionBarProps) {
  const canUndo = canUndoAtom();
  const canRedo = canRedoAtom();

  return (
    <Card
      className={
        centerContent
          ? 'grid h-12 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 px-2 py-1 shadow-lg'
          : 'flex h-12 flex-row flex-nowrap items-center justify-between gap-1 px-2 py-1 shadow-lg'
      }
    >
      <div
        className={`min-w-0 items-center gap-1 ${centerContent ? 'invisible md:visible md:flex' : 'flex'}`}
      >
        <Action
          labelKey="bpmnEditor.topbar.undo"
          disabled={!canUndo}
          onClick={undo}
        >
          <ArrowUUpLeftIcon className="size-4" />
        </Action>
        <Action
          labelKey="bpmnEditor.topbar.redo"
          disabled={!canRedo}
          onClick={redo}
        >
          <ArrowUUpRightIcon className="size-4" />
        </Action>
        <Separator orientation="vertical" className="mx-1 max-h-5 shrink-0" />
        <ContextActions />
      </div>

      {centerContent && (
        <div className="flex min-w-0 items-center justify-center gap-1">
          <Separator
            orientation="vertical"
            className="mx-1 hidden max-h-5 shrink-0 md:block"
          />
          {centerContent}
          <Separator
            orientation="vertical"
            className="mx-1 hidden max-h-5 shrink-0 md:block"
          />
        </div>
      )}

      <div
        className={`flex shrink-0 items-center gap-1 ${centerContent ? 'justify-self-end' : ''}`}
      >
        <BpmnSearch />
        {rightActions}
      </div>
    </Card>
  );
});
