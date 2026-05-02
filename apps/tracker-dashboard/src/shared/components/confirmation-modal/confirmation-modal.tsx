import type { ReactNode } from 'react';

import { useTranslation } from '@/shared/utils/i18n';

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
  confirmIntent?: React.ComponentProps<typeof Button>['intent'];
  isPending?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const ConfirmationModal = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  confirmVariant = 'default',
  confirmIntent = 'primary',
  isPending = false,
  onConfirm,
  onCancel,
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
          <AlertDialogCancel onClick={onCancel} disabled={isPending}>
            {cancelLabel ?? t('common.confirm.cancel')}
          </AlertDialogCancel>
          <Button variant={confirmVariant} intent={confirmIntent} disabled={isPending} onClick={onConfirm}>
            {confirmLabel ?? t('common.confirm.proceed')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
