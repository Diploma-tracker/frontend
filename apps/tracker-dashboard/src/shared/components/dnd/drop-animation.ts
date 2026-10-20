import {
  type DropAnimation,
  type DropAnimationKeyframeResolver,
  type DropAnimationSideEffects,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

/**
 * How fast the ghost glides to its place when a field is dropped, in
 * milliseconds. Increase it for a longer, softer landing; the easing stays
 * dnd-kit's default unless `easing` is passed next to it.
 */
export const DROP_ANIMATION_DURATION = 250;

/**
 * The droppable id the ghost should land on for the drop currently animating,
 * or `null` when there is none (a cancelled drop, or a drop outside any slot).
 */
export type DropTargetResolver = () => string | null;

/**
 * Builds dnd-kit's drop animation for a drag whose ghost should glide onto a
 * placed item instead of back where the drag started.
 *
 * dnd-kit ends the default animation at the node the drag started from — for a
 * palette drag that is the palette tile, so the ghost would fly back to the
 * palette while the field it stands for is placed in the list. With a resolver
 * that names the placed item's droppable, the ghost glides onto that item's
 * rect instead, and the start node plus the target are hidden for the flight so
 * the placed item does not pop in while the ghost is still moving. A drop with
 * no target keeps dnd-kit's own animation (a glide back to the start).
 */
export const createDropAnimation = (
  resolveTargetId: DropTargetResolver,
): DropAnimation => {
  const keyframes: DropAnimationKeyframeResolver = ({
    dragOverlay,
    droppableContainers,
    transform,
  }) => {
    const targetId = resolveTargetId();
    const target = targetId
      ? (droppableContainers.get(targetId)?.rect.current ?? null)
      : null;

    if (!target) {
      return [
        { transform: CSS.Transform.toString(transform.initial) },
        { transform: CSS.Transform.toString(transform.final) },
      ];
    }

    // The ghost keeps its size (no scaling) and glides so its top left corner
    // lands on the top left corner of the slot the item took.
    const { left, top } = dragOverlay.rect;

    return [
      { transform: CSS.Transform.toString(transform.initial) },
      {
        transform: CSS.Transform.toString({
          x: transform.initial.x + (target.left - left),
          y: transform.initial.y + (target.top - top),
          scaleX: 1,
          scaleY: 1,
        }),
      },
    ];
  };

  const sideEffects: DropAnimationSideEffects = ({
    active,
    droppableContainers,
  }) => {
    const targetId = resolveTargetId();
    const targetNode = targetId
      ? (droppableContainers.get(targetId)?.node.current ?? null)
      : null;

    const hidden: Array<[HTMLElement, string]> = [];
    for (const node of [active.node, targetNode]) {
      if (!node || hidden.some(([entry]) => entry === node)) continue;
      hidden.push([node, node.style.opacity]);
      node.style.opacity = '0';
    }

    return () => {
      for (const [node, previousOpacity] of hidden) {
        node.style.opacity = previousOpacity;
      }
    };
  };

  return { keyframes, sideEffects, duration: DROP_ANIMATION_DURATION };
};
