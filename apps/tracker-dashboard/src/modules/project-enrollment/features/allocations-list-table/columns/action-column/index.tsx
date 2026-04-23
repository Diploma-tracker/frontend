import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { T } from '@/shared/components';
import { DotsThreeVerticalIcon } from '@phosphor-icons/react';
import { type ColumnDef } from '@tanstack/react-table';

import type { AllocationRoundDTO } from '@repo/api-types';
import { Button } from '@repo/ui-kit/components/common/data-display/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui-kit/components/dropdown-menu';

import { CloseAllocationRoundModal } from './close-allocation-round-modal';
import { OpenAllocationRoundModal } from './open-allocation-round-modal';

// eslint-disable-next-line react-refresh/only-export-components
const ActionCell = ({ row }: { row: { original: AllocationRoundDTO } }) => {
  const { t } = useTranslation();
  const { id, status } = row.original;
  const [openModalOpen, setOpenModalOpen] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);

  const canOpen = status === 'DRAFT';
  const canClose = status === 'OPEN';

  const handleOpenSelect = () => setOpenModalOpen(true);
  const handleCloseSelect = () => setCloseModalOpen(true);

  if (!canOpen && !canClose) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-xs">
            <DotsThreeVerticalIcon weight="bold" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canOpen && (
            <DropdownMenuItem onSelect={handleOpenSelect}>
              {t('projectEnrollment.allocationRound.actions.open')}
            </DropdownMenuItem>
          )}
          {canClose && (
            <DropdownMenuItem variant="destructive" onSelect={handleCloseSelect}>
              {t('projectEnrollment.allocationRound.actions.close')}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canOpen && <OpenAllocationRoundModal id={id} open={openModalOpen} onOpenChange={setOpenModalOpen} />}
      {canClose && <CloseAllocationRoundModal id={id} open={closeModalOpen} onOpenChange={setCloseModalOpen} />}
    </>
  );
};

export const ActionColumn: ColumnDef<AllocationRoundDTO> = {
  id: 'actions',
  header: () => <T k="projectEnrollment.allocationRound.table.columns.actions" />,
  cell: ({ row }) => <ActionCell row={row} />,
};
