import type { Modifier } from '@dnd-kit/core';

import { anchorModifier } from './anchor-modifier';

/**
 * Keeps a palette square's top-center anchored under the pointer, so the small
 * tile does not jump away from the cursor, while leaving sortable reorders on
 * dnd-kit's default transform.
 *
 * `isPaletteDrag` reads the active drag's `data.current`; pass the predicate
 * that matches how the callers tag their draggables.
 */
export const createPaletteAnchorModifier = (
  isPaletteDrag: (activeData: unknown) => boolean,
): Modifier => {
  const anchorPaletteSquare = anchorModifier(['center', 'top'], [0, 10]);

  return (args) =>
    isPaletteDrag(args.active?.data.current)
      ? anchorPaletteSquare(args)
      : args.transform;
};
