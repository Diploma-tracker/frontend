import {
  type CollisionDetection,
  closestCenter,
  pointerWithin,
} from '@dnd-kit/core';

/**
 * Collision detection for a list whose palette tiles are dragged in from
 * outside, reordered inside, and dropped onto one shared canvas droppable.
 *
 * A palette drag only counts as over a target when the pointer is actually
 * inside it, so hovering the palette or a side panel shows no drop. Keyboard
 * drags have no pointer, so they fall back to proximity. Reordering ignores the
 * canvas droppable: its id is not a sortable item, so `over` landing on it makes
 * every row's transform collapse (dnd-kit treats a non-item `overIndex` as
 * "nothing to displace") and the list jumps — the rows alone already cover
 * reordering, including to the very end.
 *
 * `isPaletteDrag` reads the active drag's `data.current`; pass the predicate
 * that matches how the callers tag their draggables.
 */
export const createPaletteCollisionDetection = (
  isPaletteDrag: (activeData: unknown) => boolean,
  canvasDroppableId: string,
): CollisionDetection => {
  return (args) => {
    if (isPaletteDrag(args.active.data.current)) {
      return args.pointerCoordinates
        ? pointerWithin(args)
        : closestCenter(args);
    }

    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter(
        (container) => container.id !== canvasDroppableId,
      ),
    });
  };
};
