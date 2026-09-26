import { useTranslation } from '@/shared/utils/i18n';
import { useDraggable } from '@dnd-kit/core';
import { PlusIcon } from '@phosphor-icons/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui-kit/components/common/layout/card';
import { cn } from '@repo/ui-kit/lib/utils';

import type { PremadeField } from '../model/field-catalog';

interface PaletteItemProps {
  field: PremadeField;
  addLabel: string;
  onAdd: (field: PremadeField) => void;
}

const PaletteItem = function PaletteItem({
  field,
  addLabel,
  onAdd,
}: PaletteItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `form-field-palette-${field.typeId}`,
    data: { source: 'palette', field, typeId: field.typeId },
  });

  const Icon = field.icon;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        'flex cursor-grab items-center gap-3 rounded-md border bg-card px-3 py-2 transition-colors hover:bg-accent active:cursor-grabbing',
        isDragging ? 'opacity-40' : 'opacity-100',
      )}
      onClick={() => onAdd(field)}
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{field.label}</p>
        <p className="truncate text-xs text-muted-foreground">
          {field.description}
        </p>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        intent="primary"
        aria-label={addLabel}
        onClick={(event) => {
          event.stopPropagation();
          onAdd(field);
        }}
      >
        <PlusIcon />
      </Button>
    </div>
  );
};

interface FieldPaletteProps {
  catalog: PremadeField[];
  onAddField: (field: PremadeField) => void;
}

export const FieldPalette = function FieldPalette({
  catalog,
  onAddField,
}: FieldPaletteProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('formBuilder.palette.title')}</CardTitle>
        <CardDescription>
          {t('formBuilder.palette.description')}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        {catalog.map((field) => (
          <PaletteItem
            key={field.typeId}
            field={field}
            addLabel={t('formBuilder.palette.addField')}
            onAdd={onAddField}
          />
        ))}
      </CardContent>
    </Card>
  );
};
