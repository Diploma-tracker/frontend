import { useTranslation } from '@/shared/utils/i18n';
import { useDraggable } from '@dnd-kit/core';
import { reatomComponent } from '@reatom/react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui-kit/components/common/layout/card';
import { cn } from '@repo/ui-kit/lib/utils';

import {
  PROJECT_FIELD_TYPES,
  type ProjectFieldType,
  addProjectFieldAction,
  projectFieldDragId,
} from '../../models';
import { ProjectFieldSquare } from './project-field-square';

interface PaletteItemProps {
  type: ProjectFieldType;
}

/**
 * A field type in the palette: drag it onto the list of fields to add it at
 * the drop position, or click to append it.
 */
const PaletteItem = reatomComponent(function PaletteItem({
  type,
}: PaletteItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: projectFieldDragId(type),
    data: { source: 'palette', type },
  });

  return (
    <ProjectFieldSquare
      ref={setNodeRef}
      type={type}
      onClick={() => addProjectFieldAction(type)}
      className={cn(
        'cursor-grab touch-none transition-colors select-none hover:bg-accent/50',
        isDragging && 'opacity-0',
      )}
      {...attributes}
      {...listeners}
    />
  );
});

export const AvailableFieldsPanel = reatomComponent(
  function AvailableFieldsPanel() {
    const { t } = useTranslation();

    return (
      <Card className="min-h-[25rem]">
        <CardHeader>
          <CardTitle>{t('projectDefinition.available.title')}</CardTitle>
          <CardDescription>
            {t('projectDefinition.available.description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-3 justify-items-center gap-2">
          {PROJECT_FIELD_TYPES.map((type) => (
            <PaletteItem key={type} type={type} />
          ))}
        </CardContent>
      </Card>
    );
  },
  'AvailableFieldsPanel',
);
