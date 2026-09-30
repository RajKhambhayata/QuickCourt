import { z } from 'zod';

export const CreateBookingSchema = z.object({
  courtId: z.string().min(1, 'Court ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be formatted as HH:MM'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be formatted as HH:MM'),
  paymentMethod: z.enum(['UPI', 'CARD', 'NETBANKING', 'WALLET', 'PAY_AT_VENUE']).default('UPI'),
  couponCode: z.string().optional(),
  redeemCoins: z.number().int().min(0).optional(),
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

export const CancelBookingSchema = z.object({
  reason: z.string().trim().min(3, 'Cancellation reason must be provided (at least 3 characters)'),
});

export type CancelBookingInput = z.infer<typeof CancelBookingSchema>;
