import { action, atom } from '@reatom/core';
import type BpmnModeler from 'bpmn-js/lib/Modeler';
import type { Element } from 'bpmn-js/lib/model/Types';

import {
  DiagramService,
  isConnection,
  isConnectionType,
  readStageAttributes,
  toDiagramElement,
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
import { type StageInfo, isStageElement } from './stage-definitions';
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
  /** Whether the selected subprocess is flagged as a stage. */
  isStage: boolean;
  /** Absolute `stage` deadline of the selected stage; `null` when unset. */
  stageDeadline: string | null;
  /**
   * Relative `stage` deadline of the selected stage — an ISO 8601 duration
   * from the stage's runtime start; `null` when unset.
   */
  stageDeadlineDuration: string | null;
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
/** Subprocesses flagged as stages, in their persisted order. */
export const stagesAtom = atom<StageInfo[]>([], 'bpmnEditor.stages');
/** Name of the process shown in the general properties panel. */
export const processNameAtom = atom<string>('', 'bpmnEditor.processName');

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
    condition?: { body?: unknown };
  }>;

  for (const def of eventDefs) {
    const defBody = def.condition?.body;

    if (typeof defBody === 'string' && defBody.length > 0) return defBody;
  }

  return null;
};

/** True when `flow` is the `default` outgoing flow of `source`. */
const isDefaultFlowOf = (source: Element | undefined, flow: Element): boolean =>
  !!source && source.businessObject?.default === flow.businessObject;

interface EventDefinitionLike {
  $type?: string;
  condition?: { body?: unknown };
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
  const stage = readStageAttributes(target);

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
    isStage: isStageElement(target),
    stageDeadline: stage?.deadline ?? null,
    stageDeadlineDuration: stage?.deadlineDuration ?? null,
  };
};

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
 * Re-reads the stage list and process name from the diagram. Called whenever the
 * diagram changes (import, create, remove, rename, undo/redo).
 */
export const refreshStageState = action(() => {
  if (!service) {
    stagesAtom.set([]);
    processNameAtom.set('');
    return;
  }

  stagesAtom.set(readStages());
  processNameAtom.set(service.readProcessName());
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
 * Persists an absolute deadline on the selected stage; `null` clears it. A set
 * absolute deadline replaces any relative one — the two shapes are exclusive.
 */
export const setSelectedStageDeadline = action((deadline: string | null) => {
  const element = getCurrentElement();
  if (!service || !element || !isStageElement(element)) return;

  const current = readStageAttributes(element) ?? {};
  if ((current.deadline ?? null) === (deadline ?? null)) return;

  service.writeStageAttributes(element, {
    ...current,
    deadline: deadline ?? undefined,
    deadlineDuration: deadline ? undefined : current.deadlineDuration,
  });
  updateCurrent();
});

/**
 * Persists a relative deadline on the selected stage — an ISO 8601 duration
 * from the stage's runtime start; `null` clears it. A set relative deadline
 * replaces any absolute one — the two shapes are exclusive.
 */
export const setSelectedStageDeadlineDuration = action(
  (duration: string | null) => {
    const element = getCurrentElement();
    if (!service || !element || !isStageElement(element)) return;

    const current = readStageAttributes(element) ?? {};
    if ((current.deadlineDuration ?? null) === (duration ?? null)) return;

    service.writeStageAttributes(element, {
      ...current,
      deadlineDuration: duration ?? undefined,
      deadline: duration ? undefined : current.deadline,
    });
    updateCurrent();
  },
);

/** Persists the process name shown in the general properties panel. */
export const renameProcess = action((name: string) => {
  if (!service) return;

  const trimmed = name.trim();
  if (trimmed === service.readProcessName()) return;

  service.updateProcessName(trimmed);
  processNameAtom.set(trimmed);
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

  if (!service || !selected || isConnectionType(selected.type)) return;

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
