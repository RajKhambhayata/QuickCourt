import prisma from '@/lib/prisma';
import { UserSession } from '@/lib/types';
import { ApplyCouponInput, ClaimGameRewardInput } from './rewards.schema';
import { Prisma } from '@prisma/client';

export class RewardsService {
  /**
   * Validate and calculate coupon discount
   */
  static async applyCoupon(input: ApplyCouponInput, user?: UserSession | null) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: input.code.toUpperCase().trim() },
    });

    if (!coupon || coupon.status !== 'ACTIVE') {
      throw new Error('Invalid or inactive coupon code');
    }

    if (new Date(coupon.expiresAt) < new Date()) {
      throw new Error('This coupon has expired');
    }

    if (coupon.userId && user && coupon.userId !== user.id) {
      throw new Error('This coupon is assigned to another user');
    }

    if (coupon.minBookingValue && input.bookingAmount < coupon.minBookingValue) {
      throw new Error(`Minimum booking amount of ₹${coupon.minBookingValue} required for this coupon`);
    }

    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = (input.bookingAmount * coupon.value) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else if (coupon.type === 'FIXED') {
      discount = Math.min(coupon.value, input.bookingAmount);
    }

    return {
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      title: coupon.title,
      discount,
      finalAmount: Math.max(0, input.bookingAmount - discount),
    };
  }

  /**
   * Get user wallet, coins, and available coupons
   */
  static async getUserRewardsOverview(userId: string) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    const coupons = await prisma.coupon.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
        OR: [{ userId }, { userId: null }],
      },
      orderBy: { expiresAt: 'asc' },
    });

    const streak = await prisma.streakProgress.findUnique({
      where: { userId },
    });

    return {
      coins: wallet?.coins || 0,
      credit: wallet?.credit || 0,
      activeCoupons: coupons,
      streakCount: streak?.count || 0,
    };
  }
}
