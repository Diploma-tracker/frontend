import { reatomForm } from '@reatom/core';

import { loginSchema } from '../constants/shemas/login-form-shema';

export const loginForm = reatomForm(
  {
    email: '',
    password: '',
  },
  {
    onSubmit: async (values) => {
      // TODO: replace with business logic
      await new Promise((resolve) => setTimeout(resolve, 2000)).then(() => {
        console.debug(values);
      });
    },
    schema: loginSchema,
    validateOnBlur: true,
    name: 'loginForm',
  }
);
