import { z } from 'zod';

export function isBookableDate(value: string, today = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return false;
  return value >= today.toISOString().slice(0, 10);
}

export const CreateBookingSchema = z.object({
  courtId: z.string().min(1, 'Court ID is required'),
  date: z.string().refine(isBookableDate, 'Choose today or a future date'),
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
