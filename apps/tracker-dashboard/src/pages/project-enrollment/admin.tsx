import { useState } from 'react';

import { PageLayout } from '@/layouts';
import {
  AllocationRoundsFilters,
  AllocationRoundsPagination,
  AllocationsListTable,
  CreateAllocationRoundForm,
} from '@/modules/project-enrollment';
import { useTranslation } from '@/shared/utils/i18n';
import { PlusIcon } from '@phosphor-icons/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui-kit/components/common/floating/dialog';

export const ProjectEnrollmentAdminPage = () => {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);

  return (
    <PageLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5 border-b pb-5">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('projectEnrollment.listPages.admin.title')}
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            {t('projectEnrollment.listPages.admin.description')}
          </p>
        </div>

        <AllocationRoundsFilters />
        <AllocationsListTable />
        <AllocationRoundsPagination />
      </div>

      {/* Floating Action Button */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="solid"
            intent="primary"
            size="icon-lg"
            className="fixed right-6 bottom-6 z-50 size-14 rounded-full shadow-lg"
            aria-label={t(
              'projectEnrollment.allocationRound.dialog.createAriaLabel',
            )}
          >
            <PlusIcon className="size-6" />
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('projectEnrollment.allocationRound.dialog.createTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('projectEnrollment.allocationRound.dialog.createDescription')}
            </DialogDescription>
          </DialogHeader>

          <CreateAllocationRoundForm
            onSuccess={() => {
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};
