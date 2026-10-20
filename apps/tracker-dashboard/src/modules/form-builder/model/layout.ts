import type { RowLayout } from './types';

/**
 * Where a field ends up when added (or moved):
 * - `{ kind: 'insertInRow', rowIndex, index }` → inside an existing row
 * - `{ kind: 'addNewRow', afterRowIndex }` → as a new row after that row
 * - `{ kind: 'addNewRowInBottom' }` → at the very end
 */
export type AddTarget =
  | { kind: 'insertInRow'; rowIndex: number; index: number }
  | { kind: 'addNewRow'; afterRowIndex: number }
  | { kind: 'addNewRowInBottom' };

const insertAt = <T>(array: T[], index: number, item: T): T[] => {
  const next = [...array];
  next.splice(index, 0, item);
  return next;
};

/** Removes `name` from the layout (drops the row if it becomes empty). */
export const removeFromLayout = (layout: RowLayout, name: string): RowLayout =>
  layout
    .map((row) => row.filter((id) => id !== name))
    .filter((row) => row.length > 0);

const addNewRowInBottom = (layout: RowLayout, name: string): RowLayout => {
  layout.push([name]);
  return layout;
};

const addNewRow = (
  layout: RowLayout,
  name: string,
  target: Extract<AddTarget, { kind: 'addNewRow' }>,
): RowLayout => {
  const insertIndex = Math.min(
    Math.max(target.afterRowIndex + 1, 0),
    layout.length,
  );
  layout.splice(insertIndex, 0, [name]);
  return layout;
};

const insertInRow = (
  layout: RowLayout,
  name: string,
  target: Extract<AddTarget, { kind: 'insertInRow' }>,
): RowLayout => {
  if (layout.length === 0) {
    return addNewRowInBottom(layout, name);
  }

  const rowIndex = Math.min(Math.max(target.rowIndex, 0), layout.length);
  if (rowIndex === layout.length) {
    layout.push([name]);
    return layout;
  }

  const row = layout[rowIndex];
  if (!row) {
    return layout;
  }

  const index = Math.min(Math.max(target.index, 0), row.length);
  layout[rowIndex] = insertAt(row, index, name);
  return layout;
};

/** Inserts `name` into the layout according to `target`. */
export const placeInLayout = (
  layout: RowLayout,
  name: string,
  target: AddTarget,
): RowLayout => {
  const next = layout.map((row) => [...row]);

  switch (target.kind) {
    case 'insertInRow':
      return insertInRow(next, name, target);
    case 'addNewRow':
      return addNewRow(next, name, target);
    case 'addNewRowInBottom':
      return addNewRowInBottom(next, name);
  }
};

/**
 * Structural equality for row layouts. Writing an equal-but-new layout
 * re-renders the canvas, which re-measures every droppable, which fires
 * `onDragOver` again — and the write is the fuel that loop runs on.
 */
export const sameLayout = (a: RowLayout, b: RowLayout): boolean => {
  if (a.length !== b.length) return false;

  return a.every((row, rowIndex) => {
    const other = b[rowIndex];
    if (!other || other.length !== row.length) return false;
    return row.every((id, col) => id === other[col]);
  });
};
