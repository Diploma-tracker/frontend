import { useSyncArrayFieldWithMultiSelect } from '@/shared/components/form/multi-select';
import type { FieldArrayAtom } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import { Field, FieldDescription, FieldError, FieldLabel } from '@repo/ui-kit/components/common/form/field';

import type { GroupOption } from '../../models/group-selector-model';
import { GroupSelector } from './group-selector';

interface GroupSelectorFieldProps {
  field?: FieldArrayAtom<string, string>;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const GroupSelectorField = reatomComponent(function GroupSelectorField({
  field,
  label,
  description,
}: GroupSelectorFieldProps) {
  const handleChange = useSyncArrayFieldWithMultiSelect<GroupOption>(field!);

  const fieldValidation = field?.validation();
  const error = fieldValidation?.error as string | undefined;
  const invalid = !!(fieldValidation?.triggered && error);

  return (
    <Field data-invalid={invalid || undefined}>
      {label && <FieldLabel>{label}</FieldLabel>}

      <GroupSelector handleChange={handleChange} />

      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
});
