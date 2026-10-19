import { type ReactNode, useEffect, useState } from 'react';

import { getLocale } from '@/shared/utils/format-date';
import { k, useTranslation } from '@/shared/utils/i18n';
import {
  ArrowsClockwiseIcon,
  CalendarBlankIcon,
  ClockClockwiseIcon,
  CodeIcon,
  TimerIcon,
} from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { DatePicker } from '@repo/ui-kit/components/common/form/date-picker';
import { DurationPicker } from '@repo/ui-kit/components/common/form/duration-picker';
import {
  Field,
  FieldError,
  FieldLabel,
} from '@repo/ui-kit/components/common/form/field';
import { Input } from '@repo/ui-kit/components/common/form/input';
import { Switch } from '@repo/ui-kit/components/common/form/switch';

import { setSelectedTimerValue } from '../../model/actions/events';
import type { EventInfo } from '../../model/definitions/element-definitions';
import type { TimerType } from '../../model/definitions/event-definitions';
import {
  EMPTY_CYCLE,
  TIMER_PRESETS,
  type TimerMode,
  detectTimerField,
  detectTimerMode,
  isCronExpression,
  parseCycle,
  parseDurationComponents,
  serializeCycle,
} from '../../model/definitions/timer-definitions';

export interface TimerFieldProps {
  selected: EventInfo;
}

const MODE_LABEL_KEY: Record<TimerMode, string> = {
  relative: k('bpmnEditor.inspector.timerModes.relative'),
  absolute: k('bpmnEditor.inspector.timerModes.absolute'),
  cycle: k('bpmnEditor.inspector.timerModes.cycle'),
  cron: k('bpmnEditor.inspector.timerModes.cron'),
  iso: k('bpmnEditor.inspector.timerModes.iso'),
};

const PRESET_LABEL_KEY: Record<string, string> = {
  m5: k('bpmnEditor.inspector.timerPresets.m5'),
  m15: k('bpmnEditor.inspector.timerPresets.m15'),
  h1: k('bpmnEditor.inspector.timerPresets.h1'),
  d1: k('bpmnEditor.inspector.timerPresets.d1'),
};

const MODES: Array<{ mode: TimerMode; icon: ReactNode }> = [
  { mode: 'relative', icon: <TimerIcon className="size-3.5" /> },
  { mode: 'absolute', icon: <CalendarBlankIcon className="size-3.5" /> },
  { mode: 'cycle', icon: <ArrowsClockwiseIcon className="size-3.5" /> },
  { mode: 'cron', icon: <ClockClockwiseIcon className="size-3.5" /> },
  { mode: 'iso', icon: <CodeIcon className="size-3.5" /> },
];

const parseDateValue = (raw: string | undefined): Date | undefined => {
  if (!raw) return undefined;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

/**
 * Editor for a selected `bpmn:TimerEventDefinition`. The mode strip doubles as
 * the indicator of the active timer type; every mode serializes back to the
 * matching ISO 8601 value (or a cron expression stored on `timeCycle`).
 */
export const TimerField = reatomComponent(function TimerField({
  selected,
}: TimerFieldProps) {
  const { t } = useTranslation();
  const locale = getLocale();

  const rawValue = selected.timerValue ?? '';
  const field = selected.timerType;
  const storedIsCron = isCronExpression(rawValue);
  const activeMode = field ? detectTimerMode(field, rawValue) : null;

  const [mode, setMode] = useState<TimerMode>(() =>
    detectTimerMode(selected.timerType, rawValue),
  );
  const [isoDraft, setIsoDraft] = useState<string | null>(null);
  const [cronDraft, setCronDraft] = useState<string | null>(null);

  useEffect(() => {
    setMode(detectTimerMode(selected.timerType, selected.timerValue ?? ''));
    setIsoDraft(null);
    setCronDraft(null);
    // Only re-sync when a different element is selected.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.id]);

  const write = (type: TimerType, next: string) => {
    if (next !== rawValue || selected.timerType !== type) {
      setSelectedTimerValue(type, next);
    }
  };

  const storedAsCycle = field === 'cycle' && !storedIsCron;
  const cycle = storedAsCycle ? parseCycle(rawValue) : EMPTY_CYCLE;
  const updateCycle = (patch: Partial<typeof cycle>) =>
    write('cycle', serializeCycle({ ...cycle, ...patch }));

  const timeLabels = {
    hours: t('common.datePicker.hours'),
    minutes: t('common.datePicker.minutes'),
    clearDate: t('common.datePicker.clearDate'),
  };
  const durationLabels = {
    days: t('bpmnEditor.inspector.timerUnits.days'),
    hours: t('bpmnEditor.inspector.timerUnits.hours'),
    minutes: t('bpmnEditor.inspector.timerUnits.minutes'),
    hint: t('bpmnEditor.inspector.timerUnits.hint'),
  };

  const cronValue = cronDraft ?? (storedIsCron ? rawValue : '');
  const cronInvalid = cronDraft !== null && !isCronExpression(cronDraft);
  const commitCron = () => {
    if (cronDraft === null) return;
    if (isCronExpression(cronDraft)) {
      write('cycle', cronDraft.trim());
      setCronDraft(null);
    }
  };

  const isoValue = isoDraft ?? rawValue;
  const isoInvalid = isoDraft !== null && detectTimerField(isoDraft) === null;
  const commitIso = () => {
    if (isoDraft === null) return;
    const value = isoDraft.trim();
    const detected = detectTimerField(isoDraft);
    if (detected && value) {
      write(detected, value);
      setIsoDraft(null);
    }
  };

  return (
    <>
      <Field orientation="vertical" className="w-full gap-2">
        <FieldLabel>{t('bpmnEditor.inspector.timerType')}</FieldLabel>
        <div className="flex flex-wrap gap-1">
          {MODES.map((item) => {
            const isSelected = mode === item.mode;
            const isActiveType = activeMode === item.mode && !isSelected;

            return (
              <Button
                key={item.mode}
                type="button"
                size="sm"
                variant={isSelected ? 'solid' : 'ghost'}
                intent={isSelected ? 'primary' : undefined}
                aria-pressed={isSelected}
                title={
                  isActiveType
                    ? t('bpmnEditor.inspector.timerActiveType')
                    : undefined
                }
                className={
                  isActiveType
                    ? 'h-7 gap-1 px-2 text-xs whitespace-nowrap text-primary ring-1 ring-primary/40'
                    : 'h-7 gap-1 px-2 text-xs whitespace-nowrap'
                }
                onClick={() => setMode(item.mode)}
              >
                {item.icon}
                {t(MODE_LABEL_KEY[item.mode])}
              </Button>
            );
          })}
        </div>
      </Field>

      {mode === 'relative' && (
        <Field orientation="vertical" className="w-full gap-2">
          <FieldLabel>{t('bpmnEditor.inspector.timerValue')}</FieldLabel>
          <DurationPicker
            value={field === 'duration' ? rawValue : ''}
            units={['days', 'hours', 'minutes']}
            labels={durationLabels}
            aria-label={t('bpmnEditor.inspector.timerValue')}
            onChange={(next) => write('duration', next)}
          />
          <TimerPresets
            presets={TIMER_PRESETS}
            onSelect={(value) => write('duration', value)}
          />
        </Field>
      )}

      {mode === 'absolute' && (
        <Field orientation="vertical" className="w-full gap-2">
          <FieldLabel>{t('bpmnEditor.inspector.timerValue')}</FieldLabel>
          <DatePicker
            mode="datetime"
            clearable
            value={field === 'date' ? parseDateValue(rawValue) : undefined}
            locale={locale}
            labels={timeLabels}
            aria-label={t('bpmnEditor.inspector.timerValue')}
            onChange={(date) => write('date', date ? date.toISOString() : '')}
          />
        </Field>
      )}

      {mode === 'cycle' && (
        <>
          <Field
            orientation="horizontal"
            className="w-full items-center justify-between"
          >
            <FieldLabel>
              {t('bpmnEditor.inspector.timerCycleInfinite')}
            </FieldLabel>
            <Switch
              checked={cycle.infinite}
              onCheckedChange={(checked) =>
                updateCycle({
                  infinite: checked,
                  repeat: checked ? null : (cycle.repeat ?? 1),
                })
              }
            />
          </Field>

          {!cycle.infinite && (
            <Field orientation="vertical" className="w-full gap-2">
              <FieldLabel>
                {t('bpmnEditor.inspector.timerCycleRepeat')}
              </FieldLabel>
              <Input
                type="number"
                min={1}
                className="w-24"
                value={cycle.repeat ?? 1}
                onChange={(event) =>
                  updateCycle({
                    infinite: false,
                    repeat: Math.max(1, Number(event.target.value) || 1),
                  })
                }
              />
            </Field>
          )}

          <Field orientation="vertical" className="w-full gap-2">
            <FieldLabel>{t('bpmnEditor.inspector.timerValue')}</FieldLabel>
            <DurationPicker
              value={storedAsCycle ? rawValue : ''}
              units={['days', 'hours', 'minutes']}
              labels={durationLabels}
              aria-label={t('bpmnEditor.inspector.timerValue')}
              onChange={(next) =>
                updateCycle({ duration: parseDurationComponents(next) })
              }
            />
            <TimerPresets
              presets={TIMER_PRESETS}
              onSelect={(value) =>
                updateCycle({ duration: parseDurationComponents(value) })
              }
            />
          </Field>

          <Field
            orientation="horizontal"
            className="w-full items-center justify-between"
          >
            <FieldLabel>{t('bpmnEditor.inspector.timerCycleStart')}</FieldLabel>
            <Switch
              checked={Boolean(cycle.start)}
              onCheckedChange={(checked) =>
                updateCycle({
                  start: checked ? new Date().toISOString() : undefined,
                })
              }
            />
          </Field>

          {cycle.start && (
            <DatePicker
              mode="datetime"
              clearable
              value={parseDateValue(cycle.start)}
              locale={locale}
              labels={timeLabels}
              aria-label={t('bpmnEditor.inspector.timerCycleStart')}
              onChange={(date) =>
                updateCycle({ start: date ? date.toISOString() : undefined })
              }
            />
          )}
        </>
      )}

      {mode === 'cron' && (
        <Field orientation="vertical" className="w-full gap-2">
          <FieldLabel>{t('bpmnEditor.inspector.timerValue')}</FieldLabel>
          <Input
            value={cronValue}
            className="font-mono text-sm"
            placeholder={t('bpmnEditor.inspector.timerCronPlaceholder')}
            aria-label={t('bpmnEditor.inspector.timerValue')}
            aria-invalid={cronInvalid}
            onChange={(event) => setCronDraft(event.target.value)}
            onBlur={commitCron}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitCron();
              if (event.key === 'Escape') setCronDraft(null);
            }}
          />
          {cronInvalid ? (
            <FieldError>{t('bpmnEditor.inspector.timerInvalid')}</FieldError>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t('bpmnEditor.inspector.timerCronHint')}
            </p>
          )}
        </Field>
      )}

      {mode === 'iso' && (
        <Field orientation="vertical" className="w-full gap-2">
          <FieldLabel>{t('bpmnEditor.inspector.timerValue')}</FieldLabel>
          <Input
            value={isoValue}
            className="font-mono text-xs"
            placeholder={t('bpmnEditor.inspector.timerIsoPlaceholder')}
            aria-label={t('bpmnEditor.inspector.timerValue')}
            aria-invalid={isoInvalid}
            onChange={(event) => setIsoDraft(event.target.value)}
            onBlur={commitIso}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitIso();
              if (event.key === 'Escape') setIsoDraft(null);
            }}
          />
          {isoInvalid ? (
            <FieldError>{t('bpmnEditor.inspector.timerInvalid')}</FieldError>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t('bpmnEditor.inspector.timerIsoHint')}
            </p>
          )}
        </Field>
      )}
    </>
  );
});

interface TimerPresetsProps {
  presets: ReadonlyArray<{ key: string; value: string }>;
  onSelect: (value: string) => void;
}

function TimerPresets({ presets, onSelect }: TimerPresetsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-1">
      {presets.map((preset) => (
        <Button
          key={preset.key}
          type="button"
          size="sm"
          variant="outline"
          className="h-6 px-2 text-xs"
          onClick={() => onSelect(preset.value)}
        >
          {t(PRESET_LABEL_KEY[preset.key] ?? preset.key)}
        </Button>
      ))}
    </div>
  );
}
