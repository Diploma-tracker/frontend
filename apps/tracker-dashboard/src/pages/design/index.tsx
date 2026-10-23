import { useState } from 'react';

import { PageLayout } from '@/layouts/page-layout/page-layout';
import { DesignPage, discardFormDraft, saveFormDraft } from '@/modules/design';
import { ConfirmationModal } from '@/shared/components/confirmation-modal/confirmation-modal';
import { useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';
import { useBlocker } from '@tanstack/react-router';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/ui-kit/components/common/floating/alert-dialog';

type LeaveFormDecision = 'save' | 'discard';

export const DesignPageRoute = reatomComponent(function DesignPageRoute() {
  const [pendingDecision, setPendingDecision] =
    useState<LeaveFormDecision | null>(null);
  const { t } = useTranslation();
  const blocker = useBlocker({
    shouldBlockFn: () => true,
    withResolver: true,
    enableBeforeUnload: false,
  });
  const isBlocked = blocker.status === 'blocked';
  const isChoosingLeaveAction = isBlocked && pendingDecision === null;
  const isConfirmingLeaveAction = isBlocked && pendingDecision !== null;

  const handleLeaveAlertOpenChange = (open: boolean) => {
    if (!open && blocker.status === 'blocked' && pendingDecision === null) {
      blocker.reset();
    }
  };

  const handleConfirmationOpenChange = (open: boolean) => {
    if (!open) setPendingDecision(null);
  };

  const handleConfirmLeave = () => {
    if (blocker.status !== 'blocked' || !pendingDecision) return;

    if (pendingDecision === 'save') {
      saveFormDraft();
    } else {
      discardFormDraft();
    }

    setPendingDecision(null);
    blocker.proceed();
  };

  return (
    <>
      <PageLayout height="screen" bleed>
        <DesignPage />
      </PageLayout>
      <AlertDialog
        open={isChoosingLeaveAction}
        onOpenChange={handleLeaveAlertOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('design.formLeave.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('design.formLeave.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button type="button" onClick={() => setPendingDecision('save')}>
              {t('design.formLeave.saveAndLeave')}
            </Button>
            <Button
              type="button"
              variant="solid"
              intent="destructive"
              onClick={() => setPendingDecision('discard')}
            >
              {t('design.formLeave.discardAndLeave')}
            </Button>
            <AlertDialogCancel>{t('common.confirm.cancel')}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ConfirmationModal
        open={isConfirmingLeaveAction}
        onOpenChange={handleConfirmationOpenChange}
        title={
          pendingDecision === 'save'
            ? t('design.formLeave.confirmSaveTitle')
            : t('design.formLeave.confirmDiscardTitle')
        }
        description={
          pendingDecision === 'save'
            ? t('design.formLeave.confirmSaveDescription')
            : t('design.formLeave.confirmDiscardDescription')
        }
        confirmLabel={
          pendingDecision === 'save'
            ? t('design.formLeave.saveAndLeave')
            : t('design.formLeave.discardAndLeave')
        }
        confirmVariant="solid"
        confirmIntent={
          pendingDecision === 'discard' ? 'destructive' : 'primary'
        }
        onConfirm={handleConfirmLeave}
      />
    </>
  );
});

export const DesignPageComponent = DesignPageRoute;
