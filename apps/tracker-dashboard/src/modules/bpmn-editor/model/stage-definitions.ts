/** Custom attribute flagging a `bpmn:SubProcess` as a stage. */
export const STAGE_ATTR = 'isStage';

/** Custom process attribute holding the JSON-encoded stage order. */
export const STAGE_ORDER_ATTR = 'stageOrder';

/** A stage as the properties panel renders it. */
export interface StageInfo {
  id: string;
  name: string;
}

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
