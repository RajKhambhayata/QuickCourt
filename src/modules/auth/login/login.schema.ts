import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  portalRole: z.enum(['USER', 'OWNER', 'ADMIN']).optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
