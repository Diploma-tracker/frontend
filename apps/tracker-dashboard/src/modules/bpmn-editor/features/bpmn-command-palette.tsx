import { useEffect, useMemo, useRef } from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';
import type { Element } from 'bpmn-js/lib/model/Types';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@repo/ui-kit/components/command';

import {
  activateTool,
  getDiagramService,
  isCommandPaletteOpenAtom,
  revealElement,
  setCommandPaletteOpen,
  spawnPaletteElement,
} from '../models/editor-model';
import {
  type EditorToolName,
  type PaletteElement,
} from '../models/element-types';
import { createEntries, toolEntries } from './element-catalog';

interface NamedElement {
  id: string;
  type: string;
  name: string;
}

/**
 * Tools seed a drag from a pointer event and `revealElement` focuses the canvas,
 * so both run once the dialog has finished its exit transition. Running them
 * while the overlay is still on screen would let its fade-out mousemoves start
 * the tool or steal the focus back.
 */
const ACTION_DELAY = 250;

const collectNamedElements = (): NamedElement[] => {
  const service = getDiagramService();

  if (!service) return [];

  return service
    .getAllElements()
    .filter(
      (element): element is Element =>
        element.type !== 'label' && !!element.businessObject?.name,
    )
    .map((element) => ({
      id: element.id,
      type: element.type,
      name: element.businessObject.name as string,
    }));
};

/**
 * Everything the editor can do from one input: switch the interaction tool,
 * create a palette element and jump to a named element on the canvas. Opened
 * from the top bar (`BpmnSearch`) or with Ctrl/Cmd+K.
 */
export const BpmnCommandPalette = reatomComponent(
  function BpmnCommandPalette() {
    const { t } = useTranslation();
    const open = isCommandPaletteOpenAtom();
    const lastPointerEvent = useRef<Event | null>(null);
    const pendingAction = useRef<(() => void) | null>(null);

    const hits = useMemo(() => (open ? collectNamedElements() : []), [open]);

    useEffect(() => {
      if (open || !pendingAction.current) return;

      const action = pendingAction.current;
      pendingAction.current = null;

      const timer = window.setTimeout(action, ACTION_DELAY);

      return () => window.clearTimeout(timer);
    }, [open]);

    const runAfterClose = (action: () => void) => {
      pendingAction.current = action;
      setCommandPaletteOpen(false);
    };

    const handlePointerDownCapture = (
      event: React.PointerEvent<HTMLDivElement>,
    ) => {
      lastPointerEvent.current = event.nativeEvent;
    };

    /**
     * bpmn-js needs a pointer event even when the tool is armed from the palette,
     * so fall back to the viewport centre when the entry was reached by keyboard.
     */
    const createToolEvent = (): Event => {
      if (lastPointerEvent.current) return lastPointerEvent.current;

      return new MouseEvent('mousedown', {
        button: 0,
        clientX: window.innerWidth / 2,
        clientY: window.innerHeight / 2,
      });
    };

    const handleSelectTool = (tool: EditorToolName) => {
      const event = createToolEvent();

      runAfterClose(() => activateTool(tool, event));
    };

    const handleCreate = (element: PaletteElement) => {
      setCommandPaletteOpen(false);
      spawnPaletteElement(element);
    };

    const handleSelectHit = (id: string) => {
      runAfterClose(() => revealElement(id));
    };

    return (
      <CommandDialog
        open={open}
        onOpenChange={setCommandPaletteOpen}
        title={t('bpmnEditor.command.title')}
        description={t('bpmnEditor.command.description')}
      >
        <CommandInput placeholder={t('bpmnEditor.command.placeholder')} />
        <CommandList onPointerDownCapture={handlePointerDownCapture}>
          <CommandEmpty>{t('bpmnEditor.command.empty')}</CommandEmpty>

          <CommandGroup heading={t('bpmnEditor.command.tools')}>
            {toolEntries.map((entry) => {
              const Icon = entry.icon;

              return (
                <CommandItem
                  key={entry.id}
                  onSelect={() => handleSelectTool(entry.tool)}
                >
                  <Icon />
                  <span>{t(entry.labelKey)}</span>
                  {entry.shortcut ? (
                    <CommandShortcut>{entry.shortcut}</CommandShortcut>
                  ) : null}
                </CommandItem>
              );
            })}
          </CommandGroup>

          {createEntries.map(({ group, elements }) => (
            <CommandGroup key={group.id} heading={t(group.labelKey)}>
              {elements.map((element) => {
                const Icon = element.icon;

                return (
                  <CommandItem
                    key={element.id}
                    onSelect={() => handleCreate(element)}
                  >
                    <Icon />
                    <span>{t(element.labelKey)}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}

          {hits.length > 0 ? (
            <CommandGroup heading={t('bpmnEditor.command.navigate')}>
              {hits.map((hit) => (
                <CommandItem
                  key={hit.id}
                  onSelect={() => handleSelectHit(hit.id)}
                >
                  <span className="truncate font-medium">{hit.name}</span>
                  <span className="ml-auto truncate text-xs text-muted-foreground">
                    {hit.type}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      </CommandDialog>
    );
  },
);
