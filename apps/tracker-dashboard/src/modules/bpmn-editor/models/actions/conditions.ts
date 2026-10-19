import { action } from '@reatom/core';

import { isEventType } from '../definitions/event-definitions';
import {
  DECISION_KEY_ATTRIBUTE,
  type DecisionValue,
  buildApprovalCondition,
  isApproveTask,
} from '../definitions/task-definitions';
import {
  getFlowSource,
  isConnection,
  isDefaultFlowOf,
  readAttribute,
} from '../diagram-api';
import {
  editorErrorKeys,
  getCurrentElement,
  getDiagramService,
  setError,
  updateCurrent,
} from '../editor-model';

/** An approve task offered as a branch source in the condition picker. */
export interface DecisionTaskOption {
  id: string;
  name: string;
  decisionKey: string;
}

/**
 * Every approve task in the diagram that carries a decision variable, offered
 * as a branch source in the condition picker (deduplicated by variable name).
 */
export const getDecisionTaskOptions = (): DecisionTaskOption[] => {
  const service = getDiagramService();
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
 * Writes (or clears) the selected condition expression — a sequence flow's, or
 * a conditional event's. A conditional flow cannot be a gateway's default, so
 * the default is dropped when a condition is set.
 */
export const setSelectedConditionExpression = action((body: string | null) => {
  const service = getDiagramService();
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

/**
 * Writes `${decisionKey == '<value>'}` onto the selected flow for the chosen
 * approval task and branch. A conditional flow cannot also be the gateway
 * default, so any default designation is dropped.
 */
export const setSelectedApprovalCondition = action(
  (decisionKey: string, value: DecisionValue) => {
    const service = getDiagramService();
    const element = getCurrentElement();
    if (!service || !element || !isConnection(element)) return;

    const key = decisionKey.trim();

    if (!key) {
      setError(editorErrorKeys.approvalRequired);

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
