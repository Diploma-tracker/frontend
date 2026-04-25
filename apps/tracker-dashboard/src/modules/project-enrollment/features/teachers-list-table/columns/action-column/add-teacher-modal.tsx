import { useTranslation } from 'react-i18next';

import { ConfirmationModal } from '@/shared/components';
import { reatomComponent } from '@reatom/react';

import { addTeachersAction } from '../../../../models';

interface AddTeacherModalProps {
  roundId: string;
  teacherId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddTeacherModal = reatomComponent(function AddTeacherModal({
  roundId,
  teacherId,
  open,
  onOpenChange,
}: AddTeacherModalProps) {
  const { t } = useTranslation();
  const isPending = !!addTeachersAction.pending();

  const handleConfirm = async () => {
    await addTeachersAction({ roundId, teacherIds: [teacherId] });
    onOpenChange(false);
  };

  const handleOpenChange = (value: boolean) => {
    if (!isPending) onOpenChange(value);
  };

  return (
    <ConfirmationModal
      open={open}
      onOpenChange={handleOpenChange}
      title={t('projectEnrollment.teacher.actions.confirmAdd.title')}
      description={t('projectEnrollment.teacher.actions.confirmAdd.description')}
      isPending={isPending}
      onConfirm={handleConfirm}
    />
  );
}, 'AddTeacherModal');
