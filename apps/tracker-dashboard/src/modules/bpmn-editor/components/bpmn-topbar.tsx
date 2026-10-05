import { useState } from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import {
  ArrowUUpLeftIcon,
  ArrowUUpRightIcon,
  ArrowsInLineVerticalIcon,
  ArrowsOutLineVerticalIcon,
  ArrowsOutSimpleIcon,
  CopyIcon,
  FingerprintIcon,
  FloppyDiskIcon,
  TrashIcon,
  XIcon,
} from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/ui-kit/components/common/floating/tooltip';
import { InlineInput } from '@repo/ui-kit/components/common/form/inline-input';
import { Card } from '@repo/ui-kit/components/common/layout/card';

import { saveDiagram } from '../model/diagram-persistence';
import {
  canRedoAtom,
  canUndoAtom,
  cancelChanges,
  deleteSelected,
  duplicateSelected,
  fitViewport,
  redo,
  renameSelected,
  resetZoom,
  selectedElementAtom,
  setError,
  undo,
  zoomIn,
  zoomOut,
} from '../model/editor-model';
import { BpmnSearch } from './bpmn-search';

interface ActionProps {
  labelKey: string;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  active?: boolean;
}

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
          <ArrowsInLineVerticalIcon className="size-4" />
        </Action>
        <Action labelKey="bpmnEditor.toolbar.zoomReset" onClick={resetZoom}>
          <ArrowsOutSimpleIcon className="size-4" />
        </Action>
        <Action labelKey="bpmnEditor.toolbar.zoomIn" onClick={() => zoomIn()}>
          <ArrowsOutLineVerticalIcon className="size-4" />
        </Action>
        <Action labelKey="bpmnEditor.toolbar.fit" onClick={() => fitViewport()}>
          <FingerprintIcon className="size-4" />
        </Action>
      </>
    );
  }

  return (
    <>
      <InlineInput
        className="max-w-48 text-sm"
        value={selected.name}
        placeholder={t('bpmnEditor.menu.untitled')}
        onValueChange={renameSelected}
      />

      <div className="h-5 w-px bg-border" />

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

/**
 * Single-row top bar. Three fixed zones so the bar never reflows: history on the
 * left, context-aware actions in the middle, global actions on the right. The
 * centre swaps between viewport controls and the actions for the current
 * selection.
 */
export const BpmnTopbar = reatomComponent(function BpmnTopbar() {
  const canUndo = canUndoAtom();
  const canRedo = canRedoAtom();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    const { error } = await saveDiagram();

    setIsSaving(false);

    if (error) setError(error);
  };

  return (
    <Card className="flex- flex h-12 flex-row flex-nowrap items-center gap-1 px-2 py-1 shadow-lg">
      <div className="flex shrink-0 items-center gap-1">
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
      </div>

      <div className="mx-1 h-5 w-px shrink-0 bg-border" />

      <div className="flex min-w-0 flex-1 items-center gap-1">
        <ContextActions />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <BpmnSearch />
        <Action
          labelKey="bpmnEditor.topbar.save"
          disabled={isSaving}
          onClick={handleSave}
        >
          <FloppyDiskIcon className="size-4" />
        </Action>
        <Action labelKey="bpmnEditor.topbar.cancel" onClick={cancelChanges}>
          <XIcon className="size-4" />
        </Action>
      </div>
    </Card>
  );
});
