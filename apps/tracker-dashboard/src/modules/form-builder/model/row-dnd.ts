const ROW_ID_PREFIX = 'form-builder-row-';
const ROW_ID_PATTERN = /^form-builder-row-(\d+)$/;

export const CANVAS_DROPPABLE_ID = 'form-builder-canvas';

/** Droppable id of a row, also used as the id of its `SortableContext`. */
export const rowDroppableId = (rowIndex: number): string =>
  `${ROW_ID_PREFIX}${rowIndex}`;

/** Droppable id of the gap rendered after `afterRowIndex`. */
export const rowGapDroppableId = (afterRowIndex: number): string =>
  `${ROW_ID_PREFIX}gap-${afterRowIndex}`;

/** Row index encoded in a row droppable id, `null` for any other id. */
export const parseRowIndex = (id: string): number | null => {
  const match = ROW_ID_PATTERN.exec(id);
  return match?.[1] === undefined ? null : Number(match[1]);
};
