import { useState } from 'react';

import { ConfirmationModal } from '@/shared/components';

import { DEFAULT_MODAL_PARAMS } from './constants';
import type { Action } from './types';
import { actionToButton } from './utils';

interface ActionConfirmationModalProps<TData> {
  action: Action<TData>;
  state: TData;
  open: boolean;
  onOpenChange: (value: boolean) => void;
}

export const ActionConfirmationModal = <TData,>({
  action,
  state,
  open,
  onOpenChange,
}: ActionConfirmationModalProps<TData>) => {
  const modal = { ...DEFAULT_MODAL_PARAMS, ...action.modal };
  const [isPending, setIsPending] = useState(false);

  const handleConfirm = async () => {
    if (!modal?.enablePendingState) {
      await action.action?.(state);
      onOpenChange(false);
      return;
    }
    setIsPending(true);
    await action.action?.(state);
    setIsPending(false);
    onOpenChange(false);
  };

  const handleOpenChange = (value: boolean) => {
    if (!isPending) onOpenChange(value);
  };

  const confirmButtonVariant = actionToButton(action.variant, false);

  return (
    <ConfirmationModal
      open={open}
      onOpenChange={handleOpenChange}
      isPending={isPending}
      onConfirm={handleConfirm}
      title={modal?.title}
      description={modal?.description}
      confirmLabel={modal?.confirmLabel}
      cancelLabel={modal?.cancelLabel}
      confirmVariant={confirmButtonVariant.variant}
      confirmIntent={confirmButtonVariant.intent}
    />
  );
};
