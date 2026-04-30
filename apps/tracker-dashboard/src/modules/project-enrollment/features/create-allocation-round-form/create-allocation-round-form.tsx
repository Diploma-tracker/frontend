import { DatePickerFormField, TextFormField } from '@/shared/components';
import { useTranslation } from '@/shared/utils/i18n';
import { CircleNotchIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { Field, FieldGroup } from '@repo/ui-kit/components/common/form/field';

import { createAllocationRoundForm } from '../../models/create-allocation-round-form-model';

interface CreateAllocationRoundFormProps {
  onSuccess?: () => void;
}

export const CreateAllocationRoundForm = reatomComponent(function CreateAllocationRoundForm({
  onSuccess,
}: CreateAllocationRoundFormProps) {
  const { t } = useTranslation();
  const { submit, fields } = createAllocationRoundForm;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit().then(() => onSuccess?.());
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <TextFormField
          field={fields.name}
          label={t('projectEnrollment.allocationRound.form.nameLabel')}
          placeholder={t('projectEnrollment.allocationRound.form.namePlaceholder')}
          autoComplete="off"
        />

        <DatePickerFormField
          field={fields.startAt}
          label={t('projectEnrollment.allocationRound.form.startDateLabel')}
          mode="date"
          placeholder={t('projectEnrollment.allocationRound.form.startDatePlaceholder')}
        />

        <DatePickerFormField
          field={fields.endAt}
          label={t('projectEnrollment.allocationRound.form.endDateLabel')}
          mode="date"
          placeholder={t('projectEnrollment.allocationRound.form.endDatePlaceholder')}
        />

        <Field>
          <Button variant="solid" intent="primary" type="submit" disabled={!submit.ready()}>
            {!submit.ready() ? (
              <CircleNotchIcon className="animate-spin" />
            ) : (
              t('projectEnrollment.allocationRound.form.submitButton')
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
});
