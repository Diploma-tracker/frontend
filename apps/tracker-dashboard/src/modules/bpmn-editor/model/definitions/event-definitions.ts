import { k } from '@/shared/utils/i18n';
import type { Element } from 'bpmn-js/lib/model/Types';

/** BPMN types that carry an event definition. */
export const EVENT_TYPES: readonly string[] = [
  'bpmn:StartEvent',
  'bpmn:EndEvent',
  'bpmn:IntermediateCatchEvent',
  'bpmn:IntermediateThrowEvent',
  'bpmn:BoundaryEvent',
];

export const isEventType = (type: string): boolean =>
  EVENT_TYPES.includes(type);

export const isBoundaryEventType = (type: string): boolean =>
  type === 'bpmn:BoundaryEvent';

/** Intermediate events, whose trigger decides whether they catch or throw. */
export const INTERMEDIATE_EVENT_TYPES: readonly string[] = [
  'bpmn:IntermediateCatchEvent',
  'bpmn:IntermediateThrowEvent',
];

export const isIntermediateEventType = (type: string): boolean =>
  INTERMEDIATE_EVENT_TYPES.includes(type);

/**
 * Event definition kinds, keyed for the UI and mapped to their BPMN type.
 * `none` is the absence of a definition — a plain event.
 */
export const EVENT_DEFINITION_TYPES = {
  none: null,
  message: 'bpmn:MessageEventDefinition',
  timer: 'bpmn:TimerEventDefinition',
  signal: 'bpmn:SignalEventDefinition',
  conditional: 'bpmn:ConditionalEventDefinition',
  error: 'bpmn:ErrorEventDefinition',
  escalation: 'bpmn:EscalationEventDefinition',
  terminate: 'bpmn:TerminateEventDefinition',
  compensation: 'bpmn:CompensateEventDefinition',
  link: 'bpmn:LinkEventDefinition',
} as const;

export type EventDefinitionKey = keyof typeof EVENT_DEFINITION_TYPES;

/**
 * Which definitions are valid on each event type. Mirrors the entries bpmn-js's
 * replace menu offers, narrowed to the ones this editor exposes.
 */
const DEFINITIONS_BY_TYPE: Record<string, EventDefinitionKey[]> = {
  'bpmn:StartEvent': [
    'none',
    'message',
    'timer',
    'signal',
    'conditional',
    'escalation',
  ],
  'bpmn:EndEvent': [
    'none',
    'message',
    'signal',
    'error',
    'escalation',
    'terminate',
    'compensation',
  ],
  'bpmn:IntermediateCatchEvent': [
    'none',
    'message',
    'timer',
    'signal',
    'conditional',
    'escalation',
    'link',
  ],
  'bpmn:IntermediateThrowEvent': [
    'none',
    'message',
    'signal',
    'escalation',
    'compensation',
    'link',
  ],
  'bpmn:BoundaryEvent': [
    'message',
    'timer',
    'signal',
    'conditional',
    'error',
    'escalation',
    'compensation',
  ],
};

const FALLBACK_DEFINITIONS: EventDefinitionKey[] = ['none'];

/** Definitions selectable for a given event type, in menu order. */
export const eventDefinitionKeys = (bpmnType: string): EventDefinitionKey[] =>
  DEFINITIONS_BY_TYPE[bpmnType] ?? FALLBACK_DEFINITIONS;

/** Intermediate element type for the catching / throwing mode toggle. */
export const intermediateEventElementType = (throwing: boolean): string =>
  throwing ? 'bpmn:IntermediateThrowEvent' : 'bpmn:IntermediateCatchEvent';

/**
 * Whether a trigger exists in both the catching and throwing forms, i.e. the
 * catch/throw switch is meaningful for it. Timer and conditional are catch-only,
 * compensation is throw-only.
 */
export const isToggleableIntermediateDefinition = (
  key: EventDefinitionKey,
): boolean =>
  eventDefinitionKeys('bpmn:IntermediateCatchEvent').includes(key) &&
  eventDefinitionKeys('bpmn:IntermediateThrowEvent').includes(key);

const BPMN_TYPE_TO_KEY = new Map<string, EventDefinitionKey>(
  Object.entries(EVENT_DEFINITION_TYPES)
    .filter(([, bpmnType]) => bpmnType !== null)
    .map(([key, bpmnType]) => [bpmnType as string, key as EventDefinitionKey]),
);

/** Maps a `bpmn:*EventDefinition` type back to its UI key. */
export const eventDefinitionKeyOf = (
  bpmnType: string | null | undefined,
): EventDefinitionKey =>
  (bpmnType ? BPMN_TYPE_TO_KEY.get(bpmnType) : undefined) ?? 'none';

interface EventDefinitionLike {
  $type?: string;
  condition?: { body?: unknown };
  timeDuration?: { body?: unknown };
  timeDate?: { body?: unknown };
  timeCycle?: { body?: unknown };
}

/** Attached `bpmn:*EventDefinition`s of an element, if any. */
export const readEventDefinitions = (
  element: Element,
): EventDefinitionLike[] => {
  const defs = (element.businessObject as { eventDefinitions?: unknown })
    ?.eventDefinitions;

  return Array.isArray(defs) ? (defs as EventDefinitionLike[]) : [];
};

/** UI key of an event's first attached definition. */
export const readEventDefinition = (element: Element): EventDefinitionKey =>
  eventDefinitionKeyOf(readEventDefinitions(element)[0]?.$type);

export interface EventDefinitionOption {
  value: EventDefinitionKey;
  labelKey: string;
}

export const eventDefinitionOptions = (
  bpmnType: string,
): EventDefinitionOption[] =>
  eventDefinitionKeys(bpmnType).map((value) => ({
    value,
    labelKey: k(`bpmnEditor.inspector.eventDefinitions.${value}`),
  }));

/** Timer sub-kinds, each backed by a different `bpmn:TimerEventDefinition` field. */
export const TIMER_TYPES = ['duration', 'date', 'cycle'] as const;

export type TimerType = (typeof TIMER_TYPES)[number];

/** The `bpmn:TimerEventDefinition` property each timer kind is stored in. */
export const TIMER_TYPE_PROPERTY: Record<TimerType, string> = {
  duration: 'timeDuration',
  date: 'timeDate',
  cycle: 'timeCycle',
};
