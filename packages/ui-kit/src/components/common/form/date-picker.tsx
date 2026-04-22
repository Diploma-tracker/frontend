import * as React from 'react';

import { CalendarIcon, ClockIcon, XIcon } from '@phosphor-icons/react';
import { format } from 'date-fns';

import { cn } from '../../../lib/utils';
import { Calendar } from '../../calendar';
import { Button } from '../data-display/button';
import { Popover, PopoverContent, PopoverTrigger } from '../floating/popover';
import { Input } from './input';

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  mode?: 'date' | 'datetime';
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  formatString?: string;
  className?: string;
  clearable?: boolean;
  'aria-label'?: string;
  'aria-invalid'?: boolean;
  id?: string;
}

interface TimeState {
  hours: number;
  minutes: number;
}

interface DatePickerTriggerContentProps {
  value?: Date;
  placeholder: string;
  mode: 'date' | 'datetime';
  displayFormat: string;
  clearable: boolean;
  disabled: boolean;
  onClear: () => void;
}

function DatePickerTriggerContent({
  value,
  placeholder,
  mode,
  displayFormat,
  clearable,
  disabled,
  onClear,
}: DatePickerTriggerContentProps) {
  const handleClear = (e: React.PointerEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClear();
  };

  const renderIcon = () => {
    if (clearable && value && !disabled) {
      return (
        <span role="button" className="ui:cursor-pointer" aria-label="Clear date" onClick={handleClear}>
          <XIcon className="ui:size-4 ui:opacity-50 ui:hover:opacity-100" />
        </span>
      );
    }
    const modeToIcon = {
      datetime: <ClockIcon className="ui:size-4 ui:opacity-50" />,
      date: <CalendarIcon className="ui:size-4 ui:opacity-50" />,
    };
    return modeToIcon[mode];
  };
  return (
    <>
      {value ? (
        <span className="ui:flex-1 ui:truncate">{format(value, displayFormat)}</span>
      ) : (
        <span>{placeholder}</span>
      )}
      <div className="ui:flex ui:items-center ui:gap-1">{renderIcon()}</div>
    </>
  );
}

interface DatePickerCalendarProps {
  value?: Date;
  minDate?: Date;
  maxDate?: Date;
  onSelect: (date: Date | undefined) => void;
}

function DatePickerCalendar({ value, minDate, maxDate, onSelect }: DatePickerCalendarProps) {
  const isDisabled = React.useCallback(
    (date: Date) => {
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return false;
    },
    [minDate, maxDate]
  );

  return (
    <Calendar
      mode="single"
      className="ui:p-3"
      selected={value}
      onSelect={onSelect}
      defaultMonth={value}
      disabled={minDate || maxDate ? isDisabled : undefined}
      initialFocus
    />
  );
}

interface DatePickerTimeSelectorProps {
  time: TimeState;
  onTimeChange: (type: 'hours' | 'minutes', value: string) => void;
}

function DatePickerTimeSelector({ time, onTimeChange }: DatePickerTimeSelectorProps) {
  return (
    <div className="ui:w-full ui:border-t ui:pt-3">
      <div className="ui:flex ui:items-start ui:gap-2">
        <div className="ui:flex-1">
          <Input
            type="number"
            min="0"
            max="23"
            value={time.hours.toString().padStart(2, '0')}
            onChange={(e) => onTimeChange('hours', e.target.value)}
            className="ui:text-center"
            aria-label="Hours"
          />
          <span className="ui:mt-1 ui:block ui:text-center ui:text-xs ui:text-muted-foreground">Hours</span>
        </div>

        <div className="ui:flex-1">
          <Input
            type="number"
            min="0"
            max="59"
            value={time.minutes.toString().padStart(2, '0')}
            onChange={(e) => onTimeChange('minutes', e.target.value)}
            className="ui:text-center"
            aria-label="Minutes"
          />
          <span className="ui:mt-1 ui:block ui:text-center ui:text-xs ui:text-muted-foreground">Minutes</span>
        </div>
      </div>
    </div>
  );
}

export function DatePicker({
  value,
  onChange,
  mode = 'date',
  placeholder = 'Pick a date',
  disabled = false,
  minDate,
  maxDate,
  formatString,
  className,
  clearable = true,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
  id,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const [time, setTime] = React.useState<TimeState>({
    hours: value?.getHours() ?? 12,
    minutes: value?.getMinutes() ?? 0,
  });

  const displayFormat = formatString ?? (mode === 'datetime' ? 'PPP p' : 'PPP');

  React.useEffect(() => {
    if (value) {
      setTime({ hours: value.getHours(), minutes: value.getMinutes() });
    }
  }, [value]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange?.(undefined);
      if (mode === 'date') setOpen(false);
      return;
    }

    if (mode === 'datetime') {
      const next = new Date(selectedDate);
      next.setHours(time.hours, time.minutes);
      onChange?.(next);
    } else {
      onChange?.(selectedDate);
      setOpen(false);
    }
  };

  const handleTimeChange = (type: 'hours' | 'minutes', raw: string) => {
    const n = parseInt(raw, 10);
    if (isNaN(n)) return;

    const clamped = type === 'hours' ? Math.min(23, Math.max(0, n)) : Math.min(59, Math.max(0, n));
    const next = { ...time, [type]: clamped };
    setTime(next);

    if (value) {
      const nextDate = new Date(value);
      nextDate.setHours(next.hours, next.minutes);
      onChange?.(nextDate);
    }
  };

  const handleClear = () => {
    onChange?.(undefined);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          data-empty={!value}
          aria-label={ariaLabel}
          aria-invalid={ariaInvalid}
          className={cn(
            'ui:w-full ui:justify-between ui:text-left ui:font-normal ui:data-[empty=true]:text-muted-foreground',
            className
          )}
        >
          <DatePickerTriggerContent
            value={value}
            placeholder={placeholder}
            mode={mode}
            displayFormat={displayFormat}
            clearable={clearable}
            disabled={disabled}
            onClear={handleClear}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="ui:flex ui:w-auto ui:flex-col" align="center">
        <div className="ui:flex ui:justify-center">
          <DatePickerCalendar value={value} minDate={minDate} maxDate={maxDate} onSelect={handleDateSelect} />
        </div>
        {mode === 'datetime' && <DatePickerTimeSelector time={time} onTimeChange={handleTimeChange} />}
      </PopoverContent>
    </Popover>
  );
}
