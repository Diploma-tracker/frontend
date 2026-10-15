import { k } from '@/shared/utils/i18n';

/**
 * Discriminator values stored in the custom `taskDefinitionKey` attribute of
 * the task kinds the editor supports.
 */
export const TASK_DEFINITION_KEYS = {
  approve: 'approve',
  fillProjectFields: 'fill-project-fields',
  registerProjectForDefense: 'register-project-for-defense',
  script: 'script',
} as const;

export type TaskDefinitionKey =
  (typeof TASK_DEFINITION_KEYS)[keyof typeof TASK_DEFINITION_KEYS];

/** Custom attribute holding the process variable an approve task writes. */
export const DECISION_KEY_ATTRIBUTE = 'decisionKey';

/**
 * Custom attribute holding a scripting task's script: a JSON array of
 * expressions, stored as a string the same way `roles` is.
 */
export const SCRIPT_EXPRESSIONS_ATTRIBUTE = 'expressions';

/**
 * Kinds of expression a scripting task can run. Only set-variable exists for
 * now; this is the extension point for future statement types.
 */
export const SCRIPT_EXPRESSION_KINDS = {
  setVariable: 'set-variable',
} as const;

export type ScriptExpressionKind =
  (typeof SCRIPT_EXPRESSION_KINDS)[keyof typeof SCRIPT_EXPRESSION_KINDS];

/** One statement in a scripting task's script, shown as a row in the editor. */
export interface ScriptExpression {
  kind: ScriptExpressionKind;
  name: string;
  value: string;
}

/** Builds the `variable = value` set-variable statement. */
export const createSetVariableExpression = (
  name = '',
  value = '',
): ScriptExpression => ({
  kind: SCRIPT_EXPRESSION_KINDS.setVariable,
  name,
  value,
});

/**
 * Values written into the decision variable. Each approval owns its own
 * variable, so completing one approval never moves another gateway.
 */
export const DECISION_VALUES = {
  approve: 'approve',
  reject: 'reject',
} as const;

export type DecisionValue =
  (typeof DECISION_VALUES)[keyof typeof DECISION_VALUES];

/** Gateway types whose outgoing flows may carry a condition / default. */
export const GATEWAY_TYPES: readonly string[] = [
  'bpmn:ExclusiveGateway',
  'bpmn:InclusiveGateway',
  'bpmn:ComplexGateway',
];

export const isGatewayType = (type: string): boolean =>
  GATEWAY_TYPES.includes(type);

export const isApproveTask = (taskDefinitionKey: string | null): boolean =>
  taskDefinitionKey === TASK_DEFINITION_KEYS.approve;

export const isScriptTask = (taskDefinitionKey: string | null): boolean =>
  taskDefinitionKey === TASK_DEFINITION_KEYS.script;

/**
 * Reads a scripting task's script back from its JSON attribute. Unknown kinds
 * and malformed entries are dropped rather than throwing, so hand-edited XML
 * cannot break the inspector.
 */
export const parseScriptExpressions = (
  raw: string | null,
): ScriptExpression[] => {
  if (!raw) return [];

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  const kinds: string[] = Object.values(SCRIPT_EXPRESSION_KINDS);

  return parsed.flatMap((item) => {
    if (typeof item !== 'object' || item === null) return [];

    const { kind, name, value } = item as Record<string, unknown>;

    if (typeof kind !== 'string' || !kinds.includes(kind)) return [];
    if (typeof name !== 'string' || typeof value !== 'string') return [];

    return [{ kind: kind as ScriptExpressionKind, name, value }];
  });
};

/** Serialises a scripting task's script for storage in the custom attribute. */
export const serializeScriptExpressions = (
  expressions: ScriptExpression[],
): string => (expressions.length === 0 ? '' : JSON.stringify(expressions));

/** Builds the `decisionKey == 'approve'|'reject'` body of a branch condition. */
export const buildApprovalCondition = (
  decisionKey: string,
  value: DecisionValue,
): string => `${decisionKey} == '${value}'`;

/** Matches `${decisionKey == 'approve'}`-style bodies, with or without `${}`. */
const APPROVAL_CONDITION_PATTERN =
  /^\s*\$?\{?\s*([A-Za-z_]\w*)\s*==\s*'(approve|reject)'\s*\}?\s*$/;

/**
 * Reads a branch condition back into its parts, so the picker can show the
 * current approval and branch. Returns `null` for anything hand-written that
 * does not follow the `decisionKey == 'approve'|'reject'` shape.
 */
export const parseApprovalCondition = (
  body: string | null,
): { decisionKey: string; value: DecisionValue } | null => {
  if (!body) return null;

  const match = APPROVAL_CONDITION_PATTERN.exec(body);

  if (!match) return null;

  const [, decisionKey, value] = match;

  if (!decisionKey || !value) return null;

  return { decisionKey, value: value as DecisionValue };
};

/**
 * Suggests a decision variable name from a task's label, falling back to its id.
 * "Supervisor review topic" → `supervisorReviewTopicDecision`.
 */
export const suggestDecisionKey = (name: string, id: string): string => {
  const words = name
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter((word) => word.length > 0);

  if (words.length === 0) return `${id}Decision`;

  const [first = '', ...rest] = words;
  const camel = [
    first.charAt(0).toLowerCase() + first.slice(1),
    ...rest.map((word) => word.charAt(0).toUpperCase() + word.slice(1)),
  ].join('');

  return `${camel}Decision`;
};

export interface RoleOption {
  value: string;
  labelKey: string;
}

/**
 * Roles selectable for a task. Mocked for now — the real list will come from
 * the backend.
 */
export const TASK_ROLE_OPTIONS: RoleOption[] = [
  { value: 'admin', labelKey: k('thesisProcess.roles.admin') },
  { value: 'student', labelKey: k('thesisProcess.roles.student') },
  { value: 'supervisor', labelKey: k('thesisProcess.roles.supervisor') },
  {
    value: 'plagiarism_supervisor',
    labelKey: k('thesisProcess.roles.plagiarism_supervisor'),
  },
  {
    value: 'internship_supervisor',
    labelKey: k('thesisProcess.roles.internship_supervisor'),
  },
  {
    value: 'commission_member',
    labelKey: k('thesisProcess.roles.commission_member'),
  },
  { value: 'reviewer', labelKey: k('thesisProcess.roles.reviewer') },
];

export interface FormOption {
  value: string;
  label: string;
}

/**
 * Forms the fill-form task can reference. Empty for now — the picker is a
 * placeholder until the forms list is available.
 */
export const FORM_OPTIONS: FormOption[] = [];
