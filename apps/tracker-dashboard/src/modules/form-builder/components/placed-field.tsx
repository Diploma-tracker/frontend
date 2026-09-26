import { useTranslation } from '@/shared/utils/i18n';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TrashIcon } from '@phosphor-icons/react';

import { Badge } from '@repo/ui-kit/components/common/data-display/badge';
import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { cn } from '@repo/ui-kit/lib/utils';

import {
  commit,
  fieldsAtom,
  removeField,
  selectedFieldIdAtom,
} from '../model/form-builder-model';

interface PlacedFieldProps {
  instanceId: string;
}

export const PlacedField = function PlacedField({
  instanceId,
}: PlacedFieldProps) {
  const { t } = useTranslation();
  const field = fieldsAtom.get(instanceId);
  const selected = selectedFieldIdAtom() === instanceId;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: instanceId,
    data: { source: 'canvas', instanceId: instanceId },
  });

  const handleSelect = () => {
    selectedFieldIdAtom.set((current) =>
      current === instanceId ? null : instanceId,
    );
  };

  const handleRemove = () => {
    removeField(instanceId);
    commit();
  };

  if (!field) return null;

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className="h-full min-h-14 rounded-lg border-2 border-dashed border-primary bg-primary/10"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
      onClick={handleSelect}
      className={cn(
        'h-full cursor-grab rounded-lg border bg-card shadow-sm transition-shadow active:cursor-grabbing',
        selected ? 'border-primary ring-2 ring-primary/30' : 'hover:shadow-md',
      )}
    >
      <div className="flex h-full items-center gap-2 px-3 py-2">
        <div className="size-4 shrink-0 text-muted-foreground">IC</div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{field.props.label}</p>
          <p className="truncate text-xs text-muted-foreground">
            {field.typeId}
          </p>
        </div>

        {field.props.required && (
          <Badge variant="filled" intent="destructive">
            {t('formBuilder.canvas.required')}
          </Badge>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          intent="destructive"
          aria-label={t('formBuilder.canvas.deleteField')}
          onClick={(event) => {
            event.stopPropagation();
            handleRemove();
          }}
        >
          <TrashIcon />
        </Button>
      </div>
    </div>
  );
};
