import { PhysicsOverlay } from '@/shared/components/dnd/physics-overlay';
import {
  DragOverlay,
  type DropAnimationKeyframeResolver,
  type DropAnimationSideEffects,
  useDndContext,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
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

/**
 * How fast the ghost glides to its place when the field is dropped, in
 * milliseconds. Matches the form builder so both editors land the same way.
 */
const DROP_ANIMATION_DURATION = 250;

/**
 * dnd-kit ends the default drop animation at the node the drag started from —
 * for a palette drag the palette square, so the ghost would fly back to the
 * palette while the field it stands for appears in the list. The ghost glides
 * onto the placed field's droppable rect instead.
 */
const dropAnimationKeyframes: DropAnimationKeyframeResolver = ({
  dragOverlay,
  droppableContainers,
  transform,
}) => {
  const session = projectFieldDropSessionAtom();
  const target = session
    ? (droppableContainers.get(session.id)?.rect.current ?? null)
    : null;

  if (!target) {
    return [
      { transform: CSS.Transform.toString(transform.initial) },
      { transform: CSS.Transform.toString(transform.final) },
    ];
  }

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
 * Hides the palette square the drag started from and the field the ghost lands
 * on for the duration of the flight, so the placed field does not pop in while
 * the ghost is still gliding towards it.
 */
const dropAnimationSideEffects: DropAnimationSideEffects = ({
  active,
  droppableContainers,
}) => {
  const session = projectFieldDropSessionAtom();
  const targetNode = session
    ? (droppableContainers.get(session.id)?.node.current ?? null)
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
        dropAnimation={{
          keyframes: dropAnimationKeyframes,
          sideEffects: dropAnimationSideEffects,
          duration: DROP_ANIMATION_DURATION,
        }}
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
