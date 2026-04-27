import { useTranslation } from 'react-i18next';

import { ToggleGroup, ToggleGroupItem } from '@repo/ui-kit/components/toggle-group';

import { useWeekCalendar } from './context';

export function WeekCalendarViewToggle() {
  const { t } = useTranslation();
  const { weekView, handleViewChange } = useWeekCalendar();

  return (
    <ToggleGroup type="single" variant="outline" value={weekView} onValueChange={handleViewChange}>
      <ToggleGroupItem value="work" aria-label={t('schedule.toolbar.workWeek')}>
        {t('schedule.toolbar.workWeek')}
      </ToggleGroupItem>
      <ToggleGroupItem value="full" aria-label={t('schedule.toolbar.fullWeek')}>
        {t('schedule.toolbar.fullWeek')}
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
