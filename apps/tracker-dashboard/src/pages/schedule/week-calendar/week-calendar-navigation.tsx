import { useTranslation } from 'react-i18next';

import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';

import { useWeekCalendar } from './context';

export function WeekCalendarNavigation() {
  const { t } = useTranslation();
  const { handlePrev, handleNext, handleToday } = useWeekCalendar();

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon-sm" onClick={handlePrev} aria-label="Previous week">
        <CaretLeftIcon />
      </Button>
      <Button variant="outline" size="icon-sm" onClick={handleNext} aria-label="Next week">
        <CaretRightIcon />
      </Button>
      <Button variant="outline" size="sm" onClick={handleToday}>
        {t('schedule.toolbar.today')}
      </Button>
    </div>
  );
}
