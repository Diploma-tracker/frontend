import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .email('This is an invalid email address!')
    .endsWith('khpi.edu.ua', 'This must be a valid university email address!'),
  password: z.string().min(1, 'This field is required!'),
});
