import { router } from '@/app/config/router';
import { t } from '@/shared/utils/i18n';
import { reatomForm, wrap } from '@reatom/core';
import { z } from 'zod';

import { toast } from '@repo/ui-kit/components/common/floating/sonner';

import { loginAction } from './login-action';

const loginSchema = z.object({
  email: z.email(t('auth.login.validation.invalidEmail')),
  //TODO: Uncomment this when the backend will be ready to validate university emails
  // .endsWith('khpi.edu.ua', 'This must be a valid university email address!'),
  password: z.string().min(1, t('auth.login.validation.passwordRequired')),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const loginForm = reatomForm(
  {
    email: '',
    password: '',
  },
  {
    onSubmit: async (values) => {
      try {
        await wrap(
          loginAction({ credential: values.email, password: values.password }),
        );
        router.navigate({ to: '/' });
        toast.success(t('auth.login.toast.loginSuccess'));
      } catch (error) {
        toast.error(t('auth.login.toast.loginError'));
        throw error;
      }
    },
    schema: loginSchema,
    validateOnBlur: true,
    name: 'loginForm',
  },
);
