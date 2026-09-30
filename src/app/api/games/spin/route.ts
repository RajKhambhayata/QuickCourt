import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { randomUUID } from 'crypto';

interface SpinPrize {
  id: string;
  name: string;
  emoji: string;
  type: 'COINS' | 'COUPON' | 'FOOD_ITEM';
  value: number;
  weight: number;
  description: string;
}

const SPIN_PRIZES: SpinPrize[] = [
  { id: 'coins_25', name: '25 Court Coins', emoji: '🪙', type: 'COINS', value: 25, weight: 35, description: '25 Court Coins added directly to your wallet!' },
  { id: 'coins_50', name: '50 Court Coins', emoji: '⚡', type: 'COINS', value: 50, weight: 25, description: '50 Court Coins added directly to your wallet!' },
  { id: 'food_drink', name: 'Free Chilled Drink', emoji: '🥤', type: 'FOOD_ITEM', value: 60, weight: 15, description: 'Free Cold Beverage at any Food Court partner outlet' },
  { id: 'disc_50', name: '₹50 Off Booking', emoji: '💰', type: 'COUPON', value: 50, weight: 15, description: 'Flat ₹50 discount coupon for your next court booking' },
  { id: 'coins_100', name: '100 Court Coins', emoji: '💎', type: 'COINS', value: 100, weight: 7, description: 'Mega prize! 100 Court Coins for your wallet' },
  { id: 'grand_jackpot', name: 'Grand Jackpot (200 Coins)', emoji: '🏆', type: 'COINS', value: 200, weight: 3, description: 'Jackpot! 200 Court Coins + Special Gold Player status boost' },
];

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please login to check daily spin' }, { status: 401 });
    }

    // Check last spin session in past 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const lastSpin = await prisma.gameSession.findFirst({
      where: {
        userId: user.id,
        gameType: 'SPIN_WHEEL',
        isVerified: true,
        startedAt: { gte: oneDayAgo },
      },
      orderBy: { startedAt: 'desc' },
    });

    const canSpin = !lastSpin;
    const nextSpinAt = lastSpin ? new Date(lastSpin.startedAt.getTime() + 24 * 60 * 60 * 1000) : null;

    return NextResponse.json({
      canSpin,
      nextSpinAt,
      prizes: SPIN_PRIZES.map((p, idx) => ({ ...p, segmentIndex: idx })),
    });
  } catch (error) {
    console.error('Error in GET /api/games/spin:', error);
    return NextResponse.json({ error: 'Failed to check spin status' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please login to spin the wheel' }, { status: 401 });
    }

    // Verify 24hr cooldown
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentSpin = await prisma.gameSession.findFirst({
      where: {
        userId: user.id,
        gameType: 'SPIN_WHEEL',
        isVerified: true,
        startedAt: { gte: oneDayAgo },
      },
      orderBy: { startedAt: 'desc' },
    });

    if (recentSpin) {
      const remainingMs = recentSpin.startedAt.getTime() + 24 * 60 * 60 * 1000 - Date.now();
      const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
      return NextResponse.json(
        { error: `You have already used your Daily Spin. Next spin available in ${remainingHours}h.` },
        { status: 429 }
      );
    }

    // Weighted random selection
    const totalWeight = SPIN_PRIZES.reduce((sum, p) => sum + p.weight, 0);
    let rand = Math.random() * totalWeight;
    let selectedIndex = 0;

    for (let i = 0; i < SPIN_PRIZES.length; i++) {
      if (rand < SPIN_PRIZES[i].weight) {
        selectedIndex = i;
        break;
      }
      rand -= SPIN_PRIZES[i].weight;
    }

    const prize = SPIN_PRIZES[selectedIndex];
    const now = new Date();

    // Reward processing in transaction
    const result = await prisma.$transaction(async (tx) => {
      let coupon = null;

      // 1. If coins awarded
      if (prize.type === 'COINS') {
        await tx.wallet.upsert({
          where: { userId: user.id },
          create: { userId: user.id, coins: prize.value },
          update: { coins: { increment: prize.value } },
        });

        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 6);

        await tx.coinLedger.create({
          data: {
            userId: user.id,
            type: 'EARN',
            amount: prize.value,
            description: `Daily Spin reward: Won ${prize.value} Court Coins!`,
            expiresAt: expiry,
          },
        });
      } else if (prize.type === 'FOOD_ITEM') {
        const partner = await tx.partnerOutlet.findFirst({ where: { active: true } });
        const couponExpiry = new Date();
        couponExpiry.setDate(couponExpiry.getDate() + 7);

        const code = `SPIN-FOOD-${randomUUID().slice(0, 6).toUpperCase()}`;
        coupon = await tx.coupon.create({
          data: {
            code,
            title: prize.name,
            description: prize.description,
            type: 'FOOD_ITEM',
            value: prize.value,
            ownerType: 'PARTNER',
            partnerId: partner?.id || null,
            userId: user.id,
            expiresAt: couponExpiry,
            status: 'ACTIVE',
          },
        });
      } else if (prize.type === 'COUPON') {
        const couponExpiry = new Date();
        couponExpiry.setDate(couponExpiry.getDate() + 14);

        const code = `SPIN50-${randomUUID().slice(0, 6).toUpperCase()}`;
        coupon = await tx.coupon.create({
          data: {
            code,
            title: 'Daily Spin: ₹50 Off Booking',
            description: 'Flat ₹50 discount on any court booking (min ₹200)',
            type: 'FIXED',
            value: 50,
            ownerType: 'SYSTEM',
            userId: user.id,
            minBookingValue: 200,
            expiresAt: couponExpiry,
            status: 'ACTIVE',
          },
        });
      }

      // Record verified session
      const session = await tx.gameSession.create({
        data: {
          userId: user.id,
          gameType: 'SPIN_WHEEL',
          score: prize.value,
          tier: prize.name,
          isVerified: true,
          couponId: coupon?.id || null,
          startedAt: now,
          endedAt: now,
        },
      });

      return { session, coupon };
    });

    return NextResponse.json({
      success: true,
      selectedIndex,
      prize,
      coupon: result.coupon,
      nextSpinAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    });
  } catch (error) {
    console.error('Error in POST /api/games/spin:', error);
    return NextResponse.json({ error: 'Failed to execute spin' }, { status: 500 });
  }
}
