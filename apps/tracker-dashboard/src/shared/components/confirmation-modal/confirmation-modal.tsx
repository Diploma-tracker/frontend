import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

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

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  confirmVariant?: React.ComponentProps<typeof Button>['variant'];
  isPending?: boolean;
  onConfirm: () => void;
}

export const ConfirmationModal = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  confirmVariant = 'default',
  isPending = false,
  onConfirm,
}: ConfirmationModalProps) => {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{cancelLabel ?? t('common.confirm.cancel')}</AlertDialogCancel>
          <Button variant={confirmVariant} disabled={isPending} onClick={onConfirm}>
            {confirmLabel ?? t('common.confirm.proceed')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
