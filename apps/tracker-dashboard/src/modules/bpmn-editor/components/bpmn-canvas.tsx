import { useEffect, useRef } from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import type { Element } from 'bpmn-js/lib/model/Types';

import {
  clearSelection,
  exportXml,
  getServices,
  importXml,
  zoomToFit,
} from '../model/diagram-api';
import {
  activeToolAtom,
  describeElement,
  duplicateSelected,
  fitViewport,
  isReadyAtom,
  readStats,
  setActiveTool,
  setCanvasSize,
  setError,
  setModeler,
  setReady,
  setSelectedElement,
  setStats,
  setTool,
  setUndoRedoState,
  setXml,
} from '../model/editor-model';
import { starterDiagramXml } from '../model/starter-diagram';
import './bpmn-canvas.css';

import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/diagram-js.css';

export const BpmnCanvas = reatomComponent(function BpmnCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const modeler = new BpmnModeler({
      container,
      // Inline styles resolve CSS variables, so the diagram uses the app font.
      textRenderer: { defaultStyle: { fontFamily: 'var(--font-sans)' } },
      /**
       * `bpmnRenderer` is a documented config path: `BpmnRenderer.$inject` asks
       * for `config.bpmnRenderer`, and `config` is the modeler options object.
       *
       * The defaults are handed over as unresolved `var()` references rather
       * than resolved colours. They land on the shapes as SVG presentation
       * attributes, which resolve against the diagram tokens in
       * `packages/tailwind-config/tokens.css` — so the whole diagram follows the
       * app theme, and light/dark switching needs no re-import. Anything that
       * sets a real colour on bpmndi still wins, because `getFillColor` /
       * `getStrokeColor` prefer it over the default.
       */
      bpmnRenderer: {
        defaultFillColor: 'var(--bpmn-element-bg)',
        defaultStrokeColor: 'var(--bpmn-stroke)',
        defaultLabelColor: 'var(--bpmn-element-fg)',
      },
      additionalModules: [
        {
          paletteProvider: ['value', null],
        },
      ],
    });

    setModeler(modeler);

    const eventBus = getServices(modeler).eventBus;

    /**
     * bpmn-js measures its container once, at import time. Inside a flex/grid
     * page the container has no usable size yet at that point, which would fit
     * the diagram at a near-zero zoom. Re-measure on every resize and re-fit
     * once the container is actually laid out.
     */
    let hasAutoFitted = false;

    const observer = new ResizeObserver(() => {
      const { canvas } = getServices(modeler);

      canvas.resized();

      const { width, height } = canvas.getSize();

      setCanvasSize({ width, height });

      if (hasAutoFitted || width === 0 || height === 0) return;

      hasAutoFitted = true;
      zoomToFit(modeler);
    });

    observer.observe(container);

    /**
     * The tool manager broadcasts the active tool on `tool-manager.update`; the
     * built-in palette highlights from the same event, and so does the tool
     * rail.
     */
    eventBus.on('tool-manager.update', (event: { tool?: string | null }) => {
      setActiveTool(event.tool ?? null);
    });

    eventBus.on('import.done', () => {
      setReady(true);
      setTool();
      setStats(readStats());
    });

    eventBus.on('selection.changed', (event: { newSelection: Element[] }) => {
      const [selected] = event.newSelection;

      setSelectedElement(describeElement(selected));
    });

    /**
     * `commandStack.changed` is the single reliable notification that the
     * diagram was modified — it covers create/remove/move/replace as well as
     * undo and redo. bpmn-js does not re-fire `shape.create` / `connection.create`
     * on the event bus; those names only exist on the command stack.
     */
    eventBus.on('commandStack.changed', async () => {
      setStats(readStats());

      const { commandStack } = getServices(modeler);

      setUndoRedoState(commandStack.canUndo(), commandStack.canRedo());

      const { xml, error } = await exportXml(modeler);

      if (error) {
        setError(error);

        return;
      }

      setXml(xml);
    });

    /**
     * Deletion, undo and redo are handled by bpmn-js's own keyboard binding.
     * Only the shortcuts it does not cover are handled here.
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      if (isTyping) return;

      const meta = event.metaKey || event.ctrlKey;

      if (event.key === 'Escape') {
        clearSelection(modeler);
        setSelectedElement(null);
        setTool();
      } else if (meta && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        duplicateSelected();
      } else if (meta && event.key === '0') {
        event.preventDefault();
        fitViewport();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    importXml(modeler, starterDiagramXml)
      .then(({ error }) => {
        if (error) setError(error);
      })
      .catch((error: unknown) => {
        setError(error instanceof Error ? error.message : String(error));
      });

    return () => {
      observer.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
      modeler.destroy();
      setModeler(null);
      setReady(false);
      setSelectedElement(null);
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="h-full w-full"
        data-tool={activeToolAtom() ?? 'default'}
      />
      {!isReadyAtom() && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70">
          <span className="text-sm text-muted-foreground">
            {t('bpmnEditor.loading')}
          </span>
        </div>
      )}
    </div>
  );
});
