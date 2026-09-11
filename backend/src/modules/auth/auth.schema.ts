import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('that email looks fake ngl'),
  password: z.string().min(1, 'password required'),
});
