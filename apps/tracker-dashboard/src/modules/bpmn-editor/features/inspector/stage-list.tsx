import { useTranslation } from '@/shared/utils/i18n';
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DotsSixVerticalIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { cn } from '@repo/ui-kit/lib/utils';

import { reorderStages, stagesAtom } from '../../models/actions/stages';
import type { StageInfo } from '../../models/definitions/stage-definitions';
import { pickElement } from '../../models/editor-model';

function StageRow({ stage }: { stage: StageInfo }) {
  const { t } = useTranslation();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-1 rounded-md border bg-card py-1 pr-2 pl-0.5 shadow-sm',
        isDragging && 'opacity-70 shadow-md',
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none rounded p-1 text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing"
        aria-label={t('bpmnEditor.inspector.stageDragHandle')}
        {...attributes}
        {...listeners}
      >
        <DotsSixVerticalIcon className="size-4" />
      </button>
      <button
        type="button"
        className="min-w-0 flex-1 truncate rounded-sm px-1 text-left text-sm hover:text-primary"
        title={stage.name}
        onClick={() => pickElement(stage.id)}
      >
        {stage.name}
      </button>
    </div>
  );
}

/**
 * The diagram's stages as a single sortable list, in their persisted order.
 * Dragging rebuilds the order and writes it back to the diagram XML.
 */
export const StageList = reatomComponent(function StageList() {
  const { t } = useTranslation();
  const stages = stagesAtom();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  if (stages.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
        {t('bpmnEditor.inspector.stagesEmpty')}
      </p>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const ids = stages.map((stage) => stage.id);
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));

    if (from === -1 || to === -1) return;

    reorderStages(arrayMove(ids, from, to));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={stages.map((stage) => stage.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-1.5">
          {stages.map((stage) => (
            <StageRow key={stage.id} stage={stage} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
});
