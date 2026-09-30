import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { verifySmashRallyTaps, getTierForScore } from '@/lib/rewards';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, score, tapLog } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    // Retrieve active game session
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json({ error: 'Game session not found' }, { status: 404 });
    }

    if (session.userId !== user.id) {
      return NextResponse.json({ error: 'Access forbidden: session belongs to another player' }, { status: 403 });
    }

    if (session.isVerified) {
      return NextResponse.json({ error: 'This game session has already been submitted and scored' }, { status: 400 });
    }

    // 1. Anti-cheat server validation
    const verification = verifySmashRallyTaps(tapLog || [], Number(score) || 0);
    const finalScore = verification.isValid ? verification.calculatedScore : Math.min(150, Number(score) || 0);

    // 2. Determine reward tier
    const tier = getTierForScore(finalScore);

    // 3. Select a partner food outlet for food coupons
    let partner = await prisma.partnerOutlet.findFirst({
      where: { active: true },
    });

    let issuedCoupon = null;
    const now = new Date();

    // If tier yields a food voucher or discount, issue Coupon
    if (tier.couponValue > 0) {
      const couponExpiry = new Date();
      couponExpiry.setDate(couponExpiry.getDate() + tier.validDays);

      const codeSuffix = randomUUID().slice(0, 6).toUpperCase();
      const code = `FOOD-${codeSuffix}`;

      issuedCoupon = await prisma.coupon.create({
        data: {
          code,
          title: tier.couponTitle,
          description: `${tier.itemDescription} (Unlocked via Smash Rally score ${finalScore})`,
          type: tier.couponType,
          value: tier.couponValue,
          ownerType: 'PARTNER',
          partnerId: partner ? partner.id : null,
          userId: user.id,
          expiresAt: couponExpiry,
          status: 'ACTIVE',
          gameSessionId: session.id,
        },
        include: {
          partnerOutlet: true,
        },
      });
    }

    // If tier awards bonus coins, deposit to wallet & ledger
    if (tier.bonusCoins > 0) {
      await prisma.wallet.upsert({
        where: { userId: user.id },
        update: { coins: { increment: tier.bonusCoins } },
        create: { userId: user.id, coins: tier.bonusCoins, credit: 0 },
      });

      const coinExpiry = new Date();
      coinExpiry.setMonth(coinExpiry.getMonth() + 6);

      await prisma.coinLedger.create({
        data: {
          userId: user.id,
          type: 'BONUS',
          amount: tier.bonusCoins,
          description: `Reward for Smash Rally score ${finalScore} (${tier.tierName})`,
          expiresAt: coinExpiry,
        },
      });
    }

    // Mark session verified and complete
    await prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        score: finalScore,
        tier: tier.tierName,
        tapLog: JSON.stringify(tapLog || []),
        isVerified: true,
        endedAt: now,
        couponId: issuedCoupon ? issuedCoupon.id : null,
      },
    });

    return NextResponse.json({
      success: true,
      verifiedScore: finalScore,
      tier: tier.tierName,
      bonusCoinsAwarded: tier.bonusCoins,
      reward: tier,
      coupon: issuedCoupon,
      partnerOutlet: partner,
    });
  } catch (error) {
    console.error('Error submitting game session:', error);
    return NextResponse.json({ error: 'Failed to process game score' }, { status: 500 });
  }
}
