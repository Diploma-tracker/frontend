import { type KeyboardEvent, useEffect, useState } from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';

import { Field, FieldLabel } from '@repo/ui-kit/components/common/form/field';
import { Input } from '@repo/ui-kit/components/common/form/input';

import { renameSelected } from '../../models/editor-model';

export interface NameFieldProps {
  elementId: string;
  value: string;
}

export const NameField = reatomComponent(function NameField({
  elementId,
  value,
}: NameFieldProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<string | null>(null);
  const name = draft ?? value;

  useEffect(() => {
    setDraft(null);
  }, [elementId]);

  const commit = () => {
    const next = (draft ?? value).trim();

    if (draft !== null && next !== value) renameSelected(next);

    setDraft(null);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setDraft(null);
    }
  };

  return (
    <Field orientation="vertical" className="w-full gap-2">
      <FieldLabel>{t('bpmnEditor.inspector.name')}</FieldLabel>
      <Input
        value={name}
        placeholder={t('bpmnEditor.inspector.namePlaceholder')}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
      />
    </Field>
  );
});
