import { useEffect, useRef, useState } from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import { CheckIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { Field, FieldLabel } from '@repo/ui-kit/components/common/form/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui-kit/components/common/form/select';
import { Textarea } from '@repo/ui-kit/components/common/form/textarea';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui-kit/components/common/layout/tabs';

import {
  getDecisionTaskOptions,
  setSelectedApprovalCondition,
  setSelectedAsDefaultFlow,
  setSelectedConditionExpression,
} from '../../model/editor-model';
import {
  DECISION_VALUES,
  type DecisionValue,
  parseApprovalCondition,
} from '../../model/task-definitions';

export interface ConditionFieldProps {
  elementId: string;
  conditionExpression: string | null;
  isDefaultFlow: boolean;
  sourceIsGateway: boolean;
  feedingDecisionKey: string | null;
}

type ConditionTab = 'approval' | 'expression';

export const ConditionField = reatomComponent(function ConditionField({
  elementId,
  conditionExpression,
  isDefaultFlow,
  sourceIsGateway,
  feedingDecisionKey,
}: ConditionFieldProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<string | null>(null);
  const value = conditionExpression ?? '';
  const current = draft ?? value;
  const parsed = parseApprovalCondition(conditionExpression);
  const isCustom = conditionExpression !== null && parsed === null;
  const [tab, setTab] = useState<ConditionTab>(
    isCustom ? 'expression' : 'approval',
  );
  const initialTabRef = useRef<ConditionTab>(
    isCustom ? 'expression' : 'approval',
  );
  initialTabRef.current = isCustom ? 'expression' : 'approval';

  useEffect(() => {
    setDraft(null);
    setTab(initialTabRef.current);
  }, [elementId]);

  const options = getDecisionTaskOptions();
  const selectedKey = parsed?.decisionKey ?? feedingDecisionKey ?? '';
  const selectedValue = parsed?.value ?? '';
  const keyInOptions = options.some(
    (option) => option.decisionKey === selectedKey,
  );

  const commit = () => {
    if (draft === null) return;

    const next = draft.trim();

    if (next !== value) {
      setSelectedConditionExpression(next.length > 0 ? next : null);
    }

    setDraft(null);
  };

  const expressionEditor = (
    <>
      {isCustom && (
        <p className="text-xs text-flow-custom">
          {t('bpmnEditor.inspector.conditionCustom')}
        </p>
      )}
      <div className="flex items-start gap-1.5">
        <Textarea
          value={current}
          className="min-h-24 font-mono text-xs"
          placeholder={t('bpmnEditor.inspector.conditionPlaceholder')}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              setDraft(null);
            }
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={t('bpmnEditor.inspector.save')}
          title={t('bpmnEditor.inspector.save')}
          onClick={commit}
        >
          <CheckIcon className="size-3.5" />
        </Button>
      </div>
    </>
  );

  const approvalEditor = (
    <>
      <Field orientation="vertical" className="w-full gap-2">
        <FieldLabel>
          {t('bpmnEditor.inspector.conditionBranchSource')}
        </FieldLabel>
        <div className="flex min-w-0 flex-col gap-1.5">
          <Select
            value={selectedKey || undefined}
            onValueChange={(next) =>
              setSelectedApprovalCondition(
                next,
                parsed?.value ?? DECISION_VALUES.approve,
              )
            }
          >
            <SelectTrigger className="w-full min-w-0">
              <SelectValue
                className="min-w-0 truncate"
                placeholder={t(
                  'bpmnEditor.inspector.conditionBranchSourcePlaceholder',
                )}
              />
            </SelectTrigger>
            <SelectContent
              position="popper"
              align="start"
              className="ui:max-w-[calc(var(--radix-select-trigger-width))]"
            >
              {options.map((option) => (
                <SelectItem key={option.id} value={option.decisionKey}>
                  {option.name}
                </SelectItem>
              ))}
              {selectedKey && !keyInOptions && (
                <SelectItem value={selectedKey}>{selectedKey}</SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="self-start"
            disabled={!feedingDecisionKey}
            title={t('bpmnEditor.inspector.conditionUseClosest')}
            onClick={() => {
              if (!feedingDecisionKey) return;

              setSelectedApprovalCondition(
                feedingDecisionKey,
                parsed?.value ?? DECISION_VALUES.approve,
              );
            }}
          >
            {t('bpmnEditor.inspector.conditionUseClosest')}
          </Button>
        </div>
      </Field>

      <Field orientation="vertical" className="w-full gap-2">
        <FieldLabel>{t('bpmnEditor.inspector.conditionBranch')}</FieldLabel>
        <Select
          value={selectedValue || undefined}
          disabled={!selectedKey}
          onValueChange={(next) =>
            setSelectedApprovalCondition(selectedKey, next as DecisionValue)
          }
        >
          <SelectTrigger className="w-full min-w-0">
            <SelectValue
              className="min-w-0 truncate"
              placeholder={t('bpmnEditor.inspector.conditionBranchPlaceholder')}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={DECISION_VALUES.approve}>
              {t('bpmnEditor.inspector.conditionBranchApprove')}
            </SelectItem>
            <SelectItem value={DECISION_VALUES.reject}>
              {t('bpmnEditor.inspector.conditionBranchReject')}
            </SelectItem>
          </SelectContent>
        </Select>
      </Field>

      {options.length === 0 && (
        <p className="text-xs text-muted-foreground">
          {t('bpmnEditor.inspector.conditionNoDecision')}
        </p>
      )}
    </>
  );

  if (sourceIsGateway && isDefaultFlow) {
    return (
      <div className="flex flex-col gap-2 rounded-md border border-primary/40 bg-primary/5 p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {t('bpmnEditor.inspector.conditionDefaultTitle')}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('bpmnEditor.inspector.conditionDefaultDescription')}
        </p>
        <Button
          type="button"
          variant="outline"
          size="xs"
          className="self-start"
          onClick={() => setSelectedAsDefaultFlow(false)}
        >
          {t('bpmnEditor.inspector.conditionDefaultRemove')}
        </Button>
      </div>
    );
  }

  return (
    <>
      {sourceIsGateway ? (
        <Tabs
          value={tab}
          onValueChange={(next) => setTab(next as ConditionTab)}
          className="w-full gap-3"
        >
          <TabsList className="w-full">
            <TabsTrigger value="approval">
              {t('bpmnEditor.inspector.conditionTabApproval')}
            </TabsTrigger>
            <TabsTrigger value="expression">
              {t('bpmnEditor.inspector.conditionTabExpression')}
              {isCustom && (
                <span className="rounded-sm bg-flow-custom/15 px-1.5 py-0.5 text-[10px] font-semibold text-flow-custom uppercase">
                  {t('bpmnEditor.inspector.conditionCustomBadge')}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="approval" className="flex flex-col gap-3">
            {approvalEditor}
          </TabsContent>
          <TabsContent value="expression" className="flex flex-col gap-2">
            {expressionEditor}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex flex-col gap-2">{expressionEditor}</div>
      )}

      {sourceIsGateway && (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="self-start"
          onClick={() => setSelectedAsDefaultFlow(true)}
        >
          {t('bpmnEditor.inspector.conditionDefaultSet')}
        </Button>
      )}
    </>
  );
});
