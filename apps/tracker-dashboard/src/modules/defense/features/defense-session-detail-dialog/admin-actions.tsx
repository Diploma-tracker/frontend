import { useState } from 'react';

import { ConfirmationModal } from '@/shared/components/confirmation-modal/confirmation-modal';
import { useQuery } from '@/shared/model/query';
import { useTranslation } from '@/shared/utils/i18n';
import { CircleNotchIcon, PencilIcon, TrashIcon } from '@phosphor-icons/react';
import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/ui-kit/components/common/floating/dialog';
import { toast } from '@repo/ui-kit/components/common/floating/sonner';

import { defenseSessionDetailsQuery, deleteDefenseSessionAction } from '../../models/defense-session-actions-model';
import { EditDefenseSessionForm } from '../edit-defense-session-form';
import { defenseSessionDialogAtom } from './dialog-state';

export const AdminActions = reatomComponent(function AdminActions() {
  const { t } = useTranslation();
  const { onDeleted, onUpdated, sessionId } = defenseSessionDialogAtom();

  const { data, revalidate } = useQuery(defenseSessionDetailsQuery, sessionId ?? '');
  const session = data();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const isDeleting = deleteDefenseSessionAction.pending() > 0;

  const handleDelete = async () => {
    if (!sessionId) return;
    try {
      await wrap(deleteDefenseSessionAction(sessionId));
      setShowDeleteConfirm(false);
      defenseSessionDialogAtom.set((s) => ({ ...s, open: false }));
      onDeleted?.();
    } catch {
      toast.error(t('defense.session.toast.deleteError'));
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setShowEditModal(true)} disabled={!session}>
        <PencilIcon className="size-4" />
        {t('defense.session.detail.editButton')}
      </Button>

      <Button
        variant="outline"
        intent="destructive"
        onClick={() => setShowDeleteConfirm(true)}
        disabled={isDeleting || !session}
      >
        {isDeleting ? (
          <CircleNotchIcon className="animate-spin" />
        ) : (
          <>
            <TrashIcon className="size-4" />
            {t('defense.session.detail.deleteButton')}
          </>
        )}
      </Button>

      <ConfirmationModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={t('defense.session.detail.deleteConfirmTitle')}
        description={t('defense.session.detail.deleteConfirmDescription')}
        confirmLabel={t('defense.session.detail.deleteConfirmButton')}
        confirmVariant="solid"
        confirmIntent="destructive"
        isPending={isDeleting}
        onConfirm={handleDelete}
      />

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('defense.session.dialog.createTitle')}</DialogTitle>
            <DialogDescription>{t('defense.session.dialog.createDescription')}</DialogDescription>
          </DialogHeader>
          <EditDefenseSessionForm
            sessionId={sessionId ?? ''}
            onSuccess={() => {
              setShowEditModal(false);
              onUpdated?.();
              if (sessionId) revalidate();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}, 'AdminActions');
