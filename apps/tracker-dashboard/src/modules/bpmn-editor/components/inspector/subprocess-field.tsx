import { type ReactNode, useEffect, useState } from 'react';

import { formatDateTime, getLocale } from '@/shared/utils/format-date';
import { k, useTranslation } from '@/shared/utils/i18n';
import { formatDurationToReadable } from '@/shared/utils/iso-duration';
import { CalendarBlankIcon, TimerIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { DatePicker } from '@repo/ui-kit/components/common/form/date-picker';
import { DurationPicker } from '@repo/ui-kit/components/common/form/duration-picker';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from '@repo/ui-kit/components/common/form/field';
import { Switch } from '@repo/ui-kit/components/common/form/switch';

import type { SubProcessInfo } from '../../model/definitions/element-definitions';
import { isRelativeDeadline } from '../../model/definitions/stage-definitions';
import {
  setSelectedIsStage,
  setSelectedStageDeadline,
} from '../../model/editor-model';

export interface SubProcessFieldProps {
  selected: SubProcessInfo;
}

/** Deadline editor mode; mirrors the stored shape, not a stored field itself. */
type DeadlineMode = 'absolute' | 'relative';

const MODE_LABEL_KEY: Record<DeadlineMode, string> = {
  absolute: k('bpmnEditor.inspector.stageDeadlineModes.absolute'),
  relative: k('bpmnEditor.inspector.stageDeadlineModes.relative'),
};

const MODES: Array<{ mode: DeadlineMode; icon: ReactNode }> = [
  { mode: 'absolute', icon: <CalendarBlankIcon className="size-3.5" /> },
  { mode: 'relative', icon: <TimerIcon className="size-3.5" /> },
];

const parseDateValue = (raw: string | null): Date | undefined => {
  if (!raw) return undefined;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const modeOf = (selected: SubProcessInfo): DeadlineMode =>
  selected.stageDeadline !== null && isRelativeDeadline(selected.stageDeadline)
    ? 'relative'
    : 'absolute';

/**
 * Properties for the selected subprocess: the `isStage` flag plus, once the
 * subprocess is a stage, its optional deadline. The deadline is off until
 * switched on — the switch description then reads back the stored value as a
 * localized date or period, so "set" and "unset" never look alike. The two
 * shapes (absolute datetime, relative ISO 8601 duration from the stage's
 * runtime start) are mutually exclusive. A stage is tinted on the canvas and
 * listed in the general properties panel, where its order can be changed.
 */
export const SubProcessField = reatomComponent(function SubProcessField({
  selected,
}: SubProcessFieldProps) {
  const { t } = useTranslation();
  const locale = getLocale();

  const hasDeadline = selected.stageDeadline !== null;
  /** The editor may be open before a value is stored (just toggled on). */
  const [isPending, setIsPending] = useState(false);
  const deadlineOn = hasDeadline || isPending;

  const [mode, setMode] = useState<DeadlineMode>(() => modeOf(selected));

  useEffect(() => {
    setMode(modeOf(selected));
    setIsPending(false);
    // Only re-sync when a different element is selected.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.id]);

  const summary = selected.stageDeadline
    ? isRelativeDeadline(selected.stageDeadline)
      ? `${t('bpmnEditor.inspector.stageDeadlineRelativePrefix')} ${formatDurationToReadable(selected.stageDeadline)}`
      : formatDateTime(selected.stageDeadline)
    : t('bpmnEditor.inspector.stageDeadlineNone');

  const timeLabels = {
    hours: t('common.datePicker.hours'),
    minutes: t('common.datePicker.minutes'),
    clearDate: t('common.datePicker.clearDate'),
  };
  const durationLabels = {
    years: t('bpmnEditor.inspector.stageDeadlineUnits.years'),
    months: t('bpmnEditor.inspector.stageDeadlineUnits.months'),
    days: t('bpmnEditor.inspector.stageDeadlineUnits.days'),
    hint: t('bpmnEditor.inspector.stageDeadlineUnits.hint'),
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border bg-muted/30 p-3">
      <Field
        orientation="horizontal"
        className="w-full items-center justify-between gap-3"
      >
        <FieldContent>
          <FieldLabel>{t('bpmnEditor.inspector.isStage')}</FieldLabel>
          <FieldDescription>
            {t('bpmnEditor.inspector.isStageHint')}
          </FieldDescription>
        </FieldContent>
        <Switch
          checked={selected.isStage}
          onCheckedChange={(checked) => setSelectedIsStage(checked)}
        />
      </Field>

      {selected.isStage && (
        <>
          <Field
            orientation="horizontal"
            className="w-full items-center justify-between gap-3"
          >
            <FieldContent>
              <FieldLabel>
                {t('bpmnEditor.inspector.stageDeadlineEnabled')}
              </FieldLabel>
              <FieldDescription>{summary}</FieldDescription>
            </FieldContent>
            <Switch
              checked={deadlineOn}
              onCheckedChange={(checked) => {
                if (checked) {
                  setIsPending(true);
                  return;
                }

                setIsPending(false);
                setSelectedStageDeadline(null);
              }}
            />
          </Field>

          {deadlineOn && (
            <>
              <Field orientation="vertical" className="w-full gap-2">
                <div className="flex flex-wrap gap-1">
                  {MODES.map((item) => (
                    <Button
                      key={item.mode}
                      type="button"
                      size="sm"
                      variant={mode === item.mode ? 'solid' : 'ghost'}
                      intent={mode === item.mode ? 'primary' : undefined}
                      aria-pressed={mode === item.mode}
                      className="h-7 gap-1 px-2 text-xs whitespace-nowrap"
                      onClick={() => setMode(item.mode)}
                    >
                      {item.icon}
                      {t(MODE_LABEL_KEY[item.mode])}
                    </Button>
                  ))}
                </div>
              </Field>

              {mode === 'absolute' ? (
                <DatePicker
                  mode="datetime"
                  clearable
                  value={
                    selected.stageDeadline &&
                    !isRelativeDeadline(selected.stageDeadline)
                      ? parseDateValue(selected.stageDeadline)
                      : undefined
                  }
                  locale={locale}
                  labels={timeLabels}
                  aria-label={t('bpmnEditor.inspector.stageDeadline')}
                  onChange={(date) => {
                    setIsPending(false);
                    setSelectedStageDeadline(date ? date.toISOString() : null);
                  }}
                />
              ) : (
                <DurationPicker
                  value={
                    selected.stageDeadline &&
                    isRelativeDeadline(selected.stageDeadline)
                      ? selected.stageDeadline
                      : ''
                  }
                  units={['years', 'months', 'days']}
                  labels={durationLabels}
                  aria-label={t('bpmnEditor.inspector.stageDeadline')}
                  onChange={(next) => {
                    setIsPending(false);
                    setSelectedStageDeadline(next === 'PT0S' ? null : next);
                  }}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
});
