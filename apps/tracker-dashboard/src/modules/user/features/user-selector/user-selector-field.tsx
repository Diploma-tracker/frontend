import type { UserOption } from '@/modules/defense';
import { useSyncArrayFieldWithMultiSelect } from '@/shared/components/form/multi-select';
import type { FieldArrayAtom } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import { Field, FieldDescription, FieldError, FieldLabel } from '@repo/ui-kit/components/common/form/field';

import { UserSelector } from './user-selector';

interface UserSelectorFieldProps {
  field?: FieldArrayAtom<string, string>;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const UserSelectorField = reatomComponent(function UserSelectorField({
  field,
  label,
  description,
}: UserSelectorFieldProps) {
  const handleChange = useSyncArrayFieldWithMultiSelect<UserOption>(field!);

  const fieldValidation = field?.validation();
  const error = fieldValidation?.error as string | undefined;
  const invalid = !!(fieldValidation?.triggered && error);

  return (
    <Field data-invalid={invalid || undefined}>
      {label && <FieldLabel>{label}</FieldLabel>}

      <UserSelector handleChange={handleChange} />

      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
});
