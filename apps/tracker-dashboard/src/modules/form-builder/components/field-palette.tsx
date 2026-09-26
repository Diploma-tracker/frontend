import { useTranslation } from '@/shared/utils/i18n';
import { useDraggable } from '@dnd-kit/core';
import { PlusIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui-kit/components/common/layout/card';
import { cn } from '@repo/ui-kit/lib/utils';

import { type PremadeField, catalogAtom } from '../model/field-catalog';
import { commit, placeField } from '../model/form-builder-model';

interface PaletteItemProps {
  field: PremadeField;
  addLabel: string;
}

const PaletteItem = reatomComponent(function PaletteItem({
  field,
  addLabel,
}: PaletteItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `form-field-palette-${field.typeId}`,
    data: { source: 'palette', field, typeId: field.typeId },
  });

  const Icon = field.icon;

  const handleAdd = () => {
    placeField(field);
    commit();
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        'flex cursor-grab items-center gap-3 rounded-md border bg-card px-3 py-2 transition-colors hover:bg-accent active:cursor-grabbing',
        isDragging ? 'opacity-40' : 'opacity-100',
      )}
      onClick={handleAdd}
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
          handleAdd();
        }}
      >
        <PlusIcon />
      </Button>
    </div>
  );
});

export const FieldPalette = reatomComponent(function FieldPalette() {
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
        {catalogAtom().map((field) => (
          <PaletteItem
            key={field.typeId}
            field={field}
            addLabel={t('formBuilder.palette.addField')}
          />
        ))}
      </CardContent>
    </Card>
  );
});
