import { useMemo } from 'react';

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
  selectedFieldIdAtom,
} from '../model/form-builder-model';
import { generateBuilderOutput } from '../model/schema-generator';
import { formBuilderRenderers } from '../renderers/register-renderers';

interface PlacedFieldProps {
  instanceId: string;
}

type AnimateLayoutChangesArgs = Parameters<
  typeof defaultAnimateLayoutChanges
>[0];

/**
 * The builder writes the new row order itself while a drag is in flight, so by
 * the time a canvas field swaps slots the sortable's own bookkeeping is already
 * stale: `newIndex` gets recomputed from the order that was just committed and
 * lands back on the current `index`, which is exactly the case the default
 * check treats as "nothing moved" and switches the derived transform off - the
 * field would jump instead of sliding. A drag being live is enough to keep the
 * transition on, and it only ever applies to a field whose index changed.
 */
const animateLayoutChanges = (args: AnimateLayoutChangesArgs) =>
  defaultAnimateLayoutChanges(args) ||
  (args.active != null && args.wasDragging);

export const PlacedField = reatomComponent(function PlacedField({
  instanceId,
}: PlacedFieldProps) {
  const { t } = useTranslation();
  const field = fieldsAtom.get(instanceId);
  const selected = selectedFieldIdAtom() === instanceId;

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: instanceId,
      data: { source: 'canvas', instanceId: instanceId },
      animateLayoutChanges,
    });

  /**
   * dnd-kit's own `isDragging` only covers the node the drag started from, which
   * for a field dragged out of the palette is the tile in the palette. The
   * dragged field is the one the builder tracks, so the gap shows up for it
   * either way.
   */
  const isDragged = dragSessionAtom()?.instanceId === instanceId;

  /**
   * The field as a one-field form: the very same schema/uischema pair and the
   * very same renderers the finished form is built from, so the tile shows the
   * field instead of a stand-in for it.
   */
  const preview = useMemo(
    () =>
      field ? generateBuilderOutput([field], [[field.instanceId]], []) : null,
    [field],
  );

  const handleSelect = () => {
    selectedFieldIdAtom.set((current) =>
      current === instanceId ? null : instanceId,
    );
  };

  const handleRemove = () => {
    removeField(instanceId);
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
      {/*
       * Readonly + `pointer-events-none`: the builder owns the gestures on the
       * tile (drag to move, click to select), so the rendered control must never
       * take focus, open a popover or swallow a pointer event meant for dnd.
       */}
      <div className="pointer-events-none select-none">
        <JsonForms
          data={{}}
          schema={preview.schema}
          uischema={preview.uischema}
          renderers={formBuilderRenderers}
          readonly
        />
      </div>

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
  );
});
