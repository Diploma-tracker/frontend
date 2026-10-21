import { useEffect, useRef } from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import type { Element } from 'bpmn-js/lib/model/Types';

import { refreshStageState } from '../models/actions/stages';
import customModdle from '../models/custom-moddle.json';
import { describeElement } from '../models/definitions/element-definitions';
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
} from '../models/editor-model';
import { starterDiagramXml } from '../models/starter-diagram';
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
      textRenderer: { defaultStyle: { fontFamily: 'var(--font-sans)' } },
      moddleExtensions: {
        custom: customModdle,
      },
      additionalModules: [
        {
          __init__: ['taskRenderer', 'flowRenderer', 'stageRenderer'],
          taskRenderer: ['type', TaskRenderer],
          flowRenderer: ['type', FlowRenderer],
          stageRenderer: ['type', StageRenderer],
        },
      ],
      bpmnRenderer: {
        defaultFillColor: 'var(--bpmn-element-bg)',
        defaultStrokeColor: 'var(--bpmn-stroke)',
        defaultLabelColor: 'var(--bpmn-element-fg)',
      },
    });
    const service = setModeler(modeler);
    let disposed = false;
    let imported = false;

    const disposers: Array<() => void> = [];

    const updateGrid = (viewbox: { x: number; y: number; scale: number }) => {
      let step = GRID_STEP;

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

    let hasAutoFitted = false;

    const observer = new ResizeObserver(() => {
      const { width, height } = service.getCanvasSize();
      if (width <= 0 || height <= 0) return;
      service.resize();
      if (!imported || hasAutoFitted) return;

      hasAutoFitted = true;
      service.zoomToFit();
    });

    observer.observe(container);

    disposers.push(
      service.onToolChanged((tool: string | null) => {
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
      service.onSelectionChanged((selected: Element[]) => {
        if (selected.length > 1) {
          setSelectedElement(null);
        } else {
          setSelectedElement(describeElement(selected[0]));
        }
      }),
    );

    disposers.push(
      service.onDiagramChanged(() => {
        refreshStageState();
        setUndoRedoState(service.canUndo(), service.canRedo());
      }),
    );

    // The canvas mounts once per design session, not once per tab activation.
    service
      .importXml(starterDiagramXml)
      .then(({ error }: { error?: string }) => {
        if (disposed) return;
        if (error) {
          console.warn('bpmn-editor: diagram import failed', error);
          setError(editorErrorKeys.importFailed);
        } else {
          imported = true;
          const { width, height } = service.getCanvasSize();
          if (width > 0 && height > 0 && !hasAutoFitted) {
            service.resize();
            service.zoomToFit();
            hasAutoFitted = true;
          }
        }
      })
      .catch((error: unknown) => {
        if (disposed) return;
        console.warn('bpmn-editor: diagram import failed', error);
        setError(editorErrorKeys.importFailed);
      });
    return () => {
      disposed = true;
      observer.disconnect();
      for (const dispose of disposers) dispose();
      modeler.destroy();
      setModeler(null);
      setReady(false);
      setUndoRedoState(false, false);
      setActiveTool(null);
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
