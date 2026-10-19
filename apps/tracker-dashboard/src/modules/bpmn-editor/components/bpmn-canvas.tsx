import { useEffect, useRef } from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';
import BpmnModeler from 'bpmn-js/lib/Modeler';

import { refreshStageState } from '../model/actions/stages';
import customModdle from '../model/custom-moddle.json';
import { describeElement } from '../model/definitions/element-definitions';
import {
  activeToolAtom,
  editorErrorKeys,
  isReadyAtom,
  setActiveTool,
  setError,
  setModeler,
  setReady,
  setSelectedElement,
  setTool,
  setUndoRedoState,
} from '../model/editor-model';
import { starterDiagramXml } from '../model/starter-diagram';
import './bpmn-canvas.css';
import FlowRenderer from './renderers/flow-renderer';
import StageRenderer from './renderers/stage-renderer';
import TaskRenderer from './renderers/task-renderer';

import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/diagram-js.css';

/** Diagram-space distance between grid dots, in px at 100% zoom. */
const GRID_STEP = 40;

/** Smallest on-screen spacing before the grid doubles up a step. */
const MIN_GRID_PX = 24;

/** Dot radius in px at 100% zoom; scales with the viewbox so dots read as sized. */
const DOT_RADIUS = 2;

/** Clamps for the zoom-scaled dot radius, in px. */
const MIN_DOT_PX = 1;
const MAX_DOT_PX = 5;

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
      moddleExtensions: {
        custom: customModdle,
      },
      // Higher-priority renderers: `taskRenderer` tints the supported task
      // kinds, `flowRenderer` colours gateway approve/reject branches, and
      // `stageRenderer` marks subprocesses flagged as stages.
      // `__init__` forces them to be constructed so they subscribe to the render
      // events; without it didi would never instantiate the lazy services.
      additionalModules: [
        {
          __init__: ['taskRenderer', 'flowRenderer', 'stageRenderer'],
          taskRenderer: ['type', TaskRenderer],
          flowRenderer: ['type', FlowRenderer],
          stageRenderer: ['type', StageRenderer],
        },
      ],
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
    });

    const service = setModeler(modeler);

    const disposers: Array<() => void> = [];

    /**
     * The dot grid lives on `.djs-container` as a CSS background, but bpmn-js
     * pans/zooms by transforming an inner <svg> — a plain background would stay
     * pinned to the viewport. Recomputing the tile size and offset from the
     * viewbox keeps the dots moving and scaling with the diagram.
     */
    const updateGrid = (viewbox: { x: number; y: number; scale: number }) => {
      let step = GRID_STEP;

      // Zoomed far out, a fixed step would smear into noise; double it up.
      while (step * viewbox.scale < MIN_GRID_PX) step *= 2;

      const size = step * viewbox.scale;
      const dot = Math.min(
        MAX_DOT_PX,
        Math.max(MIN_DOT_PX, DOT_RADIUS * viewbox.scale),
      );

      container.style.setProperty('--djs-grid-size', `${size}px`);
      container.style.setProperty('--djs-grid-dot', `${dot}px`);
      container.style.setProperty(
        '--djs-grid-offset-x',
        `${(-viewbox.x * viewbox.scale) % size}px`,
      );
      container.style.setProperty(
        '--djs-grid-offset-y',
        `${(-viewbox.y * viewbox.scale) % size}px`,
      );
    };

    updateGrid(service.getViewbox());

    disposers.push(service.onViewboxChanged(updateGrid));

    /**
     * bpmn-js measures its container once, at import time. Inside a flex/grid
     * page the container has no usable size yet at that point, which would fit
     * the diagram at a near-zero zoom. Re-measure on every resize and re-fit
     * once the container is actually laid out.
     */
    let hasAutoFitted = false;

    const observer = new ResizeObserver(() => {
      service.resize();

      const { width, height } = service.getCanvasSize();

      if (hasAutoFitted || width === 0 || height === 0) return;

      hasAutoFitted = true;
      service.zoomToFit();
    });

    observer.observe(container);

    /**
     * The tool manager broadcasts the active tool on `tool-manager.update`; the
     * built-in palette highlights from the same event, and so does the tool
     * rail.
     */
    disposers.push(
      service.onToolChanged((tool) => {
        setActiveTool(tool);
      }),
    );

    disposers.push(
      service.onImportDone(() => {
        setReady(true);
        setTool();
        refreshStageState();
      }),
    );

    disposers.push(
      service.onSelectionChanged((selected) => {
        if (selected.length > 1) {
          setSelectedElement(null);
        } else {
          setSelectedElement(describeElement(selected[0]));
        }
      }),
    );

    /**
     * `commandStack.changed` is the single reliable notification that the
     * diagram was modified — it covers create/remove/move/replace as well as
     * undo and redo. bpmn-js does not re-fire `shape.create` / `connection.create`
     * on the event bus; those names only exist on the command stack.
     */
    disposers.push(
      service.onDiagramChanged(() => {
        refreshStageState();
        setUndoRedoState(service.canUndo(), service.canRedo());
      }),
    );

    /**
     * Deletion, undo, redo and the editor shortcuts are handled centrally by
     * `BpmnKeyboard`; bpmn-js's own SVG-bound keyboard is detached there too.
     */

    service
      .importXml(starterDiagramXml)
      .then(({ error }) => {
        if (error) {
          console.warn('bpmn-editor: diagram import failed', error);
          setError(editorErrorKeys.importFailed);
        }
      })
      .catch((error: unknown) => {
        console.warn('bpmn-editor: diagram import failed', error);
        setError(editorErrorKeys.importFailed);
      });

    return () => {
      observer.disconnect();
      for (const dispose of disposers) dispose();
      modeler.destroy();
      setModeler(null);
      setReady(false);
      setSelectedElement(null);
      refreshStageState();
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
