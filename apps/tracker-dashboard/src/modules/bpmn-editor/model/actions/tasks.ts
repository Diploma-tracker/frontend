import { action } from '@reatom/core';

import {
  DECISION_KEY_ATTRIBUTE,
  SCRIPT_EXPRESSIONS_ATTRIBUTE,
  type ScriptExpression,
  createSetVariableExpression,
  serializeScriptExpressions,
} from '../definitions/task-definitions';
import {
  getCurrentElement,
  getDiagramService,
  selectedElementAtom,
  updateCurrent,
} from '../editor-model';

/**
 * Persists the roles that may perform the selected task. Stored as a JSON array
 * string in the custom `roles` attribute.
 */
export const setSelectedRoles = action((roles: string[]) => {
  const service = getDiagramService();
  const element = getCurrentElement();
  if (!service || !element) return;

  service.updateProperties(element, { roles: JSON.stringify(roles) });
  updateCurrent();
});

/** Persists the form reference for the selected task in the custom `formKey`. */
export const setSelectedFormKey = action((formKey: string) => {
  const service = getDiagramService();
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
  const service = getDiagramService();
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
  const service = getDiagramService();
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
