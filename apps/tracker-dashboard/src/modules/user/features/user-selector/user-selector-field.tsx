import type { Setter } from '@/shared/utils/types';
import type { FieldAtom } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import type { LoginTokenUserRole } from '@repo/api/model';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@repo/ui-kit/components/common/form/field';

import { UserSelector } from './user-selector';

interface UserSelectorFieldProps {
  field: FieldAtom<string>;
  label?: string;
  role?: LoginTokenUserRole;
  description?: string;
  disabled?: boolean;
}

export const UserSelectorField = reatomComponent(function UserSelectorField({
  field,
  label,
  role,
  description,
}: UserSelectorFieldProps) {
  const value = field.value();
  const setValue = ((newValue: string | null) => {
    field.set(newValue || '');
  }) as Setter<string | null>;

  const fieldValidation = field?.validation();
  const error = fieldValidation?.error as string | undefined;
  const invalid = !!(fieldValidation?.triggered && error);

  return (
    <Field data-invalid={invalid || undefined}>
      {label && <FieldLabel>{label}</FieldLabel>}

      <UserSelector role={role} value={value} setValue={setValue} />

      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
});
