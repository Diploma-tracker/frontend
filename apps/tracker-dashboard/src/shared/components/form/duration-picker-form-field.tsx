import type { FieldAtom } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import { DurationPicker, type DurationPickerProps } from '@repo/ui-kit/components/common/form/duration-picker';
import { Field, FieldDescription, FieldError, FieldLabel } from '@repo/ui-kit/components/common/form/field';

interface DurationPickerFormFieldProps extends Omit<DurationPickerProps, 'value' | 'onChange' | 'aria-invalid'> {
  field?: FieldAtom<string>;
  label?: string;
  description?: string;
}

export const DurationPickerFormField = reatomComponent(function DurationPickerFormField({
  field,
  label,
  description,
  ...pickerProps
}: DurationPickerFormFieldProps) {
  const fieldValue = field?.() ?? 'PT0M';
  const fieldValidation = field?.validation();
  const error = fieldValidation?.error;
  const invalid = fieldValidation?.triggered && !!error;

  const handleChange = (next: string) => {
    field?.set(next);
  };

  return (
    <Field data-invalid={invalid || undefined}>
      {label && <FieldLabel htmlFor={label}>{label}</FieldLabel>}

      <DurationPicker
        id={label}
        value={fieldValue}
        onChange={handleChange}
        aria-invalid={invalid || undefined}
        {...pickerProps}
      />

      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
});
