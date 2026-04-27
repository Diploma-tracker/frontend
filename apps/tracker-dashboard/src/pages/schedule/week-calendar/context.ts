import { createContext, useContext } from 'react';
import type { RefObject } from 'react';

import type FullCalendar from '@fullcalendar/react';

export type WeekView = 'work' | 'full';

export type WeekCalendarContextValue = {
  calendarRef: RefObject<FullCalendar | null>;
  title: string;
  weekView: WeekView;
  weekRange: { from: Date; to: Date };
  pickerOpen: boolean;
  setPickerOpen: (open: boolean) => void;
  setWeekRange: (range: { from: Date; to: Date }) => void;
  handlePrev: () => void;
  handleNext: () => void;
  handleToday: () => void;
  handleViewChange: (value: string) => void;
  handleDayClick: (day: Date) => void;
};

export const WeekCalendarContext = createContext<WeekCalendarContextValue | null>(null);

export function useWeekCalendar(): WeekCalendarContextValue {
  const ctx = useContext(WeekCalendarContext);
  if (!ctx) throw new Error('useWeekCalendar must be used inside <WeekCalendar>');
  return ctx;
}
