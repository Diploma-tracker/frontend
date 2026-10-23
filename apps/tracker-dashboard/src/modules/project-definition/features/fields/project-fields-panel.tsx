import { useMemo } from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import { useDndContext, useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DotsSixVerticalIcon, TrashIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui-kit/components/common/layout/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@repo/ui-kit/components/common/states/empty';
import { cn } from '@repo/ui-kit/lib/utils';

import {
  AVAILABLE_FIELD_TYPES_BY_TYPE,
  PROJECT_FIELDS_DROPPABLE_ID,
  type ProjectField,
  fieldTypeLabelKeys,
  projectFieldsAtom,
  removeProjectFieldAction,
  selectProjectFieldAction,
  selectedFieldIdAtom,
} from '../../models';

interface ProjectFieldRowProps {
  field: ProjectField;
  isSelected: boolean;
}

function ProjectFieldRow({ field, isSelected }: ProjectFieldRowProps) {
  const { t } = useTranslation();

  const meta = AVAILABLE_FIELD_TYPES_BY_TYPE[field.type];
  const Icon = meta.icon;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id, data: { source: 'fields' } });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors',
        isSelected ? 'border-primary bg-primary/5' : 'hover:bg-accent/50',
        isDragging && 'opacity-40',
      )}
      onClick={() => selectProjectFieldAction(field.id)}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing"
        aria-label={t('projectDefinition.fields.actions.dragHandle')}
        {...attributes}
        {...listeners}
      >
        <DotsSixVerticalIcon className="size-4" />
      </button>

      <Icon className="size-4 shrink-0 text-muted-foreground" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {field.name.trim() || t('projectDefinition.fields.untitled')}
        </p>
        <p className="text-xs text-muted-foreground">
          {t(fieldTypeLabelKeys[field.type])}
        </p>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        intent="destructive"
        aria-label={t('projectDefinition.fields.actions.remove')}
        onClick={(event) => {
          event.stopPropagation();
          removeProjectFieldAction(field.id);
        }}
      >
        <TrashIcon />
      </Button>
    </div>
  );
}

/**
 * Marks the gap a palette drag will drop the new field into, so the insertion
 * point is obvious before releasing the pointer.
 */
function InsertionIndicator() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -top-1 right-0 left-0 z-10 h-0.5 bg-primary"
    />
  );
}

/**
 * The landing zone shown while the list is empty: a palette drag has nowhere
 * to go otherwise.
 */
const EmptyFieldsDropzone = reatomComponent(function EmptyFieldsDropzone() {
  const { t } = useTranslation();

  const { setNodeRef, isOver } = useDroppable({
    id: PROJECT_FIELDS_DROPPABLE_ID,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-1 flex-col border border-dashed transition-colors',
        isOver && 'border-primary bg-primary/5',
      )}
    >
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t('projectDefinition.fields.emptyTitle')}</EmptyTitle>
          <EmptyDescription>
            {t('projectDefinition.fields.emptyDescription')}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
});

/**
 * Drop target after the last row, so a field can be appended to the end and a
 * palette drag can land below the list.
 */
const AppendFieldsDropzone = reatomComponent(function AppendFieldsDropzone() {
  const { setNodeRef, isOver } = useDroppable({
    id: PROJECT_FIELDS_DROPPABLE_ID,
  });

  const { active } = useDndContext();
  const isPaletteDrag = active?.data.current?.source === 'palette';

  return (
    <div ref={setNodeRef} className="relative mt-2 h-6">
      {isOver && isPaletteDrag && <InsertionIndicator />}
    </div>
  );
});

export const ProjectFieldsPanel = reatomComponent(
  function ProjectFieldsPanel() {
    const { t } = useTranslation();

    const fields = projectFieldsAtom();
    const selectedFieldId = selectedFieldIdAtom();

    /*
     * While a palette item is dragged, `over` names the field it will be
     * inserted before, so point that gap out. Drops on the append zone and on
     * the empty canvas highlight their own targets.
     */
    const { active, over } = useDndContext();
    const isPaletteDrag = active?.data.current?.source === 'palette';
    const insertIndex =
      isPaletteDrag && over
        ? fields.findIndex((field) => field.id === over.id)
        : -1;

    /*
     * Keep the sortable id list referentially stable: dnd-kit compares it by
     * reference to decide whether to keep animating, so rebuilding it on every
     * drag-over render would make rows snap instead of slide.
     */
    const items = useMemo(() => fields.map((field) => field.id), [fields]);

    return (
      <Card className="min-h-[25rem]">
        <CardHeader>
          <CardTitle>{t('projectDefinition.fields.title')}</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col">
          {fields.length === 0 ? (
            <EmptyFieldsDropzone />
          ) : (
            <>
              <SortableContext
                items={items}
                strategy={verticalListSortingStrategy}
              >
                <ul className="flex flex-col gap-2">
                  {fields.map((field, index) => (
                    <li key={field.id} className="relative">
                      {insertIndex === index && <InsertionIndicator />}
                      <ProjectFieldRow
                        field={field}
                        isSelected={field.id === selectedFieldId}
                      />
                    </li>
                  ))}
                </ul>
              </SortableContext>

              <AppendFieldsDropzone />
            </>
          )}
        </CardContent>
      </Card>
    );
  },
  'ProjectFieldsPanel',
);
