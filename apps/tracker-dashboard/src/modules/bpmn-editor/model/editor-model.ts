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
  isConnectionType,
  removeElement,
  replaceElementType,
  setBoundaryInterrupting,
  setConditionExpression,
  setDefaultFlow,
  setEventDefinitionType,
  setGatewayType,
  setTimerDefinition,
  spawnElement,
  toDiagramElement,
  updateProperties,
  zoomToFit,
} from './diagram-api';
import type { EditorToolName, PaletteElement } from './element-catalog';
import {
  EVENT_DEFINITION_TYPES,
  type EventDefinitionKey,
  TIMER_TYPES,
  TIMER_TYPE_PROPERTY,
  type TimerType,
  eventDefinitionKeyOf,
  eventDefinitionKeys,
  intermediateEventElementType,
  isEventType,
  isIntermediateEventType,
} from './event-definitions';
import { isGatewayElementType } from './gateway-definitions';
import { starterDiagramXml } from './starter-diagram';
import {
  DECISION_KEY_ATTRIBUTE,
  type DecisionValue,
  SCRIPT_EXPRESSIONS_ATTRIBUTE,
  type ScriptExpression,
  buildApprovalCondition,
  createSetVariableExpression,
  isApproveTask,
  isGatewayType,
  parseScriptExpressions,
  serializeScriptExpressions,
} from './task-definitions';

/** Zoom bounds applied by the `zoomBy` action. */
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 4;
const ZOOM_STEP = 1.2;

export interface GatewayFlowInfo {
  id: string;
  name: string;
  conditionExpression: string | null;
  isDefault: boolean;
}

/** An approve task offered as a branch source in the condition picker. */
export interface DecisionTaskOption {
  id: string;
  name: string;
  decisionKey: string;
}

export interface SelectedElementInfo {
  id: string;
  type: string;
  name: string;
  /** Custom `taskDefinitionKey` attribute, only set on the supported tasks. */
  taskDefinitionKey: string | null;
  /** Custom `roles` attribute, stored as a JSON array string. */
  roles: string[];
  /** Custom `formKey` attribute, only set on the fill-form task. */
  formKey: string | null;
  /** Custom `decisionKey` attribute, only set on approve tasks. */
  decisionKey: string | null;
  /** Custom `expressions` attribute, only set on scripting tasks. */
  scriptExpressions: ScriptExpression[];
  /** Condition expression body of a sequence flow or conditional event. */
  conditionExpression: string | null;
  /** Attached event definition of an event element, `none` when plain. */
  eventDefinition: EventDefinitionKey | null;
  /** Whether a boundary (or start) event interrupts its scope. */
  isInterrupting: boolean;
  /** Kind of a timer event's definition, `null` when not a timer. */
  timerType: TimerType | null;
  /** Value of a timer event's definition, `''` when unset. */
  timerValue: string | null;
  /** Whether the selected flow is its gateway's `default` flow. */
  isDefaultFlow: boolean;
  /** Whether the selected flow leaves a gateway (so it may be a default). */
  sourceIsGateway: boolean;
  /** Outgoing flows of a selected gateway, in order. */
  outgoingFlows: GatewayFlowInfo[];
  /** Business-object id of the selected gateway's `default` flow. */
  defaultFlowId: string | null;
  /**
   * Decision variable of the approve task feeding the selection — the source
   * task for a flow, or the incoming approve task for a gateway.
   */
  feedingDecisionKey: string | null;
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
export const isCommandPaletteOpenAtom = atom<boolean>(
  false,
  'bpmnEditor.isCommandPaletteOpen',
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

export const setCommandPaletteOpen = action((open: boolean) => {
  isCommandPaletteOpenAtom.set(open);
});

export const toggleCommandPalette = action(() => {
  isCommandPaletteOpenAtom.set(!isCommandPaletteOpenAtom());
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

/** Reads a string custom attribute from the element's business object. */
const readStringAttribute = (element: Element, name: string): string | null => {
  const value = element.businessObject?.get(name);

  return typeof value === 'string' && value.length > 0 ? value : null;
};

/** `source` only exists on connections, so it is unwrapped structurally. */
const getFlowSource = (flow: Element): Element | undefined =>
  (flow as { source?: Element }).source;

/** Parses the JSON-encoded `roles` attribute back into a list of role ids. */
const readRolesAttribute = (element: Element): string[] => {
  const raw = readStringAttribute(element, 'roles');

  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed.filter((role): role is string => typeof role === 'string')
      : [];
  } catch {
    return [];
  }
};

/** Condition expression body of a sequence flow, if any. */
const readConditionExpression = (element: Element): string | null => {
  const bo = element.businessObject;

  const body = bo?.conditionExpression?.body;

  if (typeof body === 'string' && body.length > 0) return body;

  const eventDefs = (bo?.eventDefinitions ?? []) as Array<{
    conditionExpression?: { body?: unknown };
  }>;

  for (const def of eventDefs) {
    const defBody = def.conditionExpression?.body;

    if (typeof defBody === 'string' && defBody.length > 0) return defBody;
  }

  return null;
};

/** True when `flow` is the `default` outgoing flow of `source`. */
const isDefaultFlowOf = (source: Element | undefined, flow: Element): boolean =>
  !!source && source.businessObject?.default === flow.businessObject;

interface EventDefinitionLike {
  $type?: string;
  conditionExpression?: { body?: unknown };
  timeDuration?: { body?: unknown };
  timeDate?: { body?: unknown };
  timeCycle?: { body?: unknown };
}

/** Attached `bpmn:*EventDefinition`s of an element, if any. */
const readEventDefinitions = (element: Element): EventDefinitionLike[] => {
  const defs = (element.businessObject as { eventDefinitions?: unknown })
    ?.eventDefinitions;

  return Array.isArray(defs) ? (defs as EventDefinitionLike[]) : [];
};

/** UI key of an event's first attached definition. */
const readEventDefinition = (element: Element): EventDefinitionKey =>
  eventDefinitionKeyOf(readEventDefinitions(element)[0]?.$type);

/** Whether a boundary event interrupts, or a start event is interrupting. */
const readIsInterrupting = (element: Element): boolean => {
  if (element.type === 'bpmn:BoundaryEvent') {
    return element.businessObject?.cancelActivity !== false;
  }

  if (element.type === 'bpmn:StartEvent') {
    return element.businessObject?.isInterrupting !== false;
  }

  return true;
};

/** Kind and value of a timer event's definition. */
const readTimer = (element: Element): { type: TimerType; value: string } => {
  const definition = readEventDefinitions(element).find(
    (def) => def.$type === 'bpmn:TimerEventDefinition',
  );

  if (!definition) return { type: 'duration', value: '' };

  for (const type of TIMER_TYPES) {
    const body = (definition as Record<string, { body?: unknown } | undefined>)[
      TIMER_TYPE_PROPERTY[type]
    ]?.body;

    if (typeof body === 'string' && body.length > 0)
      return { type, value: body };
  }

  return { type: 'duration', value: '' };
};

/** Outgoing sequence flows of a gateway, flattened for the panel. */
const readOutgoingFlows = (gateway: Element): GatewayFlowInfo[] =>
  ((gateway.outgoing ?? []) as unknown as Element[])
    .filter((flow) => isConnection(flow))
    .map((flow) => ({
      id: flow.id,
      name: flow.businessObject?.name ?? '',
      conditionExpression: readConditionExpression(flow),
      isDefault: isDefaultFlowOf(gateway, flow),
    }));

/**
 * Decision variable of the approve task feeding `element` — its own for a task,
 * the incoming task's for a gateway, or the feeding gateway's for a flow.
 */
const readFeedingDecisionKey = (element: Element): string | null => {
  if (isConnection(element)) {
    const source = getFlowSource(element);

    return source && isGatewayType(source.type)
      ? readFeedingDecisionKey(source)
      : null;
  }

  for (const flow of (element.incoming ?? []) as unknown as Element[]) {
    const source = getFlowSource(flow);
    const key = source
      ? readStringAttribute(source, DECISION_KEY_ATTRIBUTE)
      : null;

    if (key) return key;
  }

  return null;
};

/** Flattens a diagram element into the serialisable shape React renders from. */
export const describeElement = (
  element: Element | undefined,
): SelectedElementInfo | null => {
  const target = toDiagramElement(element);

  if (!target) return null;

  const connection = isConnection(target);
  const source = connection ? getFlowSource(target) : undefined;
  const sourceIsGateway = !!source && isGatewayType(source.type);
  const gateway = !connection && isGatewayType(target.type) ? target : null;
  const defaultFlowId = gateway?.businessObject?.default?.id;
  const event = isEventType(target.type);
  const eventDefinition = event ? readEventDefinition(target) : null;
  const timer = event && eventDefinition === 'timer' ? readTimer(target) : null;

  return {
    id: target.id,
    type: target.type,
    name: target.businessObject?.name ?? '',
    taskDefinitionKey: readStringAttribute(target, 'taskDefinitionKey'),
    roles: readRolesAttribute(target),
    formKey: readStringAttribute(target, 'formKey'),
    decisionKey: readStringAttribute(target, DECISION_KEY_ATTRIBUTE),
    scriptExpressions: parseScriptExpressions(
      readStringAttribute(target, SCRIPT_EXPRESSIONS_ATTRIBUTE),
    ),
    conditionExpression:
      connection || isEventType(target.type)
        ? readConditionExpression(target)
        : null,
    eventDefinition,
    isInterrupting: isEventType(target.type)
      ? readIsInterrupting(target)
      : true,
    timerType: timer?.type ?? null,
    timerValue: timer?.value ?? null,
    isDefaultFlow: connection && isDefaultFlowOf(source, target),
    sourceIsGateway,
    outgoingFlows: gateway ? readOutgoingFlows(gateway) : [],
    defaultFlowId: typeof defaultFlowId === 'string' ? defaultFlowId : null,
    feedingDecisionKey: connection
      ? sourceIsGateway
        ? readFeedingDecisionKey(target)
        : null
      : gateway
        ? readFeedingDecisionKey(gateway)
        : null,
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
 * Every approve task in the diagram that carries a decision variable, offered
 * as a branch source in the condition picker (deduplicated by variable name).
 */
export const getDecisionTaskOptions = (): DecisionTaskOption[] => {
  if (!modeler) return [];

  const elements = getServices(modeler).elementRegistry.getAll() as Element[];
  const seen = new Set<string>();
  const options: DecisionTaskOption[] = [];

  for (const element of elements) {
    if (element.type !== 'bpmn:UserTask') continue;
    if (!isApproveTask(readStringAttribute(element, 'taskDefinitionKey'))) {
      continue;
    }

    const decisionKey = readStringAttribute(element, DECISION_KEY_ATTRIBUTE);

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
 * Selects a node by id, scrolls it into view and moves focus to the canvas so
 * keyboard shortcuts target the revealed element — used by the palette search
 * so a hit can be opened with a single click.
 */
export const revealElement = action((id: string) => {
  if (!modeler) return;

  const services = getServices(modeler);
  const element = getElementById(id);

  if (!element) return;

  services.selection.select(element);
  services.canvas.scrollToElement(element, 60);
  services.canvas.focus();
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

const getCurrentElement = (): Element | null => {
  const selected = selectedElementAtom();
  if (!modeler || !selected) return null;
  return getElementById(selected.id);
};

const updateCurrent = action(() => {
  const element = getCurrentElement();
  if (!modeler || !element) return;
  setSelectedElement(describeElement(element));
});

export const renameSelected = action((name: string) => {
  const element = getCurrentElement();
  if (!modeler || !element) return;

  updateProperties(modeler, element, { name });
  updateCurrent();
});

/**
 * Persists the roles that may perform the selected task. Stored as a JSON array
 * string in the custom `roles` attribute.
 */
export const setSelectedRoles = action((roles: string[]) => {
  const element = getCurrentElement();
  if (!modeler || !element) return;

  updateProperties(modeler, element, { roles: JSON.stringify(roles) });
  updateCurrent();
});

/** Persists the form reference for the selected task in the custom `formKey`. */
export const setSelectedFormKey = action((formKey: string) => {
  const element = getCurrentElement();
  if (!modeler || !element) return;

  updateProperties(modeler, element, { formKey });
  updateCurrent();
});

/**
 * Persists the decision variable an approve task writes on completion. Each
 * approval owns its own variable, so it stays independent of other gateways.
 */
export const setSelectedDecisionKey = action((decisionKey: string) => {
  const element = getCurrentElement();
  if (!modeler || !element) return;

  const trimmed = decisionKey.trim();

  updateProperties(modeler, element, {
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
  if (!modeler || !element) return;

  const payload = serializeScriptExpressions(expressions);

  updateProperties(modeler, element, {
    [SCRIPT_EXPRESSIONS_ATTRIBUTE]: payload.length === 0 ? undefined : payload,
  });
  updateCurrent();
};

/** Appends an empty set-variable expression to the selected scripting task. */
export const addSelectedScriptExpression = action(() => {
  const current = selectedElementAtom()?.scriptExpressions ?? [];

  persistScriptExpressions([...current, createSetVariableExpression()]);
});

/** Replaces one expression in the selected scripting task's script. */
export const setSelectedScriptExpression = action(
  (index: number, expression: ScriptExpression) => {
    const current = selectedElementAtom()?.scriptExpressions ?? [];

    persistScriptExpressions(
      current.map((item, position) => (position === index ? expression : item)),
    );
  },
);

/** Removes one expression from the selected scripting task's script. */
export const removeSelectedScriptExpression = action((index: number) => {
  const current = selectedElementAtom()?.scriptExpressions ?? [];

  persistScriptExpressions(current.filter((_, position) => position !== index));
});

/**
 * Writes (or clears) the selected condition expression — a sequence flow's, or
 * a conditional event's. A conditional flow cannot be a gateway's default, so
 * the default is dropped when a condition is set.
 */
export const setSelectedConditionExpression = action((body: string | null) => {
  const element = getCurrentElement();
  if (!modeler || !element) return;

  const connection = isConnection(element);

  if (!connection && !isEventType(element.type)) return;

  setConditionExpression(modeler, element, body);

  if (connection) {
    const source = getFlowSource(element);
    const hasCondition = (body?.trim().length ?? 0) > 0;

    if (hasCondition && source && isDefaultFlowOf(source, element)) {
      setDefaultFlow(modeler, source, null);
    }
  }

  updateCurrent();
});

/** Switches the selected event's attached definition, or clears it. */
export const setSelectedEventDefinition = action((key: EventDefinitionKey) => {
  const element = getCurrentElement();
  if (!modeler || !element) return;

  const replaced = setEventDefinitionType(
    modeler,
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
  if (!modeler || !element) return;

  setBoundaryInterrupting(modeler, element, interrupting);

  updateCurrent();
});

/** Switches an intermediate event between catching and throwing. */
export const setSelectedEventThrowing = action((throwing: boolean) => {
  const element = getCurrentElement();
  if (!modeler || !element || !isIntermediateEventType(element.type)) return;

  const targetType = intermediateEventElementType(throwing);
  if (element.type === targetType) return;

  const currentKey = readEventDefinition(element);
  const nextKey = eventDefinitionKeys(targetType).includes(currentKey)
    ? currentKey
    : 'none';

  const replaced = setEventDefinitionType(
    modeler,
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
    if (!modeler || !element) return;

    setTimerDefinition(modeler, element, TIMER_TYPE_PROPERTY[type], value);

    updateCurrent();
  },
);

/** Switches the selected gateway to another gateway type. */
export const setSelectedGatewayType = action((gatewayType: string) => {
  const element = getCurrentElement();
  if (!modeler || !element || !isGatewayElementType(element.type)) return;

  const replaced = setGatewayType(modeler, element, gatewayType);

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
  if (!modeler || !element || !isConnection(element)) return;

  const source = getFlowSource(element);

  if (!source || !isGatewayType(source.type)) return;

  setDefaultFlow(modeler, source, asDefault ? element : null);

  if (asDefault) setConditionExpression(modeler, element, null);

  updateCurrent();
});

/** Chooses (or clears) the default outgoing flow of the selected gateway. */
export const setGatewayDefaultFlow = action((flowId: string | null) => {
  const element = getCurrentElement();
  if (!modeler || !element || isConnection(element)) return;

  const resolved = flowId
    ? toDiagramElement(getServices(modeler).elementRegistry.get(flowId))
    : null;

  setDefaultFlow(modeler, element, resolved);

  if (resolved) setConditionExpression(modeler, resolved, null);

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
    if (!modeler || !element || !isConnection(element)) return;

    const key = decisionKey.trim();

    if (!key) {
      setError('Choose the approval this branch handles.');

      return;
    }

    const source = getFlowSource(element);

    setError(null);
    setConditionExpression(
      modeler,
      element,
      buildApprovalCondition(key, value),
    );

    if (source && isDefaultFlowOf(source, element)) {
      setDefaultFlow(modeler, source, null);
    }

    updateCurrent();
  },
);

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

  if (!modeler || !selected || isConnectionType(selected.type)) return;

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
