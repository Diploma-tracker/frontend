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
  availableFieldsAtom,
  commit,
  createFormFieldFromDefinition,
  placeField,
} from '../../models/builder-state';
import type { ProjectFieldDefinition } from '../../models/types';
import { FieldSquare } from './field-square';

interface PaletteItemProps {
  field: ProjectFieldDefinition;
  addLabel: string;
}

const PaletteItem = reatomComponent(function PaletteItem({
  field,
  addLabel,
}: PaletteItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `form-field-palette-${field.name}`,
    data: { source: 'palette', field },
  });

  const handleAdd = () => {
    placeField(createFormFieldFromDefinition(field));
    commit();
  };

  return (
    <FieldSquare
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={handleAdd}
      field={field}
      title={field.name}
      aria-label={`${addLabel}: ${field.name}`}
      className={cn('cursor-grab', isDragging ? 'opacity-0' : 'opacity-100')}
    />
  );
});

export const FieldPalette = reatomComponent(function FieldPalette() {
  const { t } = useTranslation();

  return (
    <Card className="min-h-[25rem]">
      <CardHeader>
        <CardTitle>{t('formBuilder.palette.title')}</CardTitle>
        <CardDescription>
          {t('formBuilder.palette.description')}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-3 justify-items-center gap-2">
        {availableFieldsAtom().map((field) => (
          <PaletteItem
            key={field.name}
            field={field}
            addLabel={t('formBuilder.palette.addField')}
          />
        ))}
      </CardContent>
    </Card>
  );
});
