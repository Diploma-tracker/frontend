import { Fragment } from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { PaperPlaneTiltIcon, SquaresFourIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@repo/ui-kit/components/common/states/empty';
import { cn } from '@repo/ui-kit/lib/utils';

import { fieldsAtom, layoutAtom } from '../model/form-builder-model';
import {
  CANVAS_DROPPABLE_ID,
  rowDroppableId,
  rowGapDroppableId,
} from '../model/row-dnd';
import { PlacedField } from './placed-field';

interface RowGapProps {
  afterRowIndex: number;
}

const RowGap = reatomComponent(function RowGap({ afterRowIndex }: RowGapProps) {
  const { setNodeRef } = useDroppable({
    id: rowGapDroppableId(afterRowIndex),
    data: { kind: 'row-gap', afterRowIndex },
  });

  return <div ref={setNodeRef} className="h-5" />;
});

interface CanvasRowProps {
  row: string[];
  rowIndex: number;
}

const CanvasRow = reatomComponent(function CanvasRow({
  row,
  rowIndex,
}: CanvasRowProps) {
  const { setNodeRef } = useDroppable({
    id: rowDroppableId(rowIndex),
    data: { kind: 'row', rowIndex },
  });

  return (
    <div ref={setNodeRef} className="flex items-stretch gap-3">
      <SortableContext
        id={rowDroppableId(rowIndex)}
        items={row}
        strategy={horizontalListSortingStrategy}
      >
        {row.map((instanceId) =>
          fieldsAtom.has(instanceId) ? (
            <div key={instanceId} className="min-w-0 flex-1">
              <PlacedField instanceId={instanceId} />
            </div>
          ) : null,
        )}
      </SortableContext>
    </div>
  );
});

const EmptyCanvas = reatomComponent(function EmptyCanvas() {
  const { t } = useTranslation();
  return (
    <Empty className="border-none">
      <EmptyContent>
        <EmptyMedia variant="icon">
          <SquaresFourIcon />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>{t('formBuilder.canvas.emptyTitle')}</EmptyTitle>
          <EmptyDescription>
            {t('formBuilder.canvas.emptyDescription')}
          </EmptyDescription>
        </EmptyHeader>
      </EmptyContent>
    </Empty>
  );
});

export const FormCanvas = reatomComponent(function FormCanvas() {
  const { t } = useTranslation();

  const { setNodeRef, isOver } = useDroppable({
    id: CANVAS_DROPPABLE_ID,
    data: { kind: 'canvas' },
  });
  const layout = layoutAtom();

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-h-64 flex-col rounded-xl border border-dashed p-4 pt-0 transition-colors',
        isOver ? 'border-primary bg-primary/5' : 'border-border',
      )}
    >
      {layout.length === 0 ? (
        <EmptyCanvas />
      ) : (
        <>
          <RowGap afterRowIndex={-1} />
          {layout.map((row, rowIndex) => (
            <Fragment key={rowIndex}>
              <CanvasRow row={row} rowIndex={rowIndex} />
              <RowGap afterRowIndex={rowIndex} />
            </Fragment>
          ))}
        </>
      )}

      <div className="mt-auto flex items-center justify-center gap-2 rounded-lg border border-dashed border-muted px-3 py-2.5 text-xs text-muted-foreground">
        <PaperPlaneTiltIcon className="size-4" />
        <span>{t('formBuilder.canvas.submitHint')}</span>
        <Button type="button" variant="outline" size="sm" disabled>
          {t('formBuilder.preview.submit')}
        </Button>
      </div>
    </div>
  );
});
