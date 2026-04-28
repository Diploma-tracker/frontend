'use client';

import { useRef, useState } from 'react';
import type { ReactNode } from 'react';

import FullCalendar from '@fullcalendar/react';

import { WeekCalendarContext, type WeekView } from './context';
import { formatWeekTitle, getMondayOfWeek, getWeekEnd } from './utils';

interface WeekCalendarRootProps {
  children: ReactNode;
  defaultView?: WeekView;
}

export function WeekCalendarRoot({ children, defaultView = 'work' }: WeekCalendarRootProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const initialMonday = getMondayOfWeek(new Date());

  const [weekView, setWeekView] = useState<WeekView>(defaultView);
  const [title, setTitle] = useState(() => formatWeekTitle(initialMonday, defaultView));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [weekRange, setWeekRange] = useState(() => ({
    from: initialMonday,
    to: getWeekEnd(initialMonday, defaultView),
  }));
  const [isInteractive, setIsInteractive] = useState(true);

  const syncWeek = (monday: Date, view: WeekView = weekView) => {
    setTitle(formatWeekTitle(monday, view));
    setWeekRange({ from: monday, to: getWeekEnd(monday, view) });
  };

  const currentMonday = (): Date => {
    const api = calendarRef.current?.getApi();
    return api ? getMondayOfWeek(api.view.currentStart) : getMondayOfWeek(new Date());
  };

  const handlePrev = () => {
    calendarRef.current?.getApi().prev();
    syncWeek(currentMonday());
  };

  const handleNext = () => {
    calendarRef.current?.getApi().next();
    syncWeek(currentMonday());
  };

  const handleToday = () => {
    calendarRef.current?.getApi().today();
    syncWeek(getMondayOfWeek(new Date()));
  };

  const handleViewChange = (value: string) => {
    if (!value) return;
    const view = value as WeekView;
    setWeekView(view);
    calendarRef.current?.getApi().setOption('weekends', view === 'full');
    syncWeek(currentMonday(), view);
  };

  const handleDayClick = (day: Date) => {
    const monday = getMondayOfWeek(day);
    syncWeek(monday);
    calendarRef.current?.getApi().gotoDate(monday);
    setPickerOpen(false);
  };

  return (
    <WeekCalendarContext.Provider
      value={{
        calendarRef,
        title,
        weekView,
        weekRange,
        pickerOpen,
        setPickerOpen,
        setWeekRange,
        handlePrev,
        handleNext,
        handleToday,
        handleViewChange,
        handleDayClick,
        isInteractive,
        setIsInteractive,
      }}
    >
      {children}
    </WeekCalendarContext.Provider>
  );
}
