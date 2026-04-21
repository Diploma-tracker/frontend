import { router } from '@/app/config/router';
import { reatomForm, withCallHook } from '@reatom/core';
import { z } from 'zod';

import { toast } from '@repo/ui-kit/components/common/floating/sonner';

import { loginAction } from './login-action';

const loginSchema = z.object({
  email: z.email('This is an invalid email address!'),
  //TODO: Uncomment this when the backend will be ready to validate university emails
  // .endsWith('khpi.edu.ua', 'This must be a valid university email address!'),
  password: z.string().min(1, 'This field is required!'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const loginForm = reatomForm(
  {
    email: '',
    password: '',
  },
  {
    onSubmit: async (values) => {
      await loginAction({ credential: values.email, password: values.password });

      router.navigate({ to: '/' });
    },
    schema: loginSchema,
    validateOnBlur: true,
    name: 'loginForm',
  }
);

loginAction.onFulfill.extend(
  withCallHook(() => {
    toast.success('Ви успішно увійшли!');
  })
);

loginAction.onReject.extend(
  withCallHook(() => {
    toast.error('Сталася помилка під час входу. Спробуйте ще раз.');
  })
);
