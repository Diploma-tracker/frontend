import { useEffect, useState } from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';

import { Field, FieldLabel } from '@repo/ui-kit/components/common/form/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui-kit/components/common/form/select';
import { Switch } from '@repo/ui-kit/components/common/form/switch';
import { Textarea } from '@repo/ui-kit/components/common/form/textarea';

import { setSelectedConditionExpression } from '../../models/actions/conditions';
import {
  setSelectedEventDefinition,
  setSelectedEventInterrupting,
  setSelectedEventThrowing,
} from '../../models/actions/events';
import type { EventInfo } from '../../models/definitions/element-definitions';
import {
  type EventDefinitionKey,
  eventDefinitionOptions,
  isBoundaryEventType,
  isIntermediateEventType,
  isToggleableIntermediateDefinition,
} from '../../models/definitions/event-definitions';
import { TimerField } from './timer-field';

export interface EventFieldProps {
  selected: EventInfo;
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
  const definition: EventDefinitionKey = selected.eventDefinition;
  const options = eventDefinitionOptions(selected.type);
  const isConditional = definition === 'conditional';
  const isTimer = definition === 'timer';
  const isIntermediate = isIntermediateEventType(selected.type);
  const isThrowing = selected.type === 'bpmn:IntermediateThrowEvent';
  const showThrowing =
    isIntermediate && isToggleableIntermediateDefinition(definition);

  const [conditionDraft, setConditionDraft] = useState<string | null>(null);

  useEffect(() => {
    setConditionDraft(null);
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

      {isTimer && <TimerField selected={selected} />}

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
