import { action } from '@reatom/core';

import {
  EVENT_DEFINITION_TYPES,
  type EventDefinitionKey,
  TIMER_TYPE_PROPERTY,
  type TimerType,
  eventDefinitionKeys,
  intermediateEventElementType,
  isIntermediateEventType,
  readEventDefinition,
} from '../definitions/event-definitions';
import {
  editorErrorKeys,
  getCurrentElement,
  getDiagramService,
  setError,
  updateCurrent,
} from '../editor-model';

/** Switches the selected event's attached definition, or clears it. */
export const setSelectedEventDefinition = action((key: EventDefinitionKey) => {
  const service = getDiagramService();
  const element = getCurrentElement();
  if (!service || !element) return;

  const replaced = service.setEventDefinitionType(
    element,
    EVENT_DEFINITION_TYPES[key],
  );

  if (!replaced) {
    setError(editorErrorKeys.eventConvertFailed);

    return;
  }

  setError(null);
  updateCurrent();
});

/** Toggles the selected boundary event between interrupting and not. */
export const setSelectedEventInterrupting = action((interrupting: boolean) => {
  const service = getDiagramService();
  const element = getCurrentElement();
  if (!service || !element) return;

  service.setBoundaryInterrupting(element, interrupting);

  updateCurrent();
});

/** Switches an intermediate event between catching and throwing. */
export const setSelectedEventThrowing = action((throwing: boolean) => {
  const service = getDiagramService();
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
    setError(editorErrorKeys.eventConvertFailed);

    return;
  }

  setError(null);
  updateCurrent();
});

/** Sets the selected timer event's value into its active timer field. */
export const setSelectedTimerValue = action(
  (type: TimerType, value: string) => {
    const service = getDiagramService();
    const element = getCurrentElement();
    if (!service || !element) return;

    service.setTimerDefinition(element, TIMER_TYPE_PROPERTY[type], value);

    updateCurrent();
  },
);
