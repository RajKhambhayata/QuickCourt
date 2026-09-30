import { z } from 'zod';

export const ApplyCouponSchema = z.object({
  code: z.string().trim().min(1, 'Coupon code is required'),
  bookingAmount: z.number().positive('Booking amount must be positive'),
});

export type ApplyCouponInput = z.infer<typeof ApplyCouponSchema>;

export const ClaimGameRewardSchema = z.object({
  gameType: z.enum(['SMASH_RALLY', 'SPIN_WHEEL', 'SCRATCH_CARD', 'TRIVIA']),
  score: z.number().int().min(0).default(0),
  bookingId: z.string().optional(),
});

export type ClaimGameRewardInput = z.infer<typeof ClaimGameRewardSchema>;
