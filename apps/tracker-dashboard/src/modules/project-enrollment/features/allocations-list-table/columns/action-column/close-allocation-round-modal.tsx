import { useTranslation } from 'react-i18next';

import { ConfirmationModal } from '@/shared/components';
import { reatomComponent } from '@reatom/react';

import { closeAllocationRoundAction } from '../../../../models/allocation-round-actions-model';

interface CloseAllocationRoundModalProps {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CloseAllocationRoundModal = reatomComponent(function CloseAllocationRoundModal({
  id,
  open,
  onOpenChange,
}: CloseAllocationRoundModalProps) {
  const { t } = useTranslation();
  const isPending = !!closeAllocationRoundAction.pending();

  const handleConfirm = async () => {
    await closeAllocationRoundAction(id);
    onOpenChange(false);
  };

  return (
    <ConfirmationModal
      open={open}
      onOpenChange={(value) => !isPending && onOpenChange(value)}
      title={t('projectEnrollment.allocationRound.actions.confirmClose.title')}
      description={t('projectEnrollment.allocationRound.actions.confirmClose.description')}
      confirmVariant="destructive"
      isPending={isPending}
      onConfirm={handleConfirm}
    />
  );
}, 'CloseAllocationRoundModal');
