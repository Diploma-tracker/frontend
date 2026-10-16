import { useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from '@repo/ui-kit/components/common/form/field';
import { Switch } from '@repo/ui-kit/components/common/form/switch';

import {
  type SelectedElementInfo,
  setSelectedIsStage,
} from '../../model/editor-model';

export interface SubProcessFieldProps {
  selected: SelectedElementInfo;
}

/**
 * Properties for the selected subprocess: a single `isStage` flag. A stage is
 * tinted on the canvas and listed in the general properties panel, where its
 * order can be changed.
 */
export const SubProcessField = reatomComponent(function SubProcessField({
  selected,
}: SubProcessFieldProps) {
  const { t } = useTranslation();

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
    </div>
  );
});
