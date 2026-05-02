import { roleBasedComponent } from '@/modules/auth';
import { useQuery } from '@/shared/model/query';
import { useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui-kit/components/common/floating/dialog';
import { Spinner } from '@repo/ui-kit/components/common/states/spinner';

import { defenseSessionDetailsQuery } from '../../models';
import { AdminActions } from './admin-actions';
import { defenseSessionDialogAtom } from './dialog-state';
import { MainContent } from './main-content';
import { SideContent } from './side-content';
import { StudentActions } from './student-actions';

const RoleActions = roleBasedComponent({
  student: StudentActions,
  admin: AdminActions,
});

export const DefenseSessionDetailDialog = reatomComponent(function DefenseSessionDetailDialog() {
  const { t } = useTranslation();
  const { open, sessionId } = defenseSessionDialogAtom();

  const { data, status } = useQuery(defenseSessionDetailsQuery, sessionId ?? '');
  const session = data();
  const isFetching = status() === 'loading';

  const participants = session?.participants ?? [];

  const handleOpenChange = (next: boolean) => {
    defenseSessionDialogAtom.set((s) => ({ ...s, open: next }));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('defense.session.detail.title')}</DialogTitle>
          {session && (
            <DialogDescription>
              {t('defense.session.detail.subtitle', {
                participants: participants.length,
                capacity: session.capacity,
              })}
            </DialogDescription>
          )}
        </DialogHeader>

        {isFetching || !session ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-8 text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-[1fr_260px]">
            <MainContent sessionId={session.id} />
            <SideContent sessionId={session.id} />
          </div>
        )}

        <DialogFooter>
          <RoleActions />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
