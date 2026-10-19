import { useEffect, useState } from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { Field, FieldLabel } from '@repo/ui-kit/components/common/form/field';
import { Input } from '@repo/ui-kit/components/common/form/input';

import {
  addSelectedScriptExpression,
  removeSelectedScriptExpression,
  setSelectedScriptExpression,
} from '../../model/actions/tasks';
import type { ScriptExpression } from '../../model/definitions/task-definitions';

export interface ScriptFieldProps {
  expressions: ScriptExpression[];
}

interface ExpressionRowProps {
  index: number;
  expression: ScriptExpression;
}

/**
 * One expression of the script, shown as the assignment `[ variable = value ]`.
 * The brackets and `=` are fixed chrome; only the name and value are editable.
 * The row is the extension point for future expression kinds.
 */
const ExpressionRow = reatomComponent(function ExpressionRow({
  index,
  expression,
}: ExpressionRowProps) {
  const { t } = useTranslation();
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [valueDraft, setValueDraft] = useState<string | null>(null);

  const name = nameDraft ?? expression.name;
  const value = valueDraft ?? expression.value;

  useEffect(() => {
    setNameDraft(null);
    setValueDraft(null);
  }, [expression.name, expression.value]);

  const commit = () => {
    if (nameDraft === null && valueDraft === null) return;

    const nextName = (nameDraft ?? expression.name).trim();
    const nextValue = (valueDraft ?? expression.value).trim();

    if (nextName !== expression.name || nextValue !== expression.value) {
      setSelectedScriptExpression(index, {
        ...expression,
        name: nextName,
        value: nextValue,
      });
    }

    setNameDraft(null);
    setValueDraft(null);
  };

  const onKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setNameDraft(null);
      setValueDraft(null);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <Input
        className="min-w-0 flex-1 font-mono"
        value={name}
        placeholder={t('bpmnEditor.inspector.expressionNamePlaceholder')}
        aria-label={t('bpmnEditor.inspector.expressionName')}
        onChange={(event) => setNameDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
      />
      <span className="font-mono text-sm text-muted-foreground select-none">
        =
      </span>
      <Input
        className="min-w-0 flex-1 font-mono"
        value={value}
        placeholder={t('bpmnEditor.inspector.expressionValuePlaceholder')}
        aria-label={t('bpmnEditor.inspector.expressionValue')}
        onChange={(event) => setValueDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={t('bpmnEditor.inspector.removeExpression')}
        title={t('bpmnEditor.inspector.removeExpression')}
        onClick={() => removeSelectedScriptExpression(index)}
      >
        <TrashIcon className="size-3.5" />
      </Button>
    </div>
  );
});

/**
 * The script of a scripting task: a list of expressions plus a button to append
 * one. Only set-variable exists today; further kinds slot into `ExpressionRow`.
 */
export const ScriptField = reatomComponent(function ScriptField({
  expressions,
}: ScriptFieldProps) {
  const { t } = useTranslation();

  return (
    <Field orientation="vertical" className="w-full gap-2">
      <FieldLabel>{t('bpmnEditor.inspector.script')}</FieldLabel>
      <div className="flex flex-col gap-2">
        {expressions.map((expression, index) => (
          <ExpressionRow key={index} index={index} expression={expression} />
        ))}
        <Button
          type="button"
          variant="outline"
          size="xs"
          className="self-start"
          onClick={addSelectedScriptExpression}
        >
          <PlusIcon className="size-3.5" />
          {t('bpmnEditor.inspector.addExpression')}
        </Button>
      </div>
    </Field>
  );
});
