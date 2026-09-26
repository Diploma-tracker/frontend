import { useCallback, useRef } from 'react';

import {
  type ClientRect,
  type Collision,
  type CollisionDetection,
  DndContext,
  type DragOverEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  type UniqueIdentifier,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { reatomComponent } from '@reatom/react';

import { type PremadeField } from '../model/field-catalog';
import {
  type AddTarget,
  activeTabAtom,
  addField,
  commit,
  dragSessionAtom,
  dropSessionAtom,
  fieldsAtom,
  layoutAtom,
  moveField,
  rollback,
  selectField,
  unplaceField,
} from '../model/form-builder-model';
import { parseRowIndex } from '../model/row-dnd';
import type { RowLayout } from '../model/schema-generator';
import { BuilderTabs } from './builder-tabs';
import { anchorModifier } from './dnd-kit-anchor';
import { FieldPalette } from './field-palette';
import { FormCanvas } from './form-canvas';
import { FormDragOverlay } from './form-drag-overlay';
import { FormPanel } from './form-panel';
import { FormPreview } from './form-preview';

/** Data attached to every droppable the canvas registers. */
interface DroppableData {
  kind?: 'canvas' | 'row' | 'row-gap';
  rowIndex?: number;
  afterRowIndex?: number;
  sortable?: { containerId: string };
}

/** Where the pointer is and how the droppables are currently laid out. */
interface DragGeometry {
  pointerX: number | null;
  rects: Map<UniqueIdentifier, ClientRect>;
}

/**
 * Rows win over the canvas root, fields win over their row: the canvas root
 * covers every other droppable, so without priorities a field drop would
 * always resolve to the bottom of the form.
 */
const COLLISION_PRIORITY: Record<string, number> = {
  'row-gap': 0,
  field: 1,
  row: 2,
  canvas: 3,
};

const collisionKind = (collision: Collision): string => {
  const data = collision.data?.droppableContainer?.data?.current as
    | DroppableData
    | undefined;
  if (!data) return 'unknown';
  if (data.sortable) return 'field';
  return data.kind ?? 'unknown';
};

const centerX = (rect: ClientRect | null | undefined): number | null =>
  rect ? rect.left + rect.width / 2 : null;

/** Whether a horizontal position falls inside a rect. */
const isOverRect = (
  rect: ClientRect | null | undefined,
  positionX: number,
): boolean =>
  rect !== null &&
  rect !== undefined &&
  rect.left < positionX &&
  positionX < rect.right;

/**
 * Index of the slot a horizontal position falls into in a row: the number of
 * fields whose middle is left of it.
 *
 * "Over a row" and "over a field" have to answer with this same rule. When they
 * disagree — the row saying "the end of the row" while a field says "next to
 * me" — every placement flips which of them wins, so the field jumps between
 * two slots for as long as the pointer stays put.
 */
const slotInRow = (
  row: string[],
  positionX: number,
  rects: Map<UniqueIdentifier, ClientRect>,
): number => {
  let slot = 0;

  for (const instanceId of row) {
    const middle = centerX(rects.get(instanceId));
    if (middle !== null && middle < positionX) slot += 1;
  }

  return slot;
};

/**
 * Maps whatever dnd-kit reports as `over` onto a model placement target: the
 * slot the position points at when it is over one (row gap, row or field), the
 * bottom of the form when it is somewhere else inside the canvas, and `null`
 * when it left the canvas entirely.
 */
const resolveDropTarget = (
  event: DragOverEvent,
  activeInstanceId: string,
  layout: RowLayout,
  geometry: DragGeometry,
): AddTarget | null => {
  const { active, over } = event;
  if (!over) return null;

  const data = over.data.current as DroppableData | undefined;
  if (!data) return null;

  if (data.kind === 'row-gap') {
    return {
      kind: 'addNewRow',
      afterRowIndex: data.afterRowIndex ?? layout.length - 1,
    };
  }

  if (data.kind === 'canvas') {
    return { kind: 'addNewRowInBottom' };
  }

  // Where the field would land: the pointer, or the overlay itself while
  // dragging with the keyboard — with the DragOverlay mounted the active node
  // follows the drag, so its rect is where the square is being dropped.
  const positionX =
    geometry.pointerX ??
    centerX(active.rect.current.translated ?? active.rect.current.initial);

  const rowIndex =
    data.kind === 'row'
      ? (data.rowIndex ?? 0)
      : parseRowIndex(data.sortable?.containerId ?? '');
  if (rowIndex === null) {
    return { kind: 'addNewRowInBottom' };
  }

  const row = layout[rowIndex];
  if (!row) {
    return { kind: 'addNewRowInBottom' };
  }

  if (data.kind === 'row') {
    // Pointing at the dragged field itself: it is already where it belongs.
    // The slot rule below would move it, because the position sits on one side
    // of its own middle, and that is exactly the feedback loop this whole
    // resolution is built to avoid.
    const activeSlot = row.indexOf(activeInstanceId);
    if (
      activeSlot !== -1 &&
      positionX !== null &&
      isOverRect(geometry.rects.get(activeInstanceId), positionX)
    ) {
      return { kind: 'insertInRow', rowIndex, index: activeSlot };
    }

    // Between two fields: the slot under the pointer, so the field lands where
    // it is dropped instead of at the end of the row.
    return {
      kind: 'insertInRow',
      rowIndex,
      index:
        positionX === null
          ? row.filter((id) => id !== activeInstanceId).length
          : slotInRow(row, positionX, geometry.rects),
    };
  }

  const overIndex = row.indexOf(String(over.id));
  if (overIndex === -1) {
    return { kind: 'addNewRowInBottom' };
  }

  // Same row: the sortable strategy has already shifted the neighbour the
  // moment the position touched it, so the layout has to take over its slot
  // right away — dnd-kit's own `arrayMove` behaviour. Anything slower (like
  // the middle split below) leaves the dragged field stacked on its side.
  if (row.includes(activeInstanceId)) {
    return { kind: 'insertInRow', rowIndex, index: overIndex };
  }

  // Into another row: no neighbour shifts as a preview, so the position
  // splits the field by its middle — the same answer the row gives itself.
  const overMiddle = centerX(geometry.rects.get(String(over.id)));
  const after =
    positionX !== null && overMiddle !== null && positionX > overMiddle;

  return {
    kind: 'insertInRow',
    rowIndex,
    index: after ? overIndex + 1 : overIndex,
  };
};

/** The slot a field occupies now, keyed like a placement target would be. */
const placementKeyOf = (layout: RowLayout, instanceId: string): string => {
  const rowIndex = layout.findIndex((row) => row.includes(instanceId));
  if (rowIndex === -1) return 'unplaced';
  return JSON.stringify({
    kind: 'insertInRow',
    rowIndex,
    index: layout[rowIndex]!.indexOf(instanceId),
  });
};

/**
 * How far the pointer has to travel before a reversal is believed. Between a
 * layout write and dnd-kit's re-measurement the droppable rects still describe
 * the old layout, so while the pointer crosses a field slowly the resolution
 * lands right back in the slot the field just left — and back again, until
 * React trips the maximum update depth. That reversal is deferred until the
 * pointer has genuinely moved on.
 */
const FLIP_CURSOR_HYSTERESIS_PX = 6;

export const FormBuilder = reatomComponent(function FormBuilder() {
  const activeTab = activeTabAtom();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  /**
   * Pointer position and droppable rects as of the last collision detection.
   * That is the only place that sees the real coordinates, and it runs on every
   * pointer move and on every re-measure, so it is current whenever
   * `onDragOver` runs.
   */
  const dragGeometryRef = useRef<DragGeometry>({
    pointerX: null,
    rects: new Map(),
  });

  const collisionDetection = useCallback<CollisionDetection>((args) => {
    dragGeometryRef.current = {
      pointerX: args.pointerCoordinates?.x ?? null,
      rects: args.droppableRects,
    };

    // The dragged field is taken out of the collisions: it is the only
    // droppable that follows the pointer, so as soon as it is placed under
    // the cursor it wins the priority sort, `over` flips to it, the target
    // resolves to nothing (or to its own slot) and the field is moved again —
    // an endless place/unplace loop that React trips over as a maximum update
    // depth.
    //
    // For a canvas drag the field is the active node and `active.id` covers
    // it; for a palette drag the active node is the palette tile, so the
    // placed field's id has to be excluded too — same pointer-following it.
    const draggedId = dragSessionAtom()?.instanceId ?? args.active.id;
    const collisions = args.pointerCoordinates
      ? pointerWithin(args)
      : closestCenter(args);

    return [...collisions]
      .filter(
        (collision) =>
          collision.id !== args.active.id && collision.id !== draggedId,
      )
      .sort(
        (a, b) =>
          (COLLISION_PRIORITY[collisionKind(a)] ?? 4) -
          (COLLISION_PRIORITY[collisionKind(b)] ?? 4),
      );
  }, []);

  const clearDragState = () => {
    dragSessionAtom.set(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;

    // If we drag from pallet we have to create and add field instance to fields.
    // Then in handleDragOver we track position for placing it.
    if (data?.source === 'palette') {
      const field = data.field as PremadeField | undefined;
      if (!field) return;

      const instance = addField(field);

      dragSessionAtom.set({
        source: 'palette',
        instanceId: instance.instanceId,
      });

      return;
    }

    if (data?.source === 'canvas') {
      const instanceId = String(event.active.id);
      if (!fieldsAtom.has(instanceId)) return;

      dragSessionAtom.set({
        source: 'canvas',
        instanceId,
      });
    }
  };

  /**
   * The placement the field vacated at the last `moveField` *and* the pointer
   * position then — a resolved target that would put it right back (while the
   * pointer has barely moved) is the stale-rect cycle, so it is held off.
   */
  const flipGuardRef = useRef<{
    fromKey: string;
    pointerX: number | null;
  } | null>(null);

  /**
   * The placement staged for the next animation frame. `onDragOver` can fire
   * several times in one frame (pointer moves, re-measures), and writing the
   * layout on every fire is what the frame loop then amplifies — one write per
   * frame, taking the last resolution, is all that ever shows on screen.
   */
  const pendingMoveRef = useRef<{
    instanceId: string;
    target: AddTarget;
  } | null>(null);
  const moveFrameRef = useRef<number | null>(null);

  const flushPendingMove = () => {
    if (moveFrameRef.current !== null) {
      cancelAnimationFrame(moveFrameRef.current);
      moveFrameRef.current = null;
    }

    const pending = pendingMoveRef.current;
    pendingMoveRef.current = null;
    if (pending) moveField(pending.instanceId, pending.target);
  };

  const stageMove = (instanceId: string, target: AddTarget) => {
    pendingMoveRef.current = { instanceId, target };
    if (moveFrameRef.current !== null) return;
    moveFrameRef.current = requestAnimationFrame(flushPendingMove);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const session = dragSessionAtom();
    if (!session) return;

    const { instanceId } = session;
    const layout = layoutAtom();
    const target = resolveDropTarget(
      event,
      instanceId,
      layout,
      dragGeometryRef.current,
    );

    if (!target) {
      // Pointer outside of the canvas: the field has no place until it is back.
      // Unplaced right away — a staged frame must not bring it back later.
      pendingMoveRef.current = null;
      unplaceField(instanceId);
      return;
    }

    const pointerX = dragGeometryRef.current.pointerX;
    const key = JSON.stringify(target);
    const flipGuard = flipGuardRef.current;

    if (
      flipGuard &&
      key === flipGuard.fromKey &&
      pointerX !== null &&
      flipGuard.pointerX !== null &&
      Math.abs(pointerX - flipGuard.pointerX) < FLIP_CURSOR_HYSTERESIS_PX
    ) {
      return;
    }

    flipGuardRef.current = {
      fromKey: placementKeyOf(layout, instanceId),
      pointerX,
    };
    stageMove(instanceId, target);
  };

  const handleDragEnd = () => {
    const session = dragSessionAtom();
    if (session) {
      // The last staged placement has to land before it can be committed.
      flushPendingMove();
      commit();
      dropSessionAtom.set(session);

      // A field that landed on the canvas becomes the selected one, same as a
      // field added from the palette with a click; a field dropped outside has
      // no place and stays unselected.
      selectField(
        layoutAtom().some((row) => row.includes(session.instanceId))
          ? session.instanceId
          : null,
      );
    }
    clearDragState();
  };

  const handleDragCancel = () => {
    // No drop happened, so the drop animation must not land the ghost on the
    // field: a stale session would send it to the previous drop's slot.
    dropSessionAtom.set(null);
    pendingMoveRef.current = null;
    if (dragSessionAtom()) {
      rollback();
    }
    clearDragState();
  };

  if (activeTab === 'preview') {
    return (
      <div className="flex flex-col gap-4">
        <BuilderTabs />
        <FormPreview />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <BuilderTabs />

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        modifiers={[anchorModifier(['center', 'top'], [0, 10])]}
      >
        <div className="grid grid-cols-[320px_minmax(0,1fr)_340px] items-start gap-6">
          <FieldPalette />
          <FormCanvas />
          <FormPanel />
        </div>

        <FormDragOverlay />
      </DndContext>
    </div>
  );
});
