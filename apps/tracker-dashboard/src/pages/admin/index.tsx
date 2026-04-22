import { useState } from 'react';

import { PageLayout } from '@/layouts';
import {
  CreateAllocationRoundForm,
  AllocationRoundsFilters,
  AllocationRoundsPagination,
  AllocationsListTable,
} from '@/modules/project-enrollment';
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

export const AdminPage = () => {
  const [open, setOpen] = useState(false);

  return (
    <PageLayout>
      <div className="flex flex-col gap-4">
        <AllocationRoundsFilters />
        <AllocationsListTable />
        <AllocationRoundsPagination />
      </div>

      {/* Floating Action Button */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size="icon-lg"
            className="fixed right-6 bottom-6 z-50 size-14 rounded-full shadow-lg"
            aria-label="Create allocation round"
          >
            <PlusIcon className="size-6" />
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Allocation Round</DialogTitle>
            <DialogDescription>Fill in the details to create a new allocation round.</DialogDescription>
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
