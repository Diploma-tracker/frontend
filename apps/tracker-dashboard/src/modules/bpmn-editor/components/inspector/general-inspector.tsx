import { type KeyboardEvent, useEffect, useState } from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';

import { Field, FieldLabel } from '@repo/ui-kit/components/common/form/field';
import { Input } from '@repo/ui-kit/components/common/form/input';
import { ScrollArea } from '@repo/ui-kit/components/common/layout/scroll-area';

import { processNameAtom, renameProcess } from '../../model/editor-model';
import { StageList } from './stage-list';

/**
 * Properties for the diagram itself, shown when nothing is selected: the
 * process name and the ordered list of stages. A stage is a subprocess flagged
 * with the `stage` attribute; its order is stored in the diagram XML.
 */
export const GeneralInspector = reatomComponent(function GeneralInspector() {
  const { t } = useTranslation();
  const value = processNameAtom();
  const [draft, setDraft] = useState<string | null>(null);
  const name = draft ?? value;

  useEffect(() => {
    setDraft(null);
  }, [value]);

  const commit = () => {
    const next = (draft ?? value).trim();

    if (draft !== null && next !== value) renameProcess(next);

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
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 p-4">
        <Field orientation="vertical" className="w-full gap-2">
          <FieldLabel>{t('bpmnEditor.inspector.processName')}</FieldLabel>
          <Input
            value={name}
            placeholder={t('bpmnEditor.inspector.processNamePlaceholder')}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
          />
        </Field>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">
            {t('bpmnEditor.inspector.stages')}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t('bpmnEditor.inspector.stagesHint')}
          </p>
          <StageList />
        </div>
      </div>
    </ScrollArea>
  );
});
