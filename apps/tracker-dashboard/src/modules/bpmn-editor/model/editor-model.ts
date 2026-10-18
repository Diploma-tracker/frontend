import { action, atom } from '@reatom/core';
import type BpmnModeler from 'bpmn-js/lib/Modeler';
import type { Element } from 'bpmn-js/lib/model/Types';

import {
  type ElementInfo,
  describeElement,
} from './definitions/element-definitions';
import {
  EVENT_DEFINITION_TYPES,
  type EventDefinitionKey,
  TIMER_TYPE_PROPERTY,
  type TimerType,
  eventDefinitionKeys,
  intermediateEventElementType,
  isEventType,
  isIntermediateEventType,
  readEventDefinition,
} from './definitions/event-definitions';
import { isGatewayElementType } from './definitions/gateway-definitions';
import {
  type StageAttributes,
  type StageInfo,
  isRelativeDeadline,
  isStageElement,
} from './definitions/stage-definitions';
import {
  DECISION_KEY_ATTRIBUTE,
  type DecisionValue,
  SCRIPT_EXPRESSIONS_ATTRIBUTE,
  type ScriptExpression,
  buildApprovalCondition,
  createSetVariableExpression,
  isApproveTask,
  isGatewayType,
  serializeScriptExpressions,
} from './definitions/task-definitions';
import {
  DiagramService,
  getFlowSource,
  isConnection,
  isDefaultFlowOf,
  readAttribute,
  readStageAttributes,
} from './diagram-api';
import type { EditorToolName, PaletteElement } from './element-catalog';
import { starterDiagramXml } from './starter-diagram';

/** Zoom bounds applied by the `zoomBy` action. */
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 4;
const ZOOM_STEP = 1.2;

/** An approve task offered as a branch source in the condition picker. */
export interface DecisionTaskOption {
  id: string;
  name: string;
  decisionKey: string;
}

export interface DiagramStats {
  shapes: number;
  connections: number;
}

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
/** Subprocesses flagged as stages, in their persisted order. */
export const stagesAtom = atom<StageInfo[]>([], 'bpmnEditor.stages');

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

export const togglePropertiesPanel = action(() => {
  isPropertiesOpenAtom.set(!isPropertiesOpenAtom());
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

export const readStats = (): DiagramStats => {
  if (!service) return { shapes: 0, connections: 0 };

  const elements = service.getAllElements();

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

/**
 * Stage subprocesses as `{ id, name }`, in the persisted `stageOrder`. The
 * order is reconciled with the diagram first, so a stage added (or removed)
 * since the last sort is written into the XML too, not just appended.
 */
export const readStages = (): StageInfo[] => {
  if (!service) return [];

  const names = new Map(
    service
      .readStageSubProcesses()
      .map((element) => [
        element.id,
        element.businessObject?.name || element.id,
      ]),
  );

  return service.syncStageOrder().map((id) => ({
    id,
    name: names.get(id) ?? id,
  }));
};

export const getElementById = (id: string): Element | null => {
  if (!service) return null;

  return service.getElementById(id);
};

/**
 * Every approve task in the diagram that carries a decision variable, offered
 * as a branch source in the condition picker (deduplicated by variable name).
 */
export const getDecisionTaskOptions = (): DecisionTaskOption[] => {
  if (!service) return [];

  const elements = service.getAllElements();
  const seen = new Set<string>();
  const options: DecisionTaskOption[] = [];

  for (const element of elements) {
    if (element.type !== 'bpmn:UserTask') continue;
    if (!isApproveTask(readAttribute(element, 'taskDefinitionKey'))) {
      continue;
    }

    const decisionKey = readAttribute(element, DECISION_KEY_ATTRIBUTE);

    if (!decisionKey || seen.has(decisionKey)) continue;

    seen.add(decisionKey);
    options.push({
      id: element.id,
      name: element.businessObject?.name || element.id,
      decisionKey,
    });
  }

  return options;
};

/**
 * bpmn-js binds its keyboard to the canvas SVG, so the diagram only reacts to
 * shortcuts while that element holds DOM focus. Everything outside the canvas
 * pushes focus back here after it is done.
 */
export const focusCanvas = action(() => {
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
      setError(`Could not create ${element.bpmnType}.`);

      return;
    }

    setStats(readStats());
  },
);

const getCurrentElement = (): Element | null => {
  const selected = selectedElementAtom();
  if (!service || !selected) return null;
  return getElementById(selected.id);
};

const updateCurrent = action(() => {
  const element = getCurrentElement();
  if (!service || !element) return;
  setSelectedElement(describeElement(element));
});

/**
 * Re-reads the stage list from the diagram. Called whenever the diagram
 * changes (import, create, remove, rename, undo/redo).
 */
export const refreshStageState = action(() => {
  if (!service) {
    stagesAtom.set([]);
    return;
  }

  stagesAtom.set(readStages());
});

/** Flags (or unflags) the selected subprocess as a stage. */
export const setSelectedIsStage = action((isStage: boolean) => {
  const element = getCurrentElement();
  if (!service || !element || element.type !== 'bpmn:SubProcess') return;

  service.writeStageAttributes(element, isStage ? {} : null);
  updateCurrent();
  refreshStageState();
});

/**
 * Persists the selected stage's ISO 8601 deadline — an absolute datetime or a
 * relative duration from the stage's runtime start; `null` clears it. The two
 * shapes are exclusive, so writing one replaces the other.
 */
export const setSelectedStageDeadline = action((deadline: string | null) => {
  const element = getCurrentElement();
  if (!service || !element || !isStageElement(element)) return;

  const relative = deadline !== null && isRelativeDeadline(deadline);
  const next: StageAttributes =
    deadline === null
      ? {}
      : relative
        ? { deadlineDuration: deadline }
        : { deadline };

  const current = readStageAttributes(element) ?? {};
  const unchanged =
    (current.deadline ?? null) === (next.deadline ?? null) &&
    (current.deadlineDuration ?? null) === (next.deadlineDuration ?? null);

  if (unchanged) return;

  service.writeStageAttributes(element, next);
  updateCurrent();
});

/** Persists a new stage order, writing the ids back into the diagram XML. */
export const reorderStages = action((ids: string[]) => {
  if (!service) return;

  service.writeStageOrder(ids);
  stagesAtom.set(readStages());
});

export const renameSelected = action((name: string) => {
  const element = getCurrentElement();
  if (!service || !element) return;

  service.updateProperties(element, { name });
  updateCurrent();
});

/**
 * Persists the roles that may perform the selected task. Stored as a JSON array
 * string in the custom `roles` attribute.
 */
export const setSelectedRoles = action((roles: string[]) => {
  const element = getCurrentElement();
  if (!service || !element) return;

  service.updateProperties(element, { roles: JSON.stringify(roles) });
  updateCurrent();
});

/** Persists the form reference for the selected task in the custom `formKey`. */
export const setSelectedFormKey = action((formKey: string) => {
  const element = getCurrentElement();
  if (!service || !element) return;

  service.updateProperties(element, { formKey });
  updateCurrent();
});

/**
 * Persists the decision variable an approve task writes on completion. Each
 * approval owns its own variable, so it stays independent of other gateways.
 */
export const setSelectedDecisionKey = action((decisionKey: string) => {
  const element = getCurrentElement();
  if (!service || !element) return;

  const trimmed = decisionKey.trim();

  service.updateProperties(element, {
    [DECISION_KEY_ATTRIBUTE]: trimmed.length === 0 ? undefined : trimmed,
  });
  updateCurrent();
});

/**
 * Writes the selected scripting task's full script, stored as a JSON array in
 * the custom `expressions` attribute. An empty script clears the attribute.
 */
const persistScriptExpressions = (expressions: ScriptExpression[]): void => {
  const element = getCurrentElement();
  if (!service || !element) return;

  const payload = serializeScriptExpressions(expressions);

  service.updateProperties(element, {
    [SCRIPT_EXPRESSIONS_ATTRIBUTE]: payload.length === 0 ? undefined : payload,
  });
  updateCurrent();
};

/** Expressions of the selected scripting task, empty for any other element. */
const currentScriptExpressions = (): ScriptExpression[] => {
  const selected = selectedElementAtom();

  return selected?.kind === 'scriptTask' ? selected.scriptExpressions : [];
};

/** Appends an empty set-variable expression to the selected scripting task. */
export const addSelectedScriptExpression = action(() => {
  const current = currentScriptExpressions();

  persistScriptExpressions([...current, createSetVariableExpression()]);
});

/** Replaces one expression in the selected scripting task's script. */
export const setSelectedScriptExpression = action(
  (index: number, expression: ScriptExpression) => {
    const current = currentScriptExpressions();

    persistScriptExpressions(
      current.map((item, position) => (position === index ? expression : item)),
    );
  },
);

/** Removes one expression from the selected scripting task's script. */
export const removeSelectedScriptExpression = action((index: number) => {
  const current = currentScriptExpressions();

  persistScriptExpressions(current.filter((_, position) => position !== index));
});

/**
 * Writes (or clears) the selected condition expression — a sequence flow's, or
 * a conditional event's. A conditional flow cannot be a gateway's default, so
 * the default is dropped when a condition is set.
 */
export const setSelectedConditionExpression = action((body: string | null) => {
  const element = getCurrentElement();
  if (!service || !element) return;

  const connection = isConnection(element);

  if (!connection && !isEventType(element.type)) return;

  service.setConditionExpression(element, body);

  if (connection) {
    const source = getFlowSource(element);
    const hasCondition = (body?.trim().length ?? 0) > 0;

    if (hasCondition && source && isDefaultFlowOf(source, element)) {
      service.setDefaultFlow(source, null);
    }
  }

  updateCurrent();
});

/** Switches the selected event's attached definition, or clears it. */
export const setSelectedEventDefinition = action((key: EventDefinitionKey) => {
  const element = getCurrentElement();
  if (!service || !element) return;

  const replaced = service.setEventDefinitionType(
    element,
    EVENT_DEFINITION_TYPES[key],
  );

  if (!replaced) {
    setError('This event cannot be converted to that type.');

    return;
  }

  setError(null);
  updateCurrent();
});

/** Toggles the selected boundary event between interrupting and not. */
export const setSelectedEventInterrupting = action((interrupting: boolean) => {
  const element = getCurrentElement();
  if (!service || !element) return;

  service.setBoundaryInterrupting(element, interrupting);

  updateCurrent();
});

/** Switches an intermediate event between catching and throwing. */
export const setSelectedEventThrowing = action((throwing: boolean) => {
  const element = getCurrentElement();
  if (!service || !element || !isIntermediateEventType(element.type)) return;

  const targetType = intermediateEventElementType(throwing);
  if (element.type === targetType) return;

  const currentKey = readEventDefinition(element);
  const nextKey = eventDefinitionKeys(targetType).includes(currentKey)
    ? currentKey
    : 'none';

  const replaced = service.setEventDefinitionType(
    element,
    EVENT_DEFINITION_TYPES[nextKey],
    targetType,
  );

  if (!replaced) {
    setError('This event cannot be converted to that type.');

    return;
  }

  setError(null);
  updateCurrent();
});

/** Sets the selected timer event's value into its active timer field. */
export const setSelectedTimerValue = action(
  (type: TimerType, value: string) => {
    const element = getCurrentElement();
    if (!service || !element) return;

    service.setTimerDefinition(element, TIMER_TYPE_PROPERTY[type], value);

    updateCurrent();
  },
);

/** Switches the selected gateway to another gateway type. */
export const setSelectedGatewayType = action((gatewayType: string) => {
  const element = getCurrentElement();
  if (!service || !element || !isGatewayElementType(element.type)) return;

  const replaced = service.setGatewayType(element, gatewayType);

  if (!replaced) {
    setError('This gateway cannot be converted to that type.');

    return;
  }

  setError(null);
  updateCurrent();
});

/**
 * Marks the selected flow as its gateway's default (clearing its condition), or
 * clears the designation. Only meaningful for gateway outgoing flows.
 */
export const setSelectedAsDefaultFlow = action((asDefault: boolean) => {
  const element = getCurrentElement();
  if (!service || !element || !isConnection(element)) return;

  const source = getFlowSource(element);

  if (!source || !isGatewayType(source.type)) return;

  service.setDefaultFlow(source, asDefault ? element : null);

  if (asDefault) service.setConditionExpression(element, null);

  updateCurrent();
});

/** Chooses (or clears) the default outgoing flow of the selected gateway. */
export const setGatewayDefaultFlow = action((flowId: string | null) => {
  const element = getCurrentElement();
  if (!service || !element || isConnection(element)) return;

  const resolved = flowId ? service.getElementById(flowId) : null;

  service.setDefaultFlow(element, resolved);

  if (resolved) service.setConditionExpression(resolved, null);

  updateCurrent();
});

/**
 * Writes `${decisionKey == '<value>'}` onto the selected flow for the chosen
 * approval task and branch. A conditional flow cannot also be the gateway
 * default, so any default designation is dropped.
 */
export const setSelectedApprovalCondition = action(
  (decisionKey: string, value: DecisionValue) => {
    const element = getCurrentElement();
    if (!service || !element || !isConnection(element)) return;

    const key = decisionKey.trim();

    if (!key) {
      setError('Choose the approval this branch handles.');

      return;
    }

    const source = getFlowSource(element);

    setError(null);
    service.setConditionExpression(element, buildApprovalCondition(key, value));

    if (source && isDefaultFlowOf(source, element)) {
      service.setDefaultFlow(source, null);
    }

    updateCurrent();
  },
);

export const duplicateSelected = action(() => {
  const selected = selectedElementAtom();

  if (!service || !selected) return;

  const element = getElementById(selected.id);

  if (!element) return;

  service.duplicateElement(element);
  setStats(readStats());
});

export const deleteSelected = action(() => {
  const selected = selectedElementAtom();

  if (!service || !selected) return;

  const element = getElementById(selected.id);

  if (!element) return;

  service.removeElement(element);
  setSelectedElement(null);
  setStats(readStats());
});

export const changeSelectedType = action((target: PaletteElement) => {
  const selected = selectedElementAtom();

  if (!service || !selected || selected.kind === 'connection') return;

  const element = getElementById(selected.id);

  if (!element) return;

  const replaced = service.replaceElementType(element, target);

  if (!replaced) {
    setError('This element cannot be converted to that type.');

    return;
  }

  setError(null);
  setStats(readStats());
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
export const zoomBy = action((factor: number) => {
  if (!service) return;

  const { scale } = service.getViewbox();
  const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale * factor));

  if (next !== scale) service.zoomTo(next);
});

export const zoomIn = action(() => zoomBy(ZOOM_STEP));
export const zoomOut = action(() => zoomBy(1 / ZOOM_STEP));

export const exportDiagram = action(async () => {
  if (!service) return;

  const { xml, error } = await service.exportXml();

  if (error) {
    setError(error);

    return;
  }

  setXml(xml);
});

export const resetDiagram = action(async () => {
  if (!service) return;

  setSelectedElement(null);

  const { error } = await service.importXml(starterDiagramXml);

  if (error) {
    setError(error);

    return;
  }

  setError(null);
  setStats(readStats());
});
