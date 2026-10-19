import { Fragment } from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { Shortcut } from '@repo/ui-kit/components/common/data-display/shortcut';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/ui-kit/components/common/floating/tooltip';
import { Card } from '@repo/ui-kit/components/common/layout/card';
import { ScrollArea } from '@repo/ui-kit/components/common/layout/scroll-area';
import { Separator } from '@repo/ui-kit/components/common/layout/separator';

import {
  activateTool,
  activeToolAtom,
  spawnPaletteElement,
} from '../model/editor-model';
import {
  type PaletteElement,
  type ToolEntry,
  createEntries,
  toolEntries,
} from '../model/element-catalog';

interface ToolButtonProps {
  labelKey: string;
  descriptionKey: string;
  shortcut?: string;
  active?: boolean;
  children: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * A single toolbar entry. The tooltip carries the name, the description and —
 * only where bpmn-js actually binds one — the keyboard shortcut.
 */
const ToolButton = ({
  labelKey,
  descriptionKey,
  shortcut,
  active = false,
  children,
  onClick,
}: ToolButtonProps) => {
  const { t } = useTranslation();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={active ? 'solid' : 'ghost'}
          intent={active ? 'primary' : 'neutral'}
          size="icon-sm"
          className="ui:size-9 ui:rounded-md"
          aria-label={t(labelKey)}
          aria-pressed={active}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="flex max-w-64 flex-col gap-1">
        <span className="font-semibold">{t(labelKey)}</span>
        <span className="text-background/70">{t(descriptionKey)}</span>
        {shortcut && <Shortcut keys={shortcut} className="mt-0.5 w-fit" />}
      </TooltipContent>
    </Tooltip>
  );
};

const ToolBarItem = reatomComponent(function ToolBarItem({
  entry,
  active,
}: {
  entry: ToolEntry;
  active: boolean;
}) {
  const Icon = entry.icon;

  return (
    <ToolButton
      labelKey={entry.labelKey}
      descriptionKey={entry.descriptionKey}
      shortcut={entry.shortcut}
      active={active}
      onClick={(event) => activateTool(entry.tool, event.nativeEvent)}
    >
      <Icon className="size-4" />
    </ToolButton>
  );
});

const CreateBarItem = reatomComponent(function CreateBarItem({
  element,
}: {
  element: PaletteElement;
}) {
  const Icon = element.icon;

  return (
    <ToolButton
      labelKey={element.labelKey}
      descriptionKey={element.descriptionKey}
      onClick={() => spawnPaletteElement(element)}
    >
      <Icon className="size-4" />
    </ToolButton>
  );
});

/**
 * Slim vertical rail in place of the built-in bpmn-js palette, which stays
 * hidden via `bpmn-canvas.css`. Icons only — every entry explains itself in its
 * tooltip, together with its shortcut where bpmn-js defines one.
 */
export const BpmnToolBar = reatomComponent(function BpmnToolBar() {
  const activeTool = activeToolAtom();

  return (
    <Card className="ui:flex ui:h-full ui:min-h-0 ui:flex-col ui:gap-1 ui:overflow-hidden ui:shadow-lg w-16 p-1.5">
      <ScrollArea className="h-full min-h-0">
        <div className="flex flex-col items-center gap-1 pb-1">
          {toolEntries.map((entry) => (
            <ToolBarItem
              key={entry.id}
              entry={entry}
              active={activeTool === entry.tool}
            />
          ))}

          {createEntries.map(({ group, elements }) => (
            <Fragment key={group.id}>
              <Separator className="my-1" />
              <div className="flex flex-col items-center gap-1">
                {elements.map((element) => (
                  <CreateBarItem key={element.id} element={element} />
                ))}
              </div>
            </Fragment>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
});
