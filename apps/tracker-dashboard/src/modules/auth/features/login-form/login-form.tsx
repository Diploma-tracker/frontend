import MicrosoftLogo from '@/shared/assets/icons/microsoft-logo.svg?react';
import { PasswordFormField, TextFormField } from '@/shared/components';
import { CircleNotchIcon, MicrosoftOutlookLogoIcon } from '@phosphor-icons/react';
import { bindField, reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { Field, FieldGroup, FieldSeparator } from '@repo/ui-kit/components/common/form/field';

import { loginSchema } from '../../constants/shemas/login-form-shema';
import { loginForm } from '../../models/login-form-model';

export const LoginForm = reatomComponent(function LoginForm() {
  const { submit, fields } = loginForm;

  const isFormValid = loginSchema.safeParse(loginForm()).success;
  const emailValidation = fields.email.validation();
  const passwordValidation = fields.password.validation();

  const isEmailInvalid = !!(emailValidation.triggered && emailValidation.error);
  const isPasswordInvalid = !!(passwordValidation.triggered && passwordValidation.error);

  const emailError = isEmailInvalid ? emailValidation.error : undefined;
  const passwordError = isPasswordInvalid ? passwordValidation.error : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginForm.submit();
  };

  return (
    <form className="p-6 md:p-8" onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Welcome to KHPI project tracker</h1>
          <p className="text-balance text-muted-foreground">Login to get an access to your university projects.</p>
        </div>

        <TextFormField
          {...bindField(fields.email)}
          type="email"
          label="Email"
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
          invalid={isEmailInvalid}
          error={emailError}
        />

        <PasswordFormField
          {...bindField(fields.password)}
          label="Password"
          invalid={isPasswordInvalid}
          error={passwordError}
        />

        <Field>
          <Button type="submit" disabled={!isFormValid || !submit.ready()}>
            {!submit.ready() ? <CircleNotchIcon className="ml-2 animate-spin" /> : 'Login'}
          </Button>
        </Field>

        <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">Or continue with</FieldSeparator>

        <Field>
          <Button variant="outline" type="button">
            <MicrosoftLogo />
            Login with Microsoft
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
});
