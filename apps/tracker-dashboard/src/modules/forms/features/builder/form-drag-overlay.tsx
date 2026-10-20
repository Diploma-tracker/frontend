import { createDropAnimation } from '@/shared/components/dnd/drop-animation';
import { PhysicsOverlay } from '@/shared/components/dnd/physics-overlay';
import { DragOverlay } from '@dnd-kit/core';
import { reatomComponent } from '@reatom/react';

import { dragSessionAtom, dropSessionAtom } from '../../models/builder-state';
import { catalogAtom } from '../../models/field-catalog';
import { FIELD_SQUARE_SIZE, FieldSquare } from './field-square';

const dropAnimation = createDropAnimation(
  () => dropSessionAtom()?.name ?? null,
);

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
  const draggedField = dragSession
    ? (catalogAtom().find((item) => item.name === dragSession.name) ?? null)
    : null;

  return (
    <DragOverlay
      style={{ width: FIELD_SQUARE_SIZE, height: FIELD_SQUARE_SIZE }}
      dropAnimation={dropAnimation}
    >
      {draggedField && (
        <PhysicsOverlay>
          <FieldSquare field={draggedField} />
        </PhysicsOverlay>
      )}
    </DragOverlay>
  );
});
