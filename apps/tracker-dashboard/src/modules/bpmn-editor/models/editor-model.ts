import { k } from '@/shared/utils/i18n';
import { action, atom } from '@reatom/core';
import type BpmnModeler from 'bpmn-js/lib/Modeler';
import type { Element } from 'bpmn-js/lib/model/Types';

import {
  type ElementInfo,
  describeElement,
} from './definitions/element-definitions';
import { DiagramService, isConnection } from './diagram-api';
import type { EditorToolName, PaletteElement } from './element-types';

/** Zoom bounds applied by the `zoomBy` action. */
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 4;
const ZOOM_STEP = 1.2;

/**
 * Translation keys the editor can surface as a toast. Declared with `k()` so
 * the i18n audit sees them in use; `lastErrorAtom` holds the key (never a raw
 * sentence) and the alert renders it through `t()` in `bpmn-editor.tsx`.
 * Library error details are narrowed to one of these keys at the call site
 * and kept for the console only.
 */
export const editorErrorKeys = {
  createFailed: k('bpmnEditor.error.createFailed'),
  eventConvertFailed: k('bpmnEditor.error.eventConvertFailed'),
  gatewayConvertFailed: k('bpmnEditor.error.gatewayConvertFailed'),
  approvalRequired: k('bpmnEditor.error.approvalRequired'),
  importFailed: k('bpmnEditor.error.importFailed'),
  exportFailed: k('bpmnEditor.error.exportFailed'),
  notReady: k('bpmnEditor.error.notReady'),
  nothingToSave: k('bpmnEditor.error.nothingToSave'),
} as const;

export type EditorErrorKey =
  (typeof editorErrorKeys)[keyof typeof editorErrorKeys];

/**
 * The adapter over the `bpmn-js` instance. Held in a module-scoped variable
 * rather than a reatom atom: it wraps a huge, non-serialisable object and would
 * flood the dev logger on every patch. `setModeler` rebuilds it whenever the
 * canvas (re)creates the modeler, so callers never touch the raw instance.
 */
let service: DiagramService | null = null;

export const getDiagramService = (): DiagramService | null => service;

export function setModeler(instance: BpmnModeler): DiagramService;
export function setModeler(instance: null): null;
export function setModeler(
  instance: BpmnModeler | null,
): DiagramService | null {
  service = instance ? new DiagramService(instance) : null;

  return service;
}

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
export const isCommandPaletteOpenAtom = atom<boolean>(
  false,
  'bpmnEditor.isCommandPaletteOpen',
);
export const canUndoAtom = atom<boolean>(false, 'bpmnEditor.canUndo');
export const canRedoAtom = atom<boolean>(false, 'bpmnEditor.canRedo');
export const selectedElementAtom = atom<ElementInfo | null>(
  null,
  'bpmnEditor.selectedElement',
);
export const lastErrorAtom = atom<EditorErrorKey | null>(
  null,
  'bpmnEditor.lastError',
);

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
  if (!service) return;

  service.clearSelection();
  service.activateTool(tool, event);
});

/**
 * Returns the canvas to the default pointer interaction. Any tool that is still
 * mid-drag is cancelled first, otherwise it would keep capturing the mouse.
 */
export const setTool = action(() => {
  activeToolAtom.set(null);

  if (!service) return;

  service.deactivateTool();
  service.clearSelection();
});

export const setCommandPaletteOpen = action((open: boolean) => {
  isCommandPaletteOpenAtom.set(open);
});

export const toggleCommandPalette = action(() => {
  isCommandPaletteOpenAtom.set(!isCommandPaletteOpenAtom());
});

export const setPropertiesOpen = action((open: boolean) => {
  isPropertiesOpenAtom.set(open);
});

export const setSelectedElement = action((info: ElementInfo | null) => {
  selectedElementAtom.set(info);
});

export const setError = action((key: EditorErrorKey | null) => {
  lastErrorAtom.set(key);
});

const getElementById = (id: string): Element | null => {
  return service?.getElementById(id) ?? null;
};

/**
 * bpmn-js binds its keyboard to the canvas SVG, so the diagram only reacts to
 * shortcuts while that element holds DOM focus. Everything outside the canvas
 * pushes focus back here after it is done.
 */
const focusCanvas = action(() => {
  if (!service) return;

  service.focusCanvas();
});

/**
 * Selects a node by id, scrolls it into view and moves focus to the canvas so
 * keyboard shortcuts target the revealed element — used by the palette search
 * so a hit can be opened with a single click.
 */
export const revealElement = action((id: string) => {
  if (!service) return;

  const element = getElementById(id);

  if (!element) return;

  service.revealElement(element, 60);
  focusCanvas();
});

export const pickElement = action((id: string) => {
  if (!service) return;

  const element = getElementById(id);

  if (!element || isConnection(element)) return;

  service.selectElement(element);
});

export const spawnPaletteElement = action(
  (element: PaletteElement, name?: string) => {
    if (!service) return;

    setError(null);

    const created = service.spawnElement(element, { name });

    if (!created) {
      setError(editorErrorKeys.createFailed);
    }
  },
);

/**
 * Resolves the currently selected element's diagram object, or `null` when
 * nothing is selected or the modeler is not mounted. Module-internal helper
 * shared with `model/actions/*`; not part of the public barrel.
 */
export const getCurrentElement = (): Element | null => {
  const selected = selectedElementAtom();
  if (!service || !selected) return null;
  return getElementById(selected.id);
};

/**
 * Re-reads the selected element's description into `selectedElementAtom` after
 * a mutation. Module-internal helper shared with `model/actions/*`; not part
 * of the public barrel.
 */
export const updateCurrent = action(() => {
  const element = getCurrentElement();
  if (!service || !element) return;
  setSelectedElement(describeElement(element));
});

export const renameSelected = action((name: string) => {
  const element = getCurrentElement();
  if (!service || !element) return;

  service.updateProperties(element, { name });
  updateCurrent();
});

export const duplicateSelected = action(() => {
  const selected = selectedElementAtom();

  if (!service || !selected) return;

  const element = getElementById(selected.id);

  if (!element) return;

  service.duplicateElement(element);
});

export const deleteSelected = action(() => {
  const selected = selectedElementAtom();

  if (!service || !selected) return;

  const element = getElementById(selected.id);

  if (!element) return;

  service.removeElement(element);
  setSelectedElement(null);
});

export const fitViewport = action(() => {
  service?.zoomToFit();
});

export const undo = action(() => {
  service?.undo();
});

export const redo = action(() => {
  service?.redo();
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
const zoomBy = action((factor: number) => {
  if (!service) return;

  const { scale } = service.getViewbox();
  const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale * factor));

  if (next !== scale) service.zoomTo(next);
});

export const zoomIn = action(() => zoomBy(ZOOM_STEP));
export const zoomOut = action(() => zoomBy(1 / ZOOM_STEP));
