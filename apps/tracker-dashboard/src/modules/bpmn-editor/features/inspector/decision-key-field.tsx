import { useEffect, useState } from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { Field, FieldLabel } from '@repo/ui-kit/components/common/form/field';
import { Input } from '@repo/ui-kit/components/common/form/input';

import { setSelectedDecisionKey } from '../../models/actions/tasks';

export interface DecisionKeyFieldProps {
  elementId: string;
  decisionKey: string | null;
  suggestion: string;
}

export const DecisionKeyField = reatomComponent(function DecisionKeyField({
  elementId,
  decisionKey,
  suggestion,
}: DecisionKeyFieldProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<string | null>(null);
  const value = decisionKey ?? '';
  const name = draft ?? value;

  useEffect(() => {
    setDraft(null);
  }, [elementId]);

  const commit = () => {
    if (draft === null) return;

    const trimmed = draft.trim();
    if (trimmed === value) {
      setDraft(null);
      return;
    }

    setSelectedDecisionKey(trimmed);
    setDraft(null);
  };

  const applySuggestion = () => {
    setDraft(suggestion);
  };

  return (
    <Field orientation="vertical" className="w-full gap-2">
      <FieldLabel>{t('bpmnEditor.inspector.decisionKey')}</FieldLabel>
      <Input
        className="min-w-0"
        value={name}
        placeholder={t('bpmnEditor.inspector.decisionKeyPlaceholder')}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commit();
          }

          if (event.key === 'Escape') {
            event.preventDefault();
            setDraft(null);
          }
        }}
      />
      {(value === '' || value === suggestion) && (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="self-start"
          onClick={applySuggestion}
        >
          {t('bpmnEditor.inspector.decisionKey')} · {suggestion}
        </Button>
      )}
    </Field>
  );
});
