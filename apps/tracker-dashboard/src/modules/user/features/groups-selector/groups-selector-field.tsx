import { useArrayFieldForMultiSelect } from '@/shared/components/form/multi-select';
import type { FieldArrayAtom } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@repo/ui-kit/components/common/form/field';

import { GroupsSelector } from './groups-selector';

interface GroupsSelectorFieldProps {
  field: FieldArrayAtom<string, string>;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const GroupsSelectorField = reatomComponent(
  function GroupsSelectorField({
    field,
    label,
    description,
  }: GroupsSelectorFieldProps) {
    const [selected, setSelected] = useArrayFieldForMultiSelect(field);

    const fieldValidation = field?.validation();
    const error = fieldValidation?.error as string | undefined;
    const invalid = !!(fieldValidation?.triggered && error);

    return (
      <Field data-invalid={invalid || undefined}>
        {label && <FieldLabel>{label}</FieldLabel>}

        <GroupsSelector selected={selected} setSelected={setSelected} />

        {description && <FieldDescription>{description}</FieldDescription>}
        {error && <FieldError>{error}</FieldError>}
      </Field>
    );
  },
);
