import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ApplyCouponSchema } from '@/modules/core';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please login to apply coupons' }, { status: 401 });
    }

    const body = await req.json();
    const { code, bookingAmount = 0, useCoins = false } = body;

    // Stage 4: Validate coupon input with Zod when code is provided
    if (code && typeof code === 'string') {
      const validation = ApplyCouponSchema.safeParse({ code, bookingAmount: Number(bookingAmount) || 0 });
      if (!validation.success) {
        const issues = (validation.error.issues || []) as any[];
        const msg = issues.map((e) => e.message).join(', ');
        return NextResponse.json({ error: msg }, { status: 400 });
      }
    }

    const amount = Number(bookingAmount) || 0;
    let couponDiscount = 0;
    let matchedCoupon = null;

    if (code && typeof code === 'string' && code.trim().length > 0) {
      const cleanCode = code.trim().toUpperCase();
      const coupon = await prisma.coupon.findUnique({
        where: { code: cleanCode },
        include: { partnerOutlet: true },
      });

      if (!coupon) {
        return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
      }

      if (coupon.status !== 'ACTIVE') {
        return NextResponse.json({ error: 'This coupon has already been used or revoked' }, { status: 400 });
      }

      if (new Date(coupon.expiresAt) < new Date()) {
        return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
      }

      if (coupon.userId && coupon.userId !== user.id) {
        return NextResponse.json({ error: 'This coupon is reserved for another player' }, { status: 403 });
      }

      if (coupon.type === 'FOOD_ITEM') {
        return NextResponse.json(
          {
            error: `This is a Food Court coupon for ${coupon.partnerOutlet?.name || 'partner outlets'}. Redeem it at the food counter or in the Food Court section!`,
          },
          { status: 400 }
        );
      }

      if (coupon.minBookingValue && amount < coupon.minBookingValue) {
        return NextResponse.json(
          { error: `Minimum booking amount of ₹${coupon.minBookingValue} required for this coupon` },
          { status: 400 }
        );
      }

      if (coupon.type === 'PERCENTAGE') {
        let disc = (amount * coupon.value) / 100;
        if (coupon.maxDiscount && disc > coupon.maxDiscount) {
          disc = coupon.maxDiscount;
        }
        couponDiscount = Math.round(disc);
      } else if (coupon.type === 'FIXED') {
        couponDiscount = Math.min(amount, coupon.value);
      }

      matchedCoupon = coupon;
    }

    // Court Coins redemption: 100 coins = ₹50 off
    let coinsToUse = 0;
    let coinsDiscount = 0;
    const remainingAfterCoupon = Math.max(0, amount - couponDiscount);

    if (useCoins) {
      const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
      const availableCoins = wallet?.coins || 0;

      if (availableCoins >= 50 && remainingAfterCoupon > 0) {
        const maxAllowedDiscount = Math.floor(remainingAfterCoupon * 0.5);
        const maxRedeemableCoins = Math.floor(maxAllowedDiscount / 50) * 100;
        coinsToUse = Math.min(availableCoins, maxRedeemableCoins > 0 ? maxRedeemableCoins : 100);

        if (coinsToUse >= 50) {
          coinsDiscount = Math.floor((coinsToUse / 100) * 50);
        }
      }
    }

    const totalDiscount = couponDiscount + coinsDiscount;
    const finalAmount = Math.max(0, amount - totalDiscount);

    return NextResponse.json({
      valid: true,
      coupon: matchedCoupon,
      couponDiscount,
      coinsApplied: coinsToUse,
      coinsDiscount,
      totalDiscount,
      finalAmount,
    });
  } catch (error) {
    console.error('Error in /api/coupons/apply:', error);
    return NextResponse.json({ error: 'Failed to apply coupon' }, { status: 500 });
  }
}
