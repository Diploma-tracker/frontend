import { WeekCalendarGrid } from './week-calendar-grid';
import { WeekCalendarNavigation } from './week-calendar-navigation';
import { WeekCalendarRoot } from './week-calendar-root';
import { WeekCalendarTitle } from './week-calendar-title';
import { WeekCalendarViewToggle } from './week-calendar-view-toggle';

export { useWeekCalendar } from './context';
export type { WeekView } from './context';

export const WeekCalendar = {
  Root: WeekCalendarRoot,
  Grid: WeekCalendarGrid,
  Title: WeekCalendarTitle,
  ViewToggle: WeekCalendarViewToggle,
  Navigation: WeekCalendarNavigation,
};
