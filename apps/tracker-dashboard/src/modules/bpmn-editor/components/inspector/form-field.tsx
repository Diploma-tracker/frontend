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

import { setSelectedFormKey } from '../../model/editor-model';
import { FORM_OPTIONS } from '../../model/task-definitions';

export interface FormFieldProps {
  formKey: string | null;
}

export const FormField = reatomComponent(function FormField({
  formKey,
}: FormFieldProps) {
  const { t } = useTranslation();

  return (
    <Field orientation="vertical" className="w-full gap-2">
      <FieldLabel>{t('bpmnEditor.inspector.form')}</FieldLabel>
      <Select
        value={formKey ?? undefined}
        onValueChange={(value) => setSelectedFormKey(value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={t('bpmnEditor.inspector.formPlaceholder')}
          />
        </SelectTrigger>
        <SelectContent>
          {FORM_OPTIONS.length === 0 ? (
            <SelectItem value="__placeholder" disabled>
              {t('bpmnEditor.inspector.formPlaceholder')}
            </SelectItem>
          ) : (
            FORM_OPTIONS.map((form) => (
              <SelectItem key={form.value} value={form.value}>
                {form.label}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </Field>
  );
});
