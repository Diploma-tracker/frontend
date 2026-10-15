import { useEffect, useState } from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';

import { Field, FieldLabel } from '@repo/ui-kit/components/common/form/field';
import { Input } from '@repo/ui-kit/components/common/form/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui-kit/components/common/form/select';
import { Switch } from '@repo/ui-kit/components/common/form/switch';
import { Textarea } from '@repo/ui-kit/components/common/form/textarea';

import {
  type SelectedElementInfo,
  setSelectedConditionExpression,
  setSelectedEventDefinition,
  setSelectedEventInterrupting,
  setSelectedEventThrowing,
  setSelectedTimerValue,
} from '../../model/editor-model';
import {
  type EventDefinitionKey,
  TIMER_TYPES,
  type TimerType,
  eventDefinitionOptions,
  isBoundaryEventType,
  isIntermediateEventType,
  isToggleableIntermediateDefinition,
} from '../../model/event-definitions';

export interface EventFieldProps {
  selected: SelectedElementInfo;
}

/**
 * Properties for the selected event: which definition is attached, and the
 * settings that definition exposes — the interrupting flag on a boundary event,
 * the condition on a conditional one, the value on a timer.
 */
export const EventField = reatomComponent(function EventField({
  selected,
}: EventFieldProps) {
  const { t } = useTranslation();
  const definition: EventDefinitionKey = selected.eventDefinition ?? 'none';
  const options = eventDefinitionOptions(selected.type);
  const isConditional = definition === 'conditional';
  const isTimer = definition === 'timer';
  const isIntermediate = isIntermediateEventType(selected.type);
  const isThrowing = selected.type === 'bpmn:IntermediateThrowEvent';
  const showThrowing =
    isIntermediate && isToggleableIntermediateDefinition(definition);

  const [conditionDraft, setConditionDraft] = useState<string | null>(null);
  const [timerDraft, setTimerDraft] = useState<string | null>(null);

  useEffect(() => {
    setConditionDraft(null);
    setTimerDraft(null);
  }, [selected.id, definition]);

  const conditionValue = selected.conditionExpression ?? '';
  const conditionCurrent = conditionDraft ?? conditionValue;

  const commitCondition = () => {
    if (conditionDraft === null) return;

    const next = conditionDraft.trim();

    if (next !== conditionValue) {
      setSelectedConditionExpression(next.length > 0 ? next : null);
    }

    setConditionDraft(null);
  };

  const timerValue = selected.timerValue ?? '';
  const timerCurrent = timerDraft ?? timerValue;
  const timerType: TimerType = selected.timerType ?? 'duration';

  const commitTimer = () => {
    if (timerDraft === null) return;

    const next = timerDraft.trim();

    if (next !== timerValue) {
      setSelectedTimerValue(timerType, next);
    }

    setTimerDraft(null);
  };

  return (
    <div className="flex flex-col gap-4 rounded-md border bg-muted/30 p-3">
      <Field orientation="vertical" className="w-full gap-2">
        <FieldLabel>{t('bpmnEditor.inspector.eventDefinition')}</FieldLabel>
        <Select
          value={definition}
          onValueChange={(next) =>
            setSelectedEventDefinition(next as EventDefinitionKey)
          }
        >
          <SelectTrigger className="w-full min-w-0">
            <SelectValue className="min-w-0 truncate" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            align="start"
            className="ui:max-w-[calc(var(--radix-select-trigger-width))]"
          >
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {t(option.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {isBoundaryEventType(selected.type) && (
        <Field
          orientation="horizontal"
          className="w-full items-center justify-between"
        >
          <FieldLabel>{t('bpmnEditor.inspector.eventInterrupting')}</FieldLabel>
          <Switch
            checked={selected.isInterrupting}
            onCheckedChange={(checked) => setSelectedEventInterrupting(checked)}
          />
        </Field>
      )}

      {showThrowing && (
        <Field
          orientation="horizontal"
          className="w-full items-center justify-between"
        >
          <FieldLabel>{t('bpmnEditor.inspector.eventThrowing')}</FieldLabel>
          <Switch
            checked={isThrowing}
            onCheckedChange={(checked) => setSelectedEventThrowing(checked)}
          />
        </Field>
      )}

      {isTimer && (
        <>
          <Field orientation="vertical" className="w-full gap-2">
            <FieldLabel>{t('bpmnEditor.inspector.timerType')}</FieldLabel>
            <Select
              value={timerType}
              onValueChange={(next) =>
                setSelectedTimerValue(next as TimerType, timerValue)
              }
            >
              <SelectTrigger className="w-full min-w-0">
                <SelectValue className="min-w-0 truncate" />
              </SelectTrigger>
              <SelectContent>
                {TIMER_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`bpmnEditor.inspector.timerTypes.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field orientation="vertical" className="w-full gap-2">
            <FieldLabel>{t('bpmnEditor.inspector.timerValue')}</FieldLabel>
            <Input
              className="min-w-0"
              value={timerCurrent}
              placeholder={t('bpmnEditor.inspector.timerValuePlaceholder')}
              onChange={(event) => setTimerDraft(event.target.value)}
              onBlur={commitTimer}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  commitTimer();
                }

                if (event.key === 'Escape') {
                  event.preventDefault();
                  setTimerDraft(null);
                }
              }}
            />
          </Field>
        </>
      )}

      {isConditional && (
        <Field orientation="vertical" className="w-full gap-2">
          <FieldLabel>{t('bpmnEditor.inspector.eventCondition')}</FieldLabel>
          <Textarea
            value={conditionCurrent}
            className="min-h-24 font-mono text-xs"
            placeholder={t('bpmnEditor.inspector.conditionPlaceholder')}
            onChange={(event) => setConditionDraft(event.target.value)}
            onBlur={commitCondition}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                setConditionDraft(null);
              }
            }}
          />
        </Field>
      )}
    </div>
  );
});
