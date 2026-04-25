import * as React from 'react';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { getLocale } from '@/shared/utils/format-date';
import type { FieldAtom } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import { DatePicker } from '@repo/ui-kit/components/common/form/date-picker';
import { Field, FieldDescription, FieldError, FieldLabel } from '@repo/ui-kit/components/common/form/field';

interface DatePickerFormFieldProps extends Omit<
  ComponentProps<typeof DatePicker>,
  'value' | 'onChange' | 'locale' | 'labels'
> {
  description?: string;
  label?: string;
  field?: FieldAtom<string>;
}

export const DatePickerFormField = reatomComponent(function DatePickerFormField(props: DatePickerFormFieldProps) {
  const { description, label, field, ...datePickerProps } = props;
  const { t } = useTranslation();

  const locale = getLocale();

  const fieldValue = field?.();
  const fieldValidation = field?.validation();
  const error = fieldValidation?.error;
  const invalid = fieldValidation?.triggered && !!error;

  // Parse date value safely
  const dateValue = React.useMemo(() => {
    if (!fieldValue || fieldValue === '') return undefined;
    try {
      const parsed = new Date(fieldValue);
      // Check if date is valid
      if (isNaN(parsed.getTime())) return undefined;
      return parsed;
    } catch {
      return undefined;
    }
  }, [fieldValue]);

  const handleChange = (date: Date | undefined) => {
    if (!field) return;

    if (date && !isNaN(date.getTime())) {
      const newValue = date.toISOString();
      if (newValue !== fieldValue) {
        field.set(newValue);
      }
    } else {
      field.set('');
    }
  };

  return (
    <Field data-invalid={invalid || undefined}>
      {label && <FieldLabel htmlFor={label}>{label}</FieldLabel>}

      <DatePicker
        id={label}
        value={dateValue}
        onChange={handleChange}
        aria-label={label || ''}
        aria-invalid={invalid || undefined}
        placeholder={t('common.datePicker.placeholder')}
        locale={locale}
        labels={{
          hours: t('common.datePicker.hours'),
          minutes: t('common.datePicker.minutes'),
          clearDate: t('common.datePicker.clearDate'),
        }}
        {...datePickerProps}
      />

      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
});
