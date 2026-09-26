import {
  DragOverlay,
  type DropAnimationKeyframeResolver,
  type DropAnimationSideEffects,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { reatomComponent } from '@reatom/react';

import { catalogAtom } from '../model/field-catalog';
import {
  dragSessionAtom,
  dropSessionAtom,
  fieldsAtom,
} from '../model/form-builder-model';
import { FIELD_SQUARE_SIZE, FieldSquare } from './field-square';
import { PhysicsOverlay } from './physics-drag-overlay';

/**
 * How fast the ghost glides to its place when the field is dropped, in
 * milliseconds. Increase it for a longer, softer landing; the easing stays
 * dnd-kit's default `ease` unless `easing` is passed next to it.
 */
const DROP_ANIMATION_DURATION = 250;

/**
 * Keyframes of the drop animation.
 *
 * dnd-kit ends the animation at the node the drag started from. For a palette
 * drag that is the palette tile, so the ghost flies back to the palette while
 * the field it stands for is being placed in the canvas — drops animate into
 * the placed field instead, which sits in the layout for a palette drag and a
 * canvas drag alike, and its droppable rect is where the ghost belongs. A drop
 * that ends outside the canvas has no slot (the field was unplaced) and a
 * cancelled drop has no drop at all, so those keep dnd-kit's own animation, a
 * glide back to where the drag started.
 *
 * The session stays put after the read — the side effects (invoked right
 * after this) get it from the atom too.
 */
const dropAnimationKeyframes: DropAnimationKeyframeResolver = ({
  dragOverlay,
  droppableContainers,
  transform,
}) => {
  const session = dropSessionAtom();
  const target = session
    ? (droppableContainers.get(session.instanceId)?.rect.current ?? null)
    : null;

  if (!target) {
    return [
      { transform: CSS.Transform.toString(transform.initial) },
      { transform: CSS.Transform.toString(transform.final) },
    ];
  }

  // The ghost stays the square it is (no scaling) and glides so its top left
  // corner lands on the top left corner of the slot the field took.
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

/**
 * Side effects of the drop animation: what the default one does to the node
 * the drag started from (hide it for the flight) plus the same for the field
 * the ghost lands on. For a palette drag the start node is the palette tile
 * and the field just placed renders right away, so without this the field
 * pops up in the canvas while the ghost is still gliding towards it. The
 * returned cleanup brings everything back.
 */
const dropAnimationSideEffects: DropAnimationSideEffects = ({
  active,
  droppableContainers,
}) => {
  const session = dropSessionAtom();
  const targetNode = session
    ? (droppableContainers.get(session.instanceId)?.node.current ?? null)
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

/**
 * The drag ghost: the square of the field being dragged. The overlay is sized
 * inline because dnd-kit stretches its wrapper to the rect of the node the
 * drag started from, which on the canvas is the full-width placed field.
 */
export const FormDragOverlay = reatomComponent(function FormDragOverlay() {
  /**
   * The catalog field the current drag is about — the session keeps the
   * instance, the catalog field comes off its type.
   */
  const dragSession = dragSessionAtom();
  const draggedInstance = dragSession
    ? fieldsAtom.get(dragSession.instanceId)
    : null;
  const draggedField = draggedInstance
    ? (catalogAtom().find((item) => item.typeId === draggedInstance.typeId) ??
      null)
    : null;

  return (
    <DragOverlay
      style={{ width: FIELD_SQUARE_SIZE, height: FIELD_SQUARE_SIZE }}
      dropAnimation={{
        keyframes: dropAnimationKeyframes,
        sideEffects: dropAnimationSideEffects,
        duration: DROP_ANIMATION_DURATION,
      }}
    >
      {draggedField && (
        <PhysicsOverlay>
          <FieldSquare field={draggedField} />
        </PhysicsOverlay>
      )}
    </DragOverlay>
  );
});
