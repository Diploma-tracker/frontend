import type { Modifier } from '@dnd-kit/core';
import { getEventCoordinates } from '@dnd-kit/utilities';

type AnchorX = 'left' | 'center' | 'right';
type AnchorY = 'top' | 'center' | 'bottom';

type Anchor = [x: AnchorX, y: AnchorY];
type Offset = [x: number, y: number];

type Size = {
  width: number;
  height: number;
};

type AnchorOffsetFn = (size: Size) => number;

const xAnchorOffsets: Record<AnchorX, AnchorOffsetFn> = {
  left: () => 0,

  center: (size) => size.width / 2,

  right: (size) => size.width,
};

const yAnchorOffsets: Record<AnchorY, AnchorOffsetFn> = {
  top: () => 0,

  center: (size) => size.height / 2,

  bottom: (size) => size.height,
};

export function anchorModifier(
  [anchorX, anchorY]: Anchor,
  [offsetX, offsetY]: Offset = [0, 0],
): Modifier {
  const getAnchorX = xAnchorOffsets[anchorX];
  const getAnchorY = yAnchorOffsets[anchorY];

  return ({ transform, activatorEvent, draggingNodeRect }) => {
    if (!activatorEvent || !draggingNodeRect) {
      return transform;
    }

    const pointer = getEventCoordinates(activatorEvent);

    if (!pointer) {
      return transform;
    }

    // Point where the user originally grabbed the element.
    const grabOffsetX = pointer.x - draggingNodeRect.left;

    const grabOffsetY = pointer.y - draggingNodeRect.top;

    // Point inside the element that should stay under
    // the pointer.
    const desiredX = getAnchorX(draggingNodeRect);
    const desiredY = getAnchorY(draggingNodeRect);

    return {
      ...transform,
      x: transform.x + grabOffsetX - desiredX + offsetX,

      y: transform.y + grabOffsetY - desiredY + offsetY,
    };
  };
}
