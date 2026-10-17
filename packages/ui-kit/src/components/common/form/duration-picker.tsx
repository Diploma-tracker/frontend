'use client';

import * as React from 'react';

import { parseDuration, serializeDuration } from '@repo/utils/duration';

import { cn } from '../../../lib/utils';

function pad(n: number, digits: number) {
  return String(n).padStart(digits, '0');
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DurationUnit = 'years' | 'months' | 'days' | 'hours' | 'minutes';

export interface DurationPickerLabels {
  years?: string;
  months?: string;
  days?: string;
  hours?: string;
  minutes?: string;
  /** Trailing hint shown after the segments, e.g. "hh:mm". */
  hint?: string;
}

export interface DurationPickerProps {
  /** ISO 8601 duration string, e.g. "PT1H30M" */
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  /**
   * Which segments to render, in order. Defaults to `['hours', 'minutes']`.
   */
  units?: DurationUnit[];
  /** Max hours allowed (default 23) */
  maxHours?: number;
  /** Max days allowed (default 999) */
  maxDays?: number;
  /** Translatable segment labels and trailing hint. */
  labels?: DurationPickerLabels;
  className?: string;
  id?: string;
  'aria-label'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
}

// ---------------------------------------------------------------------------
// Segment – a single DD / HH / MM spinner cell
// ---------------------------------------------------------------------------

interface SegmentProps {
  value: number;
  min?: number;
  max: number;
  maxDigits: number;
  label: string;
  disabled?: boolean;
  'aria-invalid'?: boolean | 'true' | 'false';
  onChange: (next: number) => void;
  inputRef?: React.Ref<HTMLInputElement>;
}

function Segment({
  value,
  min = 0,
  max,
  maxDigits,
  label,
  disabled,
  onChange,
  inputRef,
  'aria-invalid': ariaInvalid,
}: SegmentProps) {
  const [editing, setEditing] = React.useState<string | null>(null);

  const clamp = (n: number) => Math.max(min, Math.min(max, n));

  // Reset a pending edit when the value is driven externally (e.g. switching
  // timer type or unit set), so stale drafts never leak between fields.
  React.useEffect(() => {
    setEditing(null);
  }, [value, max, maxDigits]);

  const commit = (raw: string) => {
    const n = parseInt(raw, 10);
    if (!isNaN(n)) onChange(clamp(n));
    setEditing(null);
  };

  const step = (delta: number) => {
    setEditing(null);
    if (delta > 0) onChange(value >= max ? min : clamp(value + 1));
    else onChange(value <= min ? max : clamp(value - 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      step(1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      step(-1);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (editing !== null) commit(editing);
    } else if (e.key === 'Backspace') {
      setEditing((prev) => (prev && prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (/^\d$/.test(e.key)) {
      e.preventDefault();
      setEditing((prev) => {
        const next = prev === null ? e.key : (prev + e.key).slice(-maxDigits);
        const n = parseInt(next, 10);
        // auto-commit when the value is unambiguous
        if (next.length === maxDigits || n * 10 > max) {
          onChange(clamp(n));
          return null;
        }
        return next;
      });
    }
  };

  const displayValue = editing !== null ? editing : pad(value, maxDigits);

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      role="spinbutton"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-invalid={ariaInvalid}
      disabled={disabled}
      value={displayValue}
      data-slot="input-group-control"
      onChange={() => {}} // controlled via keydown
      onKeyDown={handleKeyDown}
      onFocus={() => {
        setEditing(null);
      }}
      onBlur={() => {
        if (editing !== null) commit(editing);
      }}
      onWheel={(e) => {
        e.preventDefault();
        step(e.deltaY < 0 ? 1 : -1);
      }}
      style={{ width: `${maxDigits + 1}ch` }}
      className={cn(
        'ui:bg-transparent ui:text-center ui:text-sm ui:tabular-nums ui:outline-none ui:select-none',
        'ui:disabled:cursor-not-allowed ui:disabled:opacity-50',
        'ui:rounded-sm ui:transition-colors',
        'ui:focus:bg-primary ui:focus:text-primary-foreground',
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// DurationPicker
// ---------------------------------------------------------------------------

const UNIT_MAX: Record<DurationUnit, number> = {
  years: 99,
  months: 99,
  days: 999,
  hours: 23,
  minutes: 59,
};

const UNIT_DIGITS: Record<DurationUnit, number> = {
  years: 2,
  months: 2,
  days: 3,
  hours: 2,
  minutes: 2,
};

export function DurationPicker({
  value,
  onChange,
  disabled = false,
  units = ['hours', 'minutes'],
  maxHours = 23,
  maxDays = 999,
  labels,
  className,
  id,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
}: DurationPickerProps) {
  const parsed = React.useMemo(() => {
    if (!value) return {};
    try {
      return parseDuration(value);
    } catch {
      return {};
    }
  }, [value]);
  const firstRef = React.useRef<HTMLInputElement>(null);

  const components: Record<DurationUnit, number> = {
    years: parsed.years ?? 0,
    months: parsed.months ?? 0,
    days: parsed.days ?? 0,
    hours: parsed.hours ?? 0,
    minutes: parsed.minutes ?? 0,
  };

  const maxFor = (unit: DurationUnit) => {
    if (unit === 'hours') return maxHours;
    if (unit === 'days') return maxDays;
    return UNIT_MAX[unit];
  };

  const setUnit = (unit: DurationUnit, next: number) => {
    const nextComponents = { ...components, [unit]: next };
    const serialized = {
      years: nextComponents.years || undefined,
      months: nextComponents.months || undefined,
      days: nextComponents.days || undefined,
      hours: nextComponents.hours || undefined,
      minutes: nextComponents.minutes || undefined,
    };
    const isEmpty =
      !nextComponents.years &&
      !nextComponents.months &&
      !nextComponents.days &&
      !nextComponents.hours &&
      !nextComponents.minutes;

    onChange?.(isEmpty ? 'PT0S' : serializeDuration(serialized));
  };

  return (
    <div
      id={id}
      data-slot="duration-picker"
      aria-label={ariaLabel}
      data-disabled={disabled || undefined}
      className={cn(
        'ui:group/input-group ui:relative ui:inline-flex ui:h-9 ui:items-center ui:rounded-md ui:border ui:border-input ui:bg-transparent ui:px-3 ui:shadow-xs ui:transition-[color,box-shadow]',
        'ui:has-[[data-slot=input-group-control]:focus]:border-ring ui:has-[[data-slot=input-group-control]:focus-visible]:border-ring',
        'ui:has-[[data-slot=input-group-control]:focus]:ring-[3px] ui:has-[[data-slot=input-group-control]:focus-visible]:ring-[3px]',
        'ui:has-[[data-slot=input-group-control]:focus]:ring-ring/50 ui:has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50',
        'ui:dark:bg-input/30',
        ariaInvalid === true || ariaInvalid === 'true'
          ? 'ui:border-destructive ui:ring-[3px] ui:ring-destructive/20 ui:dark:ring-destructive/40'
          : undefined,
        disabled && 'ui:cursor-not-allowed ui:opacity-50',
        className,
      )}
      onClick={() => firstRef.current?.focus()}
    >
      {units.map((unit, index) => (
        <React.Fragment key={unit}>
          {index > 0 && (
            <span
              className="ui:pointer-events-none ui:text-sm ui:font-medium ui:text-muted-foreground ui:tabular-nums ui:select-none"
              aria-hidden
            >
              :
            </span>
          )}
          <Segment
            inputRef={index === 0 ? firstRef : undefined}
            value={components[unit]}
            min={0}
            max={maxFor(unit)}
            maxDigits={UNIT_DIGITS[unit]}
            label={labels?.[unit] ?? unit}
            disabled={disabled}
            aria-invalid={ariaInvalid}
            onChange={(next) => setUnit(unit, next)}
          />
        </React.Fragment>
      ))}

      <span
        className="ui:pointer-events-none ui:ml-2 ui:text-sm ui:font-medium ui:text-muted-foreground ui:tabular-nums ui:select-none"
        aria-hidden
      >
        {labels?.hint ?? 'hh:mm'}
      </span>
    </div>
  );
}
