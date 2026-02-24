import { reatomForm, wrap } from '@reatom/core';
import { z } from 'zod';

const loginSchema = z.object({
  email: z
    .email('This is an invalid email address!')
    .endsWith('khpi.edu.ua', 'This must be a valid university email address!'),
  password: z.string().min(1, 'This field is required!'),
});

export const loginForm = reatomForm(
  {
    email: '',
    password: '',
  },
  {
    onSubmit: async (values) => {
      // TODO: replace with business logic
      wrap(
        await new Promise((resolve) => setTimeout(resolve, 2000)).then(() => {
          console.debug(values);
        })
      );
    },
    schema: loginSchema,
    validateOnBlur: true,
    name: 'loginForm',
  }
);
