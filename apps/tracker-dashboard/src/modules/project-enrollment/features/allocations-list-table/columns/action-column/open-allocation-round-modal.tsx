import { useTranslation } from 'react-i18next';

import { ConfirmationModal } from '@/shared/components';
import { reatomComponent } from '@reatom/react';

import { openAllocationRoundAction } from '../../../../models/allocation-round-actions-model';

interface OpenAllocationRoundModalProps {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OpenAllocationRoundModal = reatomComponent(function OpenAllocationRoundModal({
  id,
  open,
  onOpenChange,
}: OpenAllocationRoundModalProps) {
  const { t } = useTranslation();
  const isPending = !!openAllocationRoundAction.pending();

  const handleConfirm = async () => {
    await openAllocationRoundAction(id);
    onOpenChange(false);
  };

  return (
    <ConfirmationModal
      open={open}
      onOpenChange={(value) => !isPending && onOpenChange(value)}
      title={t('projectEnrollment.allocationRound.actions.confirmOpen.title')}
      description={t('projectEnrollment.allocationRound.actions.confirmOpen.description')}
      isPending={isPending}
      onConfirm={handleConfirm}
    />
  );
}, 'OpenAllocationRoundModal');
