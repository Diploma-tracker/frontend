'use client';

// TODO: refactor and fix issue with input switching and i18n
import * as React from 'react';

import { formatISODuration, parseISODurationComponents } from '../../../lib/iso-duration';
import { cn } from '../../../lib/utils';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DurationPickerProps {
  /** ISO 8601 duration string, e.g. "PT1H30M" */
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  /** Max hours allowed (default 23) */
  maxHours?: number;
  className?: string;
  id?: string;
  'aria-label'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
}

// ---------------------------------------------------------------------------
// Segment – a single HH or MM spinner cell
// ---------------------------------------------------------------------------

interface SegmentProps {
  value: number;
  min?: number;
  max: number;
  label: string;
  disabled?: boolean;
  'aria-invalid'?: boolean | 'true' | 'false';
  onChange: (next: number) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  focused?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
}

function Segment({
  value,
  min = 0,
  max,
  label,
  disabled,
  onChange,
  onFocus,
  onBlur,
  focused,
  inputRef,
  'aria-invalid': ariaInvalid,
}: SegmentProps) {
  const [editing, setEditing] = React.useState<string | null>(null);

  const clamp = (n: number) => Math.max(min, Math.min(max, n));

  const commit = (raw: string) => {
    const n = parseInt(raw, 10);
    if (!isNaN(n)) onChange(clamp(n));
    setEditing(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(value >= max ? min : clamp(value + 1));
      setEditing(null);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(value <= min ? max : clamp(value - 1));
      setEditing(null);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (editing !== null) commit(editing);
    } else if (e.key === 'Backspace') {
      setEditing((prev) => (prev && prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (/^\d$/.test(e.key)) {
      e.preventDefault();
      setEditing((prev) => {
        const next = prev === null ? e.key : (prev + e.key).slice(-2);
        const n = parseInt(next, 10);
        // auto-commit when the value is unambiguous
        if (next.length === 2 || n * 10 > max) {
          onChange(clamp(n));
          return null;
        }
        return next;
      });
    }
  };

  const displayValue = editing !== null ? editing.padStart(2, '0') : pad(value);

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
      data-focused={focused || undefined}
      onChange={() => {}} // controlled via keydown
      onKeyDown={handleKeyDown}
      onFocus={() => {
        setEditing(null);
        onFocus?.();
      }}
      onBlur={() => {
        if (editing !== null) commit(editing);
        onBlur?.();
      }}
      onWheel={(e) => {
        e.preventDefault();
        onChange(e.deltaY < 0 ? (value >= max ? min : clamp(value + 1)) : value <= min ? max : clamp(value - 1));
      }}
      className={cn(
        'ui:w-8 ui:bg-transparent ui:text-center ui:text-sm ui:tabular-nums ui:outline-none ui:select-none',
        'ui:disabled:cursor-not-allowed ui:disabled:opacity-50',
        'ui:rounded-sm ui:transition-colors',
        'ui:focus:bg-primary ui:focus:text-primary-foreground'
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// DurationPicker
// ---------------------------------------------------------------------------

export function DurationPicker({
  value = 'PT0M',
  onChange,
  disabled = false,
  maxHours = 23,
  className,
  id,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
}: DurationPickerProps) {
  const { hours, minutes } = parseISODurationComponents(value);
  const hoursRef = React.useRef<HTMLInputElement>(null);

  const setHours = (h: number) => onChange?.(formatISODuration(h, minutes));
  const setMinutes = (m: number) => onChange?.(formatISODuration(hours, m));

  const isInvalid = ariaInvalid === true || ariaInvalid === 'true';

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
        isInvalid && 'ui:border-destructive ui:ring-[3px] ui:ring-destructive/20 ui:dark:ring-destructive/40',
        disabled && 'ui:cursor-not-allowed ui:opacity-50',
        className
      )}
      onClick={() => hoursRef.current?.focus()}
    >
      {/* Hours */}
      <Segment
        inputRef={hoursRef}
        value={hours}
        min={0}
        max={maxHours}
        label="Hours"
        disabled={disabled}
        aria-invalid={ariaInvalid}
        onChange={setHours}
      />

      {/* Colon separator */}
      <span
        className="ui:pointer-events-none ui:text-sm ui:font-medium ui:text-muted-foreground ui:tabular-nums ui:select-none"
        aria-hidden
      >
        :
      </span>

      {/* Minutes */}
      <Segment
        value={minutes}
        min={0}
        max={59}
        label="Minutes"
        disabled={disabled}
        aria-invalid={ariaInvalid}
        onChange={setMinutes}
      />

      {/* Unit label */}
      <span className="ui:pointer-events-none ui:ml-2 ui:text-xs ui:text-muted-foreground ui:select-none">hh:mm</span>
    </div>
  );
}
