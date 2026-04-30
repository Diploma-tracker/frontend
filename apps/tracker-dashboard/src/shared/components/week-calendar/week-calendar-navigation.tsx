import { useTranslation } from '@/shared/utils/i18n';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';

import { useWeekCalendar } from './context';

export function WeekCalendarNavigation() {
  const { t } = useTranslation();
  const { handlePrev, handleNext, handleToday, isInteractive } = useWeekCalendar();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={handlePrev}
        aria-label="Previous week"
        disabled={!isInteractive}
      >
        <CaretLeftIcon />
      </Button>
      <Button variant="outline" size="icon-sm" onClick={handleNext} aria-label="Next week" disabled={!isInteractive}>
        <CaretRightIcon />
      </Button>
      <Button variant="outline" size="sm" onClick={handleToday} disabled={!isInteractive}>
        {t('schedule.toolbar.today')}
      </Button>
    </div>
  );
}
