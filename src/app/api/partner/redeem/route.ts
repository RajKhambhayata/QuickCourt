import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, outletId, staffName = 'Counter Staff' } = body;

    if (!code || !outletId) {
      return NextResponse.json({ error: 'Coupon code and outlet ID are required' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Verify outlet exists
    const outlet = await prisma.partnerOutlet.findUnique({
      where: { id: outletId },
    });

    if (!outlet) {
      return NextResponse.json({ error: 'Partner outlet not found' }, { status: 404 });
    }

    // Verify coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
      include: { user: { select: { name: true, phone: true } } },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
    }

    if (coupon.status === 'USED') {
      return NextResponse.json(
        { error: `This coupon was already redeemed at ${coupon.usedAt ? new Date(coupon.usedAt).toLocaleTimeString() : 'counter'}` },
        { status: 400 }
      );
    }

    if (coupon.status === 'EXPIRED' || new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
    }

    // Process redemption in transaction to prevent double spending
    const result = await prisma.$transaction(async (tx) => {
      const updatedCoupon = await tx.coupon.update({
        where: { id: coupon.id },
        data: {
          status: 'USED',
          usedAt: new Date(),
        },
      });

      const redemption = await tx.redemption.create({
        data: {
          couponId: coupon.id,
          outletId: outlet.id,
          staffName,
          redeemedAt: new Date(),
        },
      });

      return { updatedCoupon, redemption };
    });

    return NextResponse.json({
      success: true,
      message: `Coupon ${coupon.code} successfully redeemed!`,
      coupon: {
        code: coupon.code,
        title: coupon.title,
        description: coupon.description,
        value: coupon.value,
        playerName: coupon.user?.name,
      },
      outlet: {
        name: outlet.name,
      },
      redeemedAt: result.redemption.redeemedAt,
    });
  } catch (error) {
    console.error('Error in /api/partner/redeem:', error);
    return NextResponse.json({ error: 'Failed to process coupon redemption' }, { status: 500 });
  }
}
