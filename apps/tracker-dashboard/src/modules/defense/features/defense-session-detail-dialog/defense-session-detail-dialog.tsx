import { roleBasedComponent } from '@/modules/auth';
import { DetailsModal } from '@/shared/components';
import { useQuery } from '@/shared/model/query';
import { useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';

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

export const DefenseSessionDetailDialog = reatomComponent(
  function DefenseSessionDetailDialog() {
    const { t } = useTranslation();
    const { open, sessionId } = defenseSessionDialogAtom();

    const { data, status } = useQuery(
      defenseSessionDetailsQuery,
      sessionId ?? '',
    );
    const session = data();
    const isFetching = status() === 'loading';

    const participants = session?.participants ?? [];

    const handleOpenChange = (next: boolean) => {
      defenseSessionDialogAtom.set((s) => ({ ...s, open: next }));
    };

    return (
      <DetailsModal
        open={open}
        onOpenChange={handleOpenChange}
        title={t('defense.session.detail.title')}
        description={
          session
            ? t('defense.session.detail.subtitle', {
                participants: participants.length,
                capacity: session.capacity,
              })
            : undefined
        }
        footer={<RoleActions />}
      >
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
      </DetailsModal>
    );
  },
);
