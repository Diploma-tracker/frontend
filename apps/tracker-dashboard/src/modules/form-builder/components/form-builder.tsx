import { useCallback, useRef, useState } from 'react';

import {
  type ClientRect,
  type Collision,
  type CollisionDetection,
  DndContext,
  type DragOverEvent,
  DragOverlay,
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

import { type PremadeField, catalogAtom } from '../model/field-catalog';
import {
  type AddTarget,
  activeTabAtom,
  addField,
  commit,
  fieldsAtom,
  layoutAtom,
  moveField,
  rollback,
  unplaceField,
} from '../model/form-builder-model';
import { parseRowIndex } from '../model/row-dnd';
import type { RowLayout } from '../model/schema-generator';
import { BuilderTabs } from './builder-tabs';
import { anchorModifier } from './dnd-kit-anchor';
import { FieldPalette } from './field-palette';
import { FIELD_SQUARE_SIZE, FieldSquare } from './field-square';
import { FormCanvas } from './form-canvas';
import { FormPanel } from './form-panel';
import { FormPreview } from './form-preview';
import { PhysicsOverlay } from './physics-drag-overlay';

type DragSession = {
  source: 'palette' | 'canvas';
  instanceId: string;
};

/** What the drag overlay draws: the square of the field being dragged. */
type DraggedField = Pick<PremadeField, 'icon' | 'label'>;

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

  // Over a field: take over its slot, which is what dnd-kit's own
  // `arrayMove(items, activeIndex, overIndex)` does. Comparing the position with
  // the middle of the field instead would disagree with the sortable transform,
  // which already shifts the neighbour as soon as the position touches it: the
  // row would look swapped while the layout never changed.
  const overIndex = row.indexOf(String(over.id));
  if (overIndex === -1) {
    return { kind: 'addNewRowInBottom' };
  }

  return { kind: 'insertInRow', rowIndex, index: overIndex };
};

export const FormBuilder = reatomComponent(function FormBuilder() {
  const dragSessionRef = useRef<DragSession | null>(null);
  const [draggedField, setDraggedField] = useState<DraggedField | null>(null);

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
    // resolves to nothing and the field is unplaced again — an endless
    // place/unplace loop.
    const collisions = args.pointerCoordinates
      ? pointerWithin(args)
      : closestCenter(args);

    return [...collisions]
      .filter((collision) => collision.id !== args.active.id)
      .sort(
        (a, b) =>
          (COLLISION_PRIORITY[collisionKind(a)] ?? 4) -
          (COLLISION_PRIORITY[collisionKind(b)] ?? 4),
      );
  }, []);

  const clearDragState = () => {
    dragSessionRef.current = null;
    setDraggedField(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;

    // If we drag from pallet we have to create and add field instance to fields.
    // Then in handleDragOver we track position for placing it.
    if (data?.source === 'palette') {
      const field = data.field as PremadeField | undefined;
      if (!field) return;

      const instance = addField(field);

      dragSessionRef.current = {
        source: 'palette',
        instanceId: instance.instanceId,
      };
      setDraggedField({ icon: field.icon, label: field.label });

      return;
    }

    if (data?.source === 'canvas') {
      const instanceId = String(event.active.id);
      const field = fieldsAtom.get(instanceId);
      if (!field) return;

      dragSessionRef.current = {
        source: 'canvas',
        instanceId,
      };

      // The icon lives in the catalog, the label on the instance.
      const catalogField = catalogAtom().find(
        (item) => item.typeId === field.typeId,
      );
      if (catalogField) {
        setDraggedField({
          icon: catalogField.icon,
          label: field.props.label,
        });
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const session = dragSessionRef.current;
    if (!session) return;

    const { instanceId } = session;
    const target = resolveDropTarget(
      event,
      instanceId,
      layoutAtom(),
      dragGeometryRef.current,
    );

    if (target) {
      moveField(instanceId, target);
      return;
    }

    // Pointer outside of the canvas: the field has no place until it is back.
    unplaceField(instanceId);
  };

  const handleDragEnd = () => {
    const session = dragSessionRef.current;
    if (session) {
      // TODO: add cleanup of other atoms before commit, like fields and so on
      commit();
    }
    clearDragState();
  };

  const handleDragCancel = () => {
    const session = dragSessionRef.current;
    if (session) {
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

        <DragOverlay
          style={{ width: FIELD_SQUARE_SIZE, height: FIELD_SQUARE_SIZE }}
        >
          {draggedField && (
            <PhysicsOverlay>
              <FieldSquare
                icon={draggedField.icon}
                label={draggedField.label}
              />
            </PhysicsOverlay>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
});
