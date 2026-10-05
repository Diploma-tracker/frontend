import { action, atom } from '@reatom/core';
import type BpmnModeler from 'bpmn-js/lib/Modeler';
import type { Element } from 'bpmn-js/lib/model/Types';

import {
  activateToolOnModeler,
  clearSelection,
  duplicateElement,
  exportXml,
  getServices,
  importXml,
  isConnection,
  removeElement,
  replaceElementType,
  spawnElement,
  toDiagramElement,
  updateElementName,
  zoomToFit,
} from './diagram-api';
import type { EditorToolName, PaletteElement } from './element-catalog';
import { starterDiagramXml } from './starter-diagram';

/** Zoom bounds applied by the `zoomBy` action. */
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 4;
const ZOOM_STEP = 1.2;

export interface SelectedElementInfo {
  id: string;
  type: string;
  name: string;
  isConnection: boolean;
  incomingCount: number;
  outgoingCount: number;
}

export interface DiagramStats {
  shapes: number;
  connections: number;
}

/**
 * The `bpmn-js` instance. Held in a module-scoped variable rather than a reatom
 * atom: it is a huge, non-serialisable object and would flood the dev logger
 * on every patch.
 */
let modeler: BpmnModeler | null = null;

export const getModeler = (): BpmnModeler | null => modeler;

export const isReadyAtom = atom<boolean>(false, 'bpmnEditor.isReady');
/**
 * Name of the active bpmn-js tool, or `null` for the default pointer
 * interaction. Mirrors `tool-manager.update` from the tool manager.
 */
export const activeToolAtom = atom<EditorToolName | 'create' | null>(
  null,
  'bpmnEditor.activeTool',
);
export const isPropertiesOpenAtom = atom<boolean>(
  false,
  'bpmnEditor.isPropertiesOpen',
);
export const canUndoAtom = atom<boolean>(false, 'bpmnEditor.canUndo');
export const canRedoAtom = atom<boolean>(false, 'bpmnEditor.canRedo');
export const selectedElementAtom = atom<SelectedElementInfo | null>(
  null,
  'bpmnEditor.selectedElement',
);
export const canvasSizeAtom = atom<{ width: number; height: number }>(
  { width: 0, height: 0 },
  'bpmnEditor.canvasSize',
);
export const statsAtom = atom<DiagramStats>(
  { shapes: 0, connections: 0 },
  'bpmnEditor.stats',
);
export const xmlAtom = atom<string>('', 'bpmnEditor.xml');
export const lastErrorAtom = atom<string | null>(null, 'bpmnEditor.lastError');

export const setModeler = (instance: BpmnModeler | null): void => {
  modeler = instance;
};

export const setReady = action((ready: boolean) => {
  isReadyAtom.set(ready);
});

const TOOL_NAMES: (EditorToolName | 'create')[] = [
  'hand',
  'lasso',
  'space',
  'global-connect',
  'create',
];

export const setActiveTool = action((tool: string | null) => {
  activeToolAtom.set(TOOL_NAMES.find((name) => name === tool) ?? null);
});

export const setUndoRedoState = action((canUndo: boolean, canRedo: boolean) => {
  canUndoAtom.set(canUndo);
  canRedoAtom.set(canRedo);
});

export const activateTool = action((tool: EditorToolName, event?: Event) => {
  if (!modeler) return;

  clearSelection(modeler);
  activateToolOnModeler(modeler, tool, event);
});

/**
 * Returns the canvas to the default pointer interaction. Any tool that is still
 * mid-drag is cancelled first, otherwise it would keep capturing the mouse.
 */
export const setTool = action(() => {
  activeToolAtom.set(null);

  if (!modeler) return;

  const { toolManager } = getServices(modeler);

  toolManager.setActive(null);
  clearSelection(modeler);
});

export const togglePropertiesPanel = action(() => {
  isPropertiesOpenAtom.set(!isPropertiesOpenAtom());
});

export const setPropertiesOpen = action((open: boolean) => {
  isPropertiesOpenAtom.set(open);
});

export const setSelectedElement = action((info: SelectedElementInfo | null) => {
  selectedElementAtom.set(info);
});

export const setCanvasSize = action(
  (size: { width: number; height: number }) => {
    canvasSizeAtom.set(size);
  },
);

export const setStats = action((stats: DiagramStats) => {
  statsAtom.set(stats);
});

export const setXml = action((xml: string) => {
  xmlAtom.set(xml);
});

export const setError = action((message: string | null) => {
  lastErrorAtom.set(message);
});

/** Flattens a diagram element into the serialisable shape React renders from. */
export const describeElement = (
  element: Element | undefined,
): SelectedElementInfo | null => {
  const target = toDiagramElement(element);

  if (!target) return null;

  const connection = isConnection(target);

  return {
    id: target.id,
    type: target.type,
    name: target.businessObject?.name ?? '',
    isConnection: connection,
    incomingCount: connection ? (target.incoming ?? []).length : 0,
    outgoingCount: connection ? (target.outgoing ?? []).length : 0,
  };
};

export const readStats = (): DiagramStats => {
  if (!modeler) return { shapes: 0, connections: 0 };

  const elements = getServices(modeler).elementRegistry.getAll() as Element[];

  return elements.reduce<DiagramStats>(
    (stats, element) => {
      if (element.type === 'label') return stats;
      if (isConnection(element)) {
        return { ...stats, connections: stats.connections + 1 };
      }

      return { ...stats, shapes: stats.shapes + 1 };
    },
    { shapes: 0, connections: 0 },
  );
};

export const getElementById = (id: string): Element | null => {
  if (!modeler) return null;

  return toDiagramElement(getServices(modeler).elementRegistry.get(id));
};

/**
 * Selects a node by id and scrolls it into view — used by the palette search so
 * a hit can be opened with a single click.
 */
export const revealElement = action((id: string) => {
  if (!modeler) return;

  const services = getServices(modeler);
  const element = getElementById(id);

  if (!element) return;

  services.selection.select(element);
  services.canvas.scrollToElement(element, 60);
});

export const pickElement = action((id: string) => {
  if (!modeler) return;

  const element = getElementById(id);

  if (!element || isConnection(element)) return;

  getServices(modeler).selection.select(element);
});

export const spawnPaletteElement = action(
  (element: PaletteElement, name?: string) => {
    if (!modeler) return;

    setError(null);

    const created = spawnElement(modeler, element, { name });

    if (!created) {
      setError(`Could not create ${element.bpmnType}.`);

      return;
    }

    setStats(readStats());
  },
);

export const renameSelected = action((name: string) => {
  const selected = selectedElementAtom();

  if (!modeler || !selected) return;

  const element = getElementById(selected.id);

  if (!element) return;

  updateElementName(modeler, element, name);
});

export const duplicateSelected = action(() => {
  const selected = selectedElementAtom();

  if (!modeler || !selected) return;

  const element = getElementById(selected.id);

  if (!element) return;

  duplicateElement(modeler, element);
  setStats(readStats());
});

export const deleteSelected = action(() => {
  const selected = selectedElementAtom();

  if (!modeler || !selected) return;

  const element = getElementById(selected.id);

  if (!element) return;

  removeElement(modeler, element);
  setSelectedElement(null);
  setStats(readStats());
});

export const changeSelectedType = action((target: PaletteElement) => {
  const selected = selectedElementAtom();

  if (!modeler || !selected || selected.isConnection) return;

  const element = getElementById(selected.id);

  if (!element) return;

  const replaced = replaceElementType(modeler, element, target);

  if (!replaced) {
    setError('This element cannot be converted to that type.');

    return;
  }

  setError(null);
  setStats(readStats());
});

export const fitViewport = action(() => {
  if (modeler) zoomToFit(modeler);
});

export const undo = action(() => {
  if (modeler) getServices(modeler).commandStack.undo();
});

export const redo = action(() => {
  if (modeler) getServices(modeler).commandStack.redo();
});

export const resetZoom = action(() => {
  if (modeler) getServices(modeler).canvas.zoom(1);
});

/**
 * Discards the pending changes.
 *
 * TODO: once the diagram endpoint is wired up in `diagram-persistence.ts`,
 * reload the last persisted revision instead of just dropping the selection.
 */
export const cancelChanges = action(() => {
  setError(null);
  setSelectedElement(null);
});

/** Steps the zoom around the current viewport centre. */
export const zoomBy = action((factor: number) => {
  if (!modeler) return;

  const { canvas } = getServices(modeler);
  const { scale } = canvas.viewbox();
  const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale * factor));

  if (next !== scale) canvas.zoom(next);
});

export const zoomIn = action(() => zoomBy(ZOOM_STEP));
export const zoomOut = action(() => zoomBy(1 / ZOOM_STEP));

export const exportDiagram = action(async () => {
  if (!modeler) return;

  const { xml, error } = await exportXml(modeler);

  if (error) {
    setError(error);

    return;
  }

  setXml(xml);
});

export const resetDiagram = action(async () => {
  if (!modeler) return;

  setSelectedElement(null);

  const { error } = await importXml(modeler, starterDiagramXml);

  if (error) {
    setError(error);

    return;
  }

  setError(null);
  setStats(readStats());
});
