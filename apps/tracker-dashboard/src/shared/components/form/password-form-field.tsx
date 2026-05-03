import { type ComponentProps, useState } from 'react';

import { EyeIcon, EyeSlashIcon, LockSimpleIcon } from '@phosphor-icons/react';

import { TextFormField } from './text-form-field';

type PasswordFormFieldProps = Omit<
  ComponentProps<typeof TextFormField>,
  'type'
> & {
  showPasswordAriaLabel: string;
  hidePasswordAriaLabel: string;
};

export const PasswordFormField = (props: PasswordFormFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const type = showPassword ? 'text' : 'password';
  const ariaLabel = showPassword
    ? props.hidePasswordAriaLabel
    : props.showPasswordAriaLabel;

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const addons: NonNullable<ComponentProps<typeof TextFormField>['addons']> = [
    {
      type: 'action',
      align: 'inline-end',
      render: (AddonActionButton) => (
        <AddonActionButton
          type="button"
          size="icon-xs"
          variant="ghost"
          aria-label={ariaLabel}
          onClick={handleTogglePasswordVisibility}
        >
          {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
        </AddonActionButton>
      ),
    },
    { type: 'custom', content: <LockSimpleIcon /> },
  ];

  return (
    <TextFormField
      type={type}
      autoComplete="current-password"
      addons={addons}
      {...props}
    />
  );
};
