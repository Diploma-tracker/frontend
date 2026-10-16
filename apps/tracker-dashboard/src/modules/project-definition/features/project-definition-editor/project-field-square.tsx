import type { ComponentProps } from 'react';

import { useTranslation } from '@/shared/utils/i18n';

import { cn } from '@repo/ui-kit/lib/utils';

import {
  AVAILABLE_FIELD_TYPES_BY_TYPE,
  type ProjectFieldType,
  fieldTypeLabelKeys,
} from '../../models';

interface ProjectFieldSquareProps extends ComponentProps<'div'> {
  type: ProjectFieldType;
}

/**
 * Side of the square. A number instead of a class, because the drag overlay is
 * sized inline: dnd-kit stretches the overlay to the rect of the node the drag
 * started from, so the ghost has to be told its size the way the wrapper is.
 */
export const PROJECT_FIELD_SQUARE_SIZE = 80;

/**
 * The square a palette field type is shown as: as a palette tile, and under the
 * cursor while it is being dragged. Presentational on purpose — the palette
 * puts the drag listeners on it, the drag overlay reuses it as the ghost.
 */
export const ProjectFieldSquare = function ProjectFieldSquare({
  type,
  className,
  style,
  ...props
}: ProjectFieldSquareProps) {
  const { t } = useTranslation();

  const Icon = AVAILABLE_FIELD_TYPES_BY_TYPE[type].icon;

  return (
    <div
      style={{
        width: PROJECT_FIELD_SQUARE_SIZE,
        height: PROJECT_FIELD_SQUARE_SIZE,
        ...style,
      }}
      className={cn(
        'flex flex-col items-center justify-center gap-1.5 border bg-card p-2 text-center',
        className,
      )}
      {...props}
    >
      <Icon className="size-5 shrink-0 text-muted-foreground" />

      <span className="line-clamp-2 text-xs leading-tight text-muted-foreground">
        {t(fieldTypeLabelKeys[type])}
      </span>
    </div>
  );
};
