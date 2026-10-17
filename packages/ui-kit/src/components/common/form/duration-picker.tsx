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
// Segment – a single YY / MM / DD spinner cell
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
  /** Moves focus to the previous (-1) or next (1) segment, when present. */
  onNavigate?: (direction: -1 | 1) => void;
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
  onNavigate,
  inputRef,
  'aria-invalid': ariaInvalid,
}: SegmentProps) {
  /** Digits being typed, or `null` when the committed value is displayed. */
  const [draft, setDraft] = React.useState<string | null>(null);
  const innerRef = React.useRef<HTMLInputElement>(null);
  /** Set before a programmatic step so the fresh value is selected again. */
  const reselectRef = React.useRef(false);

  const setRef = (node: HTMLInputElement | null) => {
    innerRef.current = node;
    if (typeof inputRef === 'function') inputRef(node);
    else if (inputRef) {
      (inputRef as React.MutableRefObject<HTMLInputElement | null>).current =
        node;
    }
  };

  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  const display = draft ?? pad(value, maxDigits);

  // Reset a pending draft when the value is driven externally (e.g. switching
  // timer type or unit set), so stale drafts never leak between fields. A
  // stepped value is re-selected so the next keystroke replaces it.
  React.useEffect(() => {
    setDraft(null);
    if (reselectRef.current) {
      reselectRef.current = false;
      innerRef.current?.select();
    }
  }, [value]);

  const commitDraft = (raw: string | null) => {
    if (raw === null) return;
    setDraft(null);
    onChange(raw === '' ? min : clamp(parseInt(raw, 10)));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, maxDigits);
    setDraft(digits);
  };

  const step = (delta: 1 | -1) => {
    setDraft(null);
    reselectRef.current = true;
    onChange(
      delta > 0
        ? value >= max
          ? min
          : value + 1
        : value <= min
          ? max
          : value - 1,
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      step(1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      step(-1);
    } else if (
      event.key === 'ArrowLeft' &&
      event.currentTarget.selectionStart === 0 &&
      onNavigate
    ) {
      event.preventDefault();
      onNavigate(-1);
    } else if (
      event.key === 'ArrowRight' &&
      event.currentTarget.selectionEnd === display.length &&
      onNavigate
    ) {
      event.preventDefault();
      onNavigate(1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      commitDraft(draft);
      innerRef.current?.blur();
    } else if (event.key === 'Escape') {
      setDraft(null);
    }
  };

  return (
    <input
      ref={setRef}
      type="text"
      inputMode="numeric"
      role="spinbutton"
      aria-label={label}
      aria-valuenow={
        draft !== null && draft !== '' ? clamp(parseInt(draft, 10)) : value
      }
      aria-valuemin={min}
      aria-valuemax={max}
      aria-invalid={ariaInvalid}
      disabled={disabled}
      value={display}
      data-slot="input-group-control"
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={(event) => {
        setDraft(null);
        event.target.select();
      }}
      onBlur={() => commitDraft(draft)}
      onWheel={(event) => {
        event.preventDefault();
        step(event.deltaY < 0 ? 1 : -1);
      }}
      style={{ width: `${maxDigits + 1}ch` }}
      className={cn(
        'ui:bg-transparent ui:text-center ui:text-sm ui:tabular-nums ui:outline-none ui:select-text',
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
  const segmentRefs = React.useRef<Array<HTMLInputElement | null>>([]);

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
      onClick={(event) => {
        // Only the padding outside a cell focuses the first segment; clicks
        // inside a cell keep the browser's own caret and selection.
        if (event.target === event.currentTarget) firstRef.current?.focus();
      }}
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
            inputRef={(node) => {
              segmentRefs.current[index] = node;
              if (index === 0) firstRef.current = node;
            }}
            value={components[unit]}
            min={0}
            max={maxFor(unit)}
            maxDigits={UNIT_DIGITS[unit]}
            label={labels?.[unit] ?? unit}
            disabled={disabled}
            aria-invalid={ariaInvalid}
            onChange={(next) => setUnit(unit, next)}
            onNavigate={(direction) => {
              segmentRefs.current[index + direction]?.focus();
            }}
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
