import { useTranslation } from 'react-i18next';

import { ConfirmationModal } from '@/shared/components';
import { reatomComponent } from '@reatom/react';

import { removeTeachersAction } from '../../../../models';

interface RemoveTeacherModalProps {
  roundId: string;
  teacherId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RemoveTeacherModal = reatomComponent(function RemoveTeacherModal({
  roundId,
  teacherId,
  open,
  onOpenChange,
}: RemoveTeacherModalProps) {
  const { t } = useTranslation();
  const isPending = !!removeTeachersAction.pending();

  const handleConfirm = async () => {
    await removeTeachersAction({ roundId, teacherIds: [teacherId] });
    onOpenChange(false);
  };

  const handleOpenChange = (value: boolean) => {
    if (!isPending) onOpenChange(value);
  };

  return (
    <ConfirmationModal
      open={open}
      onOpenChange={handleOpenChange}
      title={t('projectEnrollment.teacher.actions.confirmRemove.title')}
      description={t('projectEnrollment.teacher.actions.confirmRemove.description')}
      confirmVariant="destructive"
      isPending={isPending}
      onConfirm={handleConfirm}
    />
  );
}, 'RemoveTeacherModal');
