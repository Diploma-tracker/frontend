import { useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { Kbd } from '@repo/ui-kit/components/common/data-display/kbd';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/ui-kit/components/common/floating/tooltip';
import { Card } from '@repo/ui-kit/components/common/layout/card';
import { ScrollArea } from '@repo/ui-kit/components/common/layout/scroll-area';
import { cn } from '@repo/ui-kit/lib/utils';

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

interface RailButtonProps {
  labelKey: string;
  descriptionKey: string;
  shortcut?: string;
  active?: boolean;
  children: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * A single rail entry. The tooltip carries the name, the description and — only
 * where bpmn-js actually binds one — the keyboard shortcut.
 */
const RailButton = ({
  labelKey,
  descriptionKey,
  shortcut,
  active = false,
  children,
  onClick,
}: RailButtonProps) => {
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
        {shortcut && <Kbd className="mt-0.5 w-fit">{shortcut}</Kbd>}
      </TooltipContent>
    </Tooltip>
  );
};

const ToolRailItem = reatomComponent(function ToolRailItem({
  entry,
  active,
}: {
  entry: ToolEntry;
  active: boolean;
}) {
  const Icon = entry.icon;

  return (
    <RailButton
      labelKey={entry.labelKey}
      descriptionKey={entry.descriptionKey}
      shortcut={entry.shortcut}
      active={active}
      onClick={(event) => activateTool(entry.tool, event.nativeEvent)}
    >
      <Icon className="size-4" />
    </RailButton>
  );
});

const CreateRailItem = reatomComponent(function CreateRailItem({
  element,
}: {
  element: PaletteElement;
}) {
  const Icon = element.icon;

  return (
    <RailButton
      labelKey={element.labelKey}
      descriptionKey={element.descriptionKey}
      onClick={() => spawnPaletteElement(element)}
    >
      <Icon className="size-4" />
    </RailButton>
  );
});

/**
 * Slim vertical rail in place of the built-in bpmn-js palette, which stays
 * hidden via `bpmn-canvas.css`. Icons only — every entry explains itself in its
 * tooltip, together with its shortcut where bpmn-js defines one.
 */
export const BpmnToolRail = reatomComponent(function BpmnToolRail() {
  const activeTool = activeToolAtom();

  return (
    <Card className="ui:flex ui:h-full ui:min-h-0 ui:flex-col ui:gap-1 ui:overflow-hidden ui:shadow-lg w-16 p-1.5">
      <ScrollArea className="h-full min-h-0">
        <div className="flex flex-col items-center gap-1 pb-1">
          {toolEntries.map((entry) => (
            <div
              key={entry.id}
              className={cn('flex flex-col items-center gap-1')}
            >
              <ToolRailItem entry={entry} active={activeTool === entry.tool} />
            </div>
          ))}

          {createEntries.map(({ group, elements }) => (
            <div
              key={group.id}
              className="flex flex-col items-center gap-1 border-t pt-1.5"
            >
              {elements.map((element) => (
                <CreateRailItem key={element.id} element={element} />
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
});
