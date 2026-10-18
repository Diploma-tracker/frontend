import type { Element } from 'bpmn-js/lib/model/Types';

import {
  getFlowSource,
  isConnection,
  isDefaultFlowOf,
  readAttribute,
  readStageAttributes,
  toDiagramElement,
} from '../diagram-api';
import {
  type EventDefinitionKey,
  TIMER_TYPES,
  TIMER_TYPE_PROPERTY,
  type TimerType,
  isEventType,
  readEventDefinition,
  readEventDefinitions,
} from './event-definitions';
import { isGatewayElementType } from './gateway-definitions';
import { isStageElement, isSubProcessType } from './stage-definitions';
import {
  DECISION_KEY_ATTRIBUTE,
  SCRIPT_EXPRESSIONS_ATTRIBUTE,
  type ScriptExpression,
  TASK_DEFINITION_KEYS,
  isApproveTask,
  isGatewayType,
  isScriptTask,
  parseScriptExpressions,
} from './task-definitions';

/** One outgoing gateway branch as the panel renders it. */
export interface GatewayFlowInfo {
  id: string;
  name: string;
  conditionExpression: string | null;
  isDefault: boolean;
}

/** Identity every element info carries, whatever its kind. */
export interface ElementBase {
  id: string;
  /** Raw BPMN type of the element, e.g. `bpmn:UserTask`. */
  type: string;
  name: string;
}

/** A sequence flow or association, with the branch settings it may carry. */
export interface ConnectionInfo extends ElementBase {
  kind: 'connection';
  /** Condition expression body of the flow; `null` when unconditional. */
  conditionExpression: string | null;
  /** Whether the flow is its gateway's `default` flow. */
  isDefaultFlow: boolean;
  /** Whether the flow leaves a gateway (so it may be a default). */
  sourceIsGateway: boolean;
  /**
   * Decision variable of the approve task feeding the flow — traced through
   * gateway chains; `null` when no approval feeds it.
   */
  feedingDecisionKey: string | null;
}

/** A task whose definition the editor does not specialise further. */
export interface PlainTaskInfo extends ElementBase {
  kind: 'task';
  /** Raw `taskDefinitionKey` attribute, `null` when unset. */
  taskDefinitionKey: string | null;
  /** Custom `roles` attribute, stored as a JSON array string. */
  roles: string[];
}

/** An approve task: roles plus the decision variable it writes. */
export interface ApproveTaskInfo extends ElementBase {
  kind: 'approveTask';
  taskDefinitionKey: 'approve';
  roles: string[];
  /** Custom `decisionKey` attribute, `null` when unset. */
  decisionKey: string | null;
}

/** A form task: roles plus the form it opens. */
export interface FormTaskInfo extends ElementBase {
  kind: 'formTask';
  taskDefinitionKey: 'fill-project-fields';
  roles: string[];
  /** Custom `formKey` attribute, `null` when unset. */
  formKey: string | null;
}

/** A scripting task: the expressions it runs instead of roles. */
export interface ScriptTaskInfo extends ElementBase {
  kind: 'scriptTask';
  taskDefinitionKey: 'script';
  /** Custom `expressions` attribute, parsed back into statements. */
  scriptExpressions: ScriptExpression[];
}

/** A subprocess, optionally flagged as a stage with an optional deadline. */
export interface SubProcessInfo extends ElementBase {
  kind: 'subProcess';
  /** Whether the subprocess is flagged as a stage. */
  isStage: boolean;
  /**
   * ISO 8601 deadline of the stage; `null` when unset. Either an absolute
   * datetime or a relative duration from the stage's runtime start — the two
   * shapes are mutually exclusive; see `isRelativeDeadline`.
   */
  stageDeadline: string | null;
}

/** A gateway with its outgoing branches, in order. */
export interface GatewayInfo extends ElementBase {
  kind: 'gateway';
  outgoingFlows: GatewayFlowInfo[];
}

/** An event with the definition it carries and that definition's settings. */
export interface EventInfo extends ElementBase {
  kind: 'event';
  /** Attached event definition; `none` when plain. */
  eventDefinition: EventDefinitionKey;
  /** Whether a boundary (or start) event interrupts its scope. */
  isInterrupting: boolean;
  /** Condition expression body of a conditional event; `null` otherwise. */
  conditionExpression: string | null;
  /** Kind of a timer event's definition, `null` when not a timer. */
  timerType: TimerType | null;
  /** Value of a timer event's definition, `''` when unset. */
  timerValue: string | null;
}

/** Any other shape — no inspector fields beyond the general ones. */
export interface ShapeInfo extends ElementBase {
  kind: 'shape';
}

/**
 * A diagram element as a discriminated union: `kind` decides which fields are
 * present, so each panel reads only what its element actually has. Built by
 * `describeElement`, which maps a bpmn-js element onto its variant.
 */
export type ElementInfo =
  | ConnectionInfo
  | PlainTaskInfo
  | ApproveTaskInfo
  | FormTaskInfo
  | ScriptTaskInfo
  | SubProcessInfo
  | GatewayInfo
  | EventInfo
  | ShapeInfo;

/** The task variants rendered by the task fields panel. */
export type TaskInfo =
  | PlainTaskInfo
  | ApproveTaskInfo
  | FormTaskInfo
  | ScriptTaskInfo;

/** Task types whose definitions the editor models; other tasks fall through. */
const TASK_ELEMENT_TYPES: readonly string[] = [
  'bpmn:UserTask',
  'bpmn:ScriptTask',
];

/** Parses the JSON-encoded `roles` attribute back into a list of role ids. */
const readRolesAttribute = (element: Element): string[] => {
  const raw = readAttribute(element, 'roles');

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

/** Condition expression body of a sequence flow or a conditional event. */
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
    const key = source ? readAttribute(source, DECISION_KEY_ATTRIBUTE) : null;

    if (key) return key;
  }

  return null;
};

/** Identity of `element` as every variant shares it. */
const baseOf = (element: Element): ElementBase => ({
  id: element.id,
  type: element.type,
  name: element.businessObject?.name ?? '',
});

const describeConnection = (element: Element): ConnectionInfo => {
  const source = getFlowSource(element);
  const sourceIsGateway = !!source && isGatewayType(source.type);

  return {
    ...baseOf(element),
    kind: 'connection',
    conditionExpression: readConditionExpression(element),
    isDefaultFlow: isDefaultFlowOf(source, element),
    sourceIsGateway,
    feedingDecisionKey: sourceIsGateway
      ? readFeedingDecisionKey(element)
      : null,
  };
};

const describeTask = (element: Element): TaskInfo => {
  const base = baseOf(element);
  const key = readAttribute(element, 'taskDefinitionKey');

  if (isScriptTask(key)) {
    return {
      ...base,
      kind: 'scriptTask',
      taskDefinitionKey: TASK_DEFINITION_KEYS.script,
      scriptExpressions: parseScriptExpressions(
        readAttribute(element, SCRIPT_EXPRESSIONS_ATTRIBUTE),
      ),
    };
  }

  if (isApproveTask(key)) {
    return {
      ...base,
      kind: 'approveTask',
      taskDefinitionKey: TASK_DEFINITION_KEYS.approve,
      roles: readRolesAttribute(element),
      decisionKey: readAttribute(element, DECISION_KEY_ATTRIBUTE),
    };
  }

  if (key === TASK_DEFINITION_KEYS.fillProjectFields) {
    return {
      ...base,
      kind: 'formTask',
      taskDefinitionKey: TASK_DEFINITION_KEYS.fillProjectFields,
      roles: readRolesAttribute(element),
      formKey: readAttribute(element, 'formKey'),
    };
  }

  return {
    ...base,
    kind: 'task',
    taskDefinitionKey: key,
    roles: readRolesAttribute(element),
  };
};

const describeSubProcess = (element: Element): SubProcessInfo => {
  const stage = readStageAttributes(element);

  return {
    ...baseOf(element),
    kind: 'subProcess',
    isStage: isStageElement(element),
    stageDeadline: stage?.deadline ?? stage?.deadlineDuration ?? null,
  };
};

const describeGateway = (element: Element): GatewayInfo => ({
  ...baseOf(element),
  kind: 'gateway',
  outgoingFlows: readOutgoingFlows(element),
});

const describeEvent = (element: Element): EventInfo => {
  const eventDefinition = readEventDefinition(element);
  const timer = eventDefinition === 'timer' ? readTimer(element) : null;

  return {
    ...baseOf(element),
    kind: 'event',
    eventDefinition,
    isInterrupting: readIsInterrupting(element),
    conditionExpression: readConditionExpression(element),
    timerType: timer?.type ?? null,
    timerValue: timer?.value ?? null,
  };
};

const describeShape = (element: Element): ShapeInfo => ({
  ...baseOf(element),
  kind: 'shape',
});

/** Maps a diagram element onto its typed variant, or `null` when unresolved. */
export const describeElement = (
  element: Element | undefined,
): ElementInfo | null => {
  const target = toDiagramElement(element);

  if (!target) return null;

  if (isConnection(target)) return describeConnection(target);
  if (TASK_ELEMENT_TYPES.includes(target.type)) return describeTask(target);
  if (isSubProcessType(target.type)) return describeSubProcess(target);
  if (isGatewayElementType(target.type)) return describeGateway(target);
  if (isEventType(target.type)) return describeEvent(target);

  return describeShape(target);
};
