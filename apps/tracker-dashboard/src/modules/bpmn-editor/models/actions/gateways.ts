import { action } from '@reatom/core';

import { isGatewayElementType } from '../definitions/gateway-definitions';
import { isGatewayType } from '../definitions/task-definitions';
import { getFlowSource, isConnection } from '../diagram-api';
import {
  editorErrorKeys,
  getCurrentElement,
  getDiagramService,
  setError,
  updateCurrent,
} from '../editor-model';

/** Switches the selected gateway to another gateway type. */
export const setSelectedGatewayType = action((gatewayType: string) => {
  const service = getDiagramService();
  const element = getCurrentElement();
  if (!service || !element || !isGatewayElementType(element.type)) return;

  const replaced = service.setGatewayType(element, gatewayType);

  if (!replaced) {
    setError(editorErrorKeys.gatewayConvertFailed);

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
  const service = getDiagramService();
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
  const service = getDiagramService();
  const element = getCurrentElement();
  if (!service || !element || isConnection(element)) return;

  const resolved = flowId ? service.getElementById(flowId) : null;

  service.setDefaultFlow(element, resolved);

  if (resolved) service.setConditionExpression(resolved, null);

  updateCurrent();
});
