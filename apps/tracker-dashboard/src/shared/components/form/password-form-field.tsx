import { useState, type ComponentProps } from 'react';

import { EyeIcon, EyeSlashIcon, LockSimpleIcon } from '@phosphor-icons/react';

import { TextFormField } from './text-form-field';

export const PasswordFormField = (props: Omit<ComponentProps<typeof TextFormField>, 'type'>) => {
  const [showPassword, setShowPassword] = useState(false);

  const type = showPassword ? 'text' : 'password';
  const ariaLabel = showPassword ? 'Hide password' : 'Show password';

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

  return <TextFormField type={type} autoComplete="current-password" addons={addons} {...props} />;
};
