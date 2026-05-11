import type { Setter } from '@/shared/utils/types';
import type { FieldAtom } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@repo/ui-kit/components/common/form/field';

import { GroupSelector } from './group-selector';

interface GroupSelectorFieldProps {
  field: FieldAtom<string>;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const GroupSelectorField = reatomComponent(function GroupSelectorField({
  field,
  label,
  description,
}: GroupSelectorFieldProps) {
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

      <GroupSelector value={value} setValue={setValue} />

      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
});
