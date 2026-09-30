import { z } from 'zod';

export const SignupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long'),
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  phone: z.string().min(10, 'A valid phone number in international format (e.g. +919876543210) is required'),
  role: z.enum(['USER', 'OWNER', 'ADMIN']).default('USER'),
  avatar: z.string().url().optional(),
  facilityName: z.string().optional(),
});

export type SignupInput = z.infer<typeof SignupSchema>;

export const VerifyOtpSchema = z.object({
  email: z.string().trim().email(),
  otp: z.string().trim().length(6, 'Verification code must be 6 digits'),
});

export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
