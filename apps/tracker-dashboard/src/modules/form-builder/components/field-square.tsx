import type { ComponentProps } from 'react';

import { cn } from '@repo/ui-kit/lib/utils';

import type { PremadeField } from '../model/field-catalog';

interface FieldSquareProps extends ComponentProps<'div'> {
  /** The catalog field the square stands for. */
  field: PremadeField;
}

/**
 * Side of the square. A number instead of a class, because the drag overlay is
 * sized inline: dnd-kit stretches the overlay to the rect of the node the drag
 * started from, and on the canvas that is the full-width placed field, so the
 * ghost has to be told its size the way the overlay wrapper is told it.
 */
export const FIELD_SQUARE_SIZE = 80;

/**
 * The square a catalog field is shown as: as a palette tile, and under the
 * cursor while it is being dragged. Presentational on purpose — the palette
 * puts the drag listeners on it, the drag overlay reuses it as the ghost.
 */
export const FieldSquare = function FieldSquare({
  field,
  className,
  style,
  ...props
}: FieldSquareProps) {
  const Icon = field.icon;

  return (
    <div
      style={{
        width: FIELD_SQUARE_SIZE,
        height: FIELD_SQUARE_SIZE,
        ...style,
      }}
      className={cn(
        'flex flex-col items-center justify-center gap-1.5 rounded-md border bg-card p-2 text-center',
        className,
      )}
      {...props}
    >
      <Icon className="size-5 shrink-0 text-muted-foreground" />

      <span className="line-clamp-2 text-xs leading-tight text-muted-foreground">
        {field.label}
      </span>
    </div>
  );
};
