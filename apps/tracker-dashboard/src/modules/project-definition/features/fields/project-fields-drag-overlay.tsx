import { createDropAnimation } from '@/shared/components/dnd/drop-animation';
import { PhysicsOverlay } from '@/shared/components/dnd/physics-overlay';
import { DragOverlay, useDndContext } from '@dnd-kit/core';
import { reatomComponent } from '@reatom/react';

import { cn } from '@repo/ui-kit/lib/utils';

import {
  type ProjectFieldType,
  projectFieldDragSessionAtom,
  projectFieldDropSessionAtom,
} from '../../models';
import {
  PROJECT_FIELD_SQUARE_SIZE,
  ProjectFieldSquare,
} from './project-field-square';

const dropAnimation = createDropAnimation(
  () => projectFieldDropSessionAtom()?.id ?? null,
);

/**
 * Whether a drag is currently active. During the drop animation dnd-kit has
 * already cleared the active drag, so this is false and the ghost drops its
 * active look for the flight home.
 */
function useDragActive() {
  return Boolean(useDndContext().active);
}

/**
 * Ghost of a palette square: shown only while a new field is dragged in from
 * the palette. Reordering keeps dnd-kit's plain sortable behaviour.
 */
function PaletteGhost({ type }: { type: ProjectFieldType }) {
  const isActive = useDragActive();

  return (
    <ProjectFieldSquare
      type={type}
      className={cn(
        isActive
          ? 'border-primary shadow-xl ring-2 ring-primary/40'
          : 'shadow-lg',
      )}
    />
  );
}

export const ProjectFieldsDragOverlay = reatomComponent(
  function ProjectFieldsDragOverlay() {
    const dragSession = projectFieldDragSessionAtom();
    const dropSession = projectFieldDropSessionAtom();

    /*
     * Reordering is plain dnd-kit sortable — the field itself is transformed,
     * no overlay — so the overlay only exists for a palette drag. A palette
     * drop keeps its session (hence `dropSession` non-null) until the next
     * drag starts, so the ghost survives its drop animation.
     */
    if (dragSession?.source !== 'palette' && dropSession === null) {
      return null;
    }

    const paletteType =
      dragSession?.source === 'palette' ? dragSession.type : null;

    return (
      <DragOverlay
        style={{
          width: PROJECT_FIELD_SQUARE_SIZE,
          height: PROJECT_FIELD_SQUARE_SIZE,
        }}
        dropAnimation={dropAnimation}
      >
        {paletteType && (
          <PhysicsOverlay>
            <PaletteGhost type={paletteType} />
          </PhysicsOverlay>
        )}
      </DragOverlay>
    );
  },
  'ProjectFieldsDragOverlay',
);
