import { DatePickerFormField, TextFormField } from '@/shared/components';
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
  const { submit, fields } = createAllocationRoundForm;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit().then(() => onSuccess?.());
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <TextFormField field={fields.name} label="Name" placeholder="Round 2024-2025" autoComplete="off" />

        <DatePickerFormField field={fields.start_at} label="Start date" mode="date" placeholder="Pick start date" />

        <DatePickerFormField field={fields.end_at} label="End date" mode="date" placeholder="Pick end date" />

        <Field>
          <Button type="submit" disabled={!submit.ready()}>
            {!submit.ready() ? <CircleNotchIcon className="animate-spin" /> : 'Create'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
});
