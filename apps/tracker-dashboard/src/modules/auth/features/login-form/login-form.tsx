// import MicrosoftLogo from '@/shared/assets/icons/microsoft-logo.svg?react';
import { useTranslation } from 'react-i18next';

import { PasswordFormField, TextFormField } from '@/shared/components';
import { CircleNotchIcon, MicrosoftOutlookLogoIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { Field, FieldGroup } from '@repo/ui-kit/components/common/form/field';

import { loginForm } from '../../models/login-form-model';

export const LoginForm = reatomComponent(function LoginForm() {
  const { t } = useTranslation();

  const { submit, fields } = loginForm;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void loginForm.submit();
  };

  return (
    <form className="p-6 md:p-8" onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">{t('auth.login.title')}</h1>
          <p className="text-balance text-muted-foreground">{t('auth.login.subtitle')}</p>
        </div>

        <TextFormField
          field={fields.email}
          type="email"
          label={t('auth.login.emailLabel')}
          placeholder="Name.Surname@cs.khpi.edu.ua"
          autoComplete="email"
          addons={[
            { type: 'custom', content: <MicrosoftOutlookLogoIcon /> },
            {
              type: 'text',
              align: 'inline-end',
              text: 'khpi.edu.ua',
            },
          ]}
        />

        <PasswordFormField
          field={fields.password}
          label={t('auth.login.passwordLabel')}
          showPasswordAriaLabel={t('user.password.show')}
          hidePasswordAriaLabel={t('user.password.hide')}
        />

        <Field>
          <Button variant="solid" intent="primary" type="submit" disabled={!submit.ready()}>
            {!submit.ready() ? <CircleNotchIcon className="ml-2 animate-spin" /> : t('auth.login.loginButton')}
          </Button>
        </Field>

        {/* TODO: Uncomment this when the backend will be ready to validate university emails */}
        {/* <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">Or continue with</FieldSeparator>

        <Field>
          <Button variant="outline" type="button">
            <MicrosoftLogo />
            Login with Microsoft
          </Button>
        </Field> */}
      </FieldGroup>
    </form>
  );
});
