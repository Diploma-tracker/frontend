import { useState } from 'react';

import { PageLayout } from '@/layouts';
import { Guard, permissions } from '@/modules/auth';
import { CreateDefenseSessionForm, RoundDefenseSessions, roundDefenseSessionsAtom } from '@/modules/defense';
import { useTranslation } from '@/shared/utils/i18n';
import { PlusIcon } from '@phosphor-icons/react';
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

import '@/shared/components/week-calendar/schedule.css';

interface RoundDefenseSchedulePageProps {
  roundId: string;
}

function ceilToHalfHour(date: Date): Date {
  const ms = date.getTime();
  const halfHour = 30 * 60 * 1000;
  return new Date(Math.ceil(ms / halfHour) * halfHour);
}

export const RoundDefenseSchedulePage = reatomComponent(function RoundDefenseSchedulePage({
  roundId,
}: RoundDefenseSchedulePageProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const openDialog = (date: Date) => {
    setSelectedDate(date);
    setOpen(true);
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) setSelectedDate(undefined);
  };

  const refreshSessions = () => {
    wrap(roundDefenseSessionsAtom(roundId));
  };

  return (
    <PageLayout height="screen">
      <Guard can={permissions.isAdmin}>
        <Button
          size="icon-lg"
          className="fixed right-6 bottom-6 z-50 size-14 rounded-full shadow-lg"
          aria-label={t('defense.session.dialog.createAriaLabel')}
          onClick={() => openDialog(ceilToHalfHour(new Date()))}
        >
          <PlusIcon className="size-6" />
        </Button>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('defense.session.dialog.createTitle')}</DialogTitle>
              <DialogDescription>{t('defense.session.dialog.createDescription')}</DialogDescription>
            </DialogHeader>
            <CreateDefenseSessionForm
              roundId={roundId}
              initialDate={selectedDate}
              onSuccess={() => handleOpenChange(false)}
            />
          </DialogContent>
        </Dialog>
      </Guard>

      <RoundDefenseSessions
        roundId={roundId}
        onDateClick={openDialog}
        onEventChange={refreshSessions}
        onEventDelete={refreshSessions}
      />
    </PageLayout>
  );
}, 'RoundDefenseSchedulePage');
