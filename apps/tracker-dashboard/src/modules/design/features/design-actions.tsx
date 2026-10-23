import { useState } from 'react';

import { ConfirmationModal } from '@/shared/components/confirmation-modal/confirmation-modal';
import { useTranslation } from '@/shared/utils/i18n';
import { FloppyDiskIcon, XIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/ui-kit/components/common/floating/tooltip';

export const DesignActions = reatomComponent(function DesignActions() {
  const { t } = useTranslation();
  const [isSaveConfirmationOpen, setIsSaveConfirmationOpen] = useState(false);
  const [isCancelConfirmationOpen, setIsCancelConfirmationOpen] =
    useState(false);

  return (
    <>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              intent="neutral"
              size="icon-sm"
              aria-label={t('design.actions.save')}
              onClick={() => setIsSaveConfirmationOpen(true)}
            >
              <FloppyDiskIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('design.actions.save')}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              intent="neutral"
              size="icon-sm"
              aria-label={t('design.actions.cancel')}
              onClick={() => setIsCancelConfirmationOpen(true)}
            >
              <XIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('design.actions.cancel')}</TooltipContent>
        </Tooltip>
      </div>
      <ConfirmationModal
        open={isSaveConfirmationOpen}
        onOpenChange={setIsSaveConfirmationOpen}
        title={t('common.confirm.saveTitle')}
        description={t('common.confirm.saveDescription')}
        confirmLabel={t('design.actions.save')}
        onConfirm={() => setIsSaveConfirmationOpen(false)}
      />
      <ConfirmationModal
        open={isCancelConfirmationOpen}
        onOpenChange={setIsCancelConfirmationOpen}
        title={t('common.confirm.discardTitle')}
        description={t('common.confirm.discardDescription')}
        confirmLabel={t('design.actions.cancel')}
        confirmIntent="destructive"
        onConfirm={() => setIsCancelConfirmationOpen(false)}
      />
    </>
  );
});
