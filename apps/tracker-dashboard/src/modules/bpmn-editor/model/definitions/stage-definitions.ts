import { parseDuration } from '@repo/utils/duration';

/** Custom attribute holding the JSON-encoded stage attributes. */
export const STAGE_ATTR = 'stage';

/** Custom process attribute holding the JSON-encoded stage order. */
export const STAGE_ORDER_ATTR = 'stageOrder';

/** A stage as the properties panel renders it. */
export interface StageInfo {
  id: string;
  name: string;
}

/**
 * Extra data a stage carries. The presence of the `stage` attribute marks the
 * subprocess as a stage, so an empty object is a stage without extra data.
 * The two deadline shapes are mutually exclusive: one is an absolute datetime,
 * the other a relative offset resolved against the stage's runtime start.
 */
export interface StageAttributes {
  /** Optional ISO 8601 deadline datetime. */
  deadline?: string;
  /** Optional ISO 8601 duration deadline, e.g. `P3M5D` from the stage start. */
  deadlineDuration?: string;
}

/** Minimal element shape the stage helpers need, satisfied by bpmn-js `Element`. */
export interface StageElementLike {
  type: string;
  businessObject?: { get(name: string): unknown } | undefined;
}

/** Whether the element is a subprocess flagged as a stage. */
export const isStageElement = (
  element: StageElementLike | null | undefined,
): boolean => {
  if (!element || element.type !== 'bpmn:SubProcess') return false;

  const raw = element.businessObject?.get(STAGE_ATTR);

  return typeof raw === 'string' && raw.length > 0;
};

/**
 * Decodes a subprocess `stage` attribute. The attribute's presence marks the
 * subprocess as a stage: anything that is not a JSON object — corruption, for
 * instance — degrades to empty attributes, so a stage without extra data still
 * reads as a stage.
 */
export const parseStageAttributes = (
  raw: string | null | undefined,
): StageAttributes | null => {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    const { deadline, deadlineDuration } = parsed as {
      deadline?: unknown;
      deadlineDuration?: unknown;
    };

    const attributes: StageAttributes = {};

    if (typeof deadline === 'string' && deadline.length > 0) {
      attributes.deadline = deadline;
    }

    if (
      typeof deadlineDuration === 'string' &&
      deadlineDuration.length > 0 &&
      isValidDeadlineDuration(deadlineDuration)
    ) {
      attributes.deadlineDuration = deadlineDuration;
    }

    return attributes;
  } catch {
    return {};
  }
};

/** Whether a raw string parses as an ISO 8601 duration. */
export const isValidDeadlineDuration = (raw: string): boolean => {
  try {
    parseDuration(raw);
    return true;
  } catch {
    return false;
  }
};

/** Whether a deadline value is the relative ISO 8601 duration shape. */
export const isRelativeDeadline = (value: string): boolean =>
  /^-?P/i.test(value);

/** Encodes stage attributes for the custom `stage` attribute. */
export const serializeStageAttributes = (info: StageAttributes): string => {
  const attributes: StageAttributes = {};

  if (info.deadline) attributes.deadline = info.deadline;
  if (info.deadlineDuration) {
    attributes.deadlineDuration = info.deadlineDuration;
  }

  return JSON.stringify(attributes);
};

/** Diagram type of a subprocess. */
export const isSubProcessType = (type: string): boolean =>
  type === 'bpmn:SubProcess';

/**
 * Decodes the process `stageOrder` attribute. Anything that is not a JSON array
 * of strings — an older revision, an empty value or corruption - degrades to an
 * empty order, so the list falls back to diagram order.
 */
export const parseStageOrder = (raw: string | null | undefined): string[] => {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
};

/** Encodes the stage order for the custom `stageOrder` attribute. */
export const serializeStageOrder = (ids: string[]): string =>
  JSON.stringify(ids);

/**
 * Orders the stages currently in the diagram by the persisted order: ids the
 * order still knows come first, in that order, and any stage added since (or
 * otherwise unlisted) keeps its diagram position at the end. Stale ids are
 * dropped. Always returns the same set of ids it is given.
 */
export const orderStages = (
  presentIds: string[],
  order: string[],
): string[] => {
  const present = new Set(presentIds);
  const seen = new Set<string>();
  const result: string[] = [];

  for (const id of order) {
    if (present.has(id) && !seen.has(id)) {
      seen.add(id);
      result.push(id);
    }
  }

  for (const id of presentIds) {
    if (!seen.has(id)) {
      seen.add(id);
      result.push(id);
    }
  }

  return result;
};
