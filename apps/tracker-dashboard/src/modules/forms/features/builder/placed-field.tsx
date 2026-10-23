import { useMemo } from 'react';

import { jsonFormsRenderers } from '@/shared/components/json-forms';
import { useTranslation } from '@/shared/utils/i18n';
import { defaultAnimateLayoutChanges, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { JsonForms } from '@jsonforms/react';
import { TrashIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { cn } from '@repo/ui-kit/lib/utils';

import {
  commit,
  dragSessionAtom,
  fieldsAtom,
  removeField,
  selectedFieldNameAtom,
} from '../../models/builder-state';
import { generateFormFromDomain } from '../../models/schema-generator';
import type { BuilderOutput } from '../../models/types';

interface PlacedFieldProps {
  name: string;
}

type AnimateLayoutChangesArgs = Parameters<
  typeof defaultAnimateLayoutChanges
>[0];

const animateLayoutChanges = (args: AnimateLayoutChangesArgs) =>
  defaultAnimateLayoutChanges(args) ||
  (args.active != null && args.wasDragging);

export const PlacedField = reatomComponent(function PlacedField({
  name,
}: PlacedFieldProps) {
  const { t } = useTranslation();
  const field = fieldsAtom.get(name);
  const selected = selectedFieldNameAtom() === name;

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: name,
      data: { source: 'canvas', name },
      animateLayoutChanges,
    });

  const isDragged = dragSessionAtom()?.name === name;

  const preview = useMemo<BuilderOutput | null>(() => {
    if (!field) return null;
    return generateFormFromDomain({
      id: globalThis.crypto.randomUUID(),
      name: '',
      fields: [field],
      validation_rules: [],
      ui: [[field.name]],
    });
  }, [field]);

  const handleSelect = () => {
    selectedFieldNameAtom.set((current) => (current === name ? null : name));
  };

  const handleRemove = () => {
    removeField(name);
    commit();
  };

  if (!field || !preview) return null;

  if (isDragged) {
    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className="h-full min-h-12 rounded-lg border-2 border-dashed border-primary bg-primary/10"
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
        'relative h-full cursor-grab rounded-lg border bg-card p-3 shadow-sm transition-shadow active:cursor-grabbing',
        selected ? 'border-primary ring-2 ring-primary/30' : 'hover:shadow-md',
      )}
    >
      <div className="pointer-events-none select-none">
        <JsonForms
          data={{}}
          schema={preview.schema}
          uischema={preview.uischema}
          renderers={jsonFormsRenderers}
          readonly
        />
      </div>

      <div
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          intent="destructive"
          className="absolute top-1.5 right-1.5 bg-card"
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
});
