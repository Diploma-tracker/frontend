import type { ComponentProps, ReactNode } from 'react';

import { Field, FieldDescription, FieldError, FieldLabel } from '@repo/ui-kit/components/common/form/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from '@repo/ui-kit/components/input-group';

interface TextFormFieldProps extends ComponentProps<typeof InputGroupInput> {
  description?: string;
  label?: string;
  addons?: Addon[];
  error?: ReactNode;
  invalid?: boolean;
}

type AddonAlign = ComponentProps<typeof InputGroupAddon>['align'];

type TextAddon = {
  type: 'text';
  align?: AddonAlign;
  text: string;
};

type ActionAddon = {
  type: 'action';
  align?: AddonAlign;
  render: (AddonActionButton: typeof InputGroupButton) => ReactNode;
};

type CustomAddon = {
  type: 'custom';
  align?: AddonAlign;
  content: ReactNode;
};

type Addon = TextAddon | ActionAddon | CustomAddon;

export const TextFormField = (props: TextFormFieldProps) => {
  const { description, label, addons = [], error, invalid, ...inputProps } = props;

  const ariaInvalid = inputProps['aria-invalid'];
  const isInvalid = invalid ?? (Boolean(error) || ariaInvalid === true || ariaInvalid === 'true');

  const renderAddon = (addon: Addon): ReactNode => {
    switch (addon.type) {
      case 'text':
        return <InputGroupText className="text-xs text-muted-foreground">{addon.text}</InputGroupText>;
      case 'action':
        return addon.render(InputGroupButton);
      case 'custom':
        return addon.content;
      default:
        return null;
    }
  };

  return (
    <Field data-invalid={isInvalid || undefined}>
      {label && <FieldLabel htmlFor={label}>{label}</FieldLabel>}

      <InputGroup>
        <InputGroupInput id={label} aria-label={label || ''} aria-invalid={isInvalid || undefined} {...inputProps} />

        {addons.map((addon, index) => (
          <InputGroupAddon key={index} align={addon.align}>
            {renderAddon(addon)}
          </InputGroupAddon>
        ))}
      </InputGroup>

      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
};
