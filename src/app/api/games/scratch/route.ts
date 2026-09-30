import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { randomUUID } from 'crypto';

interface ScratchPrize {
  id: string;
  name: string;
  emoji: string;
  type: 'COINS' | 'COUPON' | 'FOOD_ITEM';
  value: number;
  weight: number;
  description: string;
}

const SCRATCH_PRIZES: ScratchPrize[] = [
  { id: 'sc_coins_30', name: '30 Court Coins', emoji: '🪙', type: 'COINS', value: 30, weight: 35, description: '30 Court Coins credited instantly to your wallet!' },
  { id: 'sc_drink', name: 'Free Cold Beverage', emoji: '🥤', type: 'FOOD_ITEM', value: 60, weight: 20, description: '1 Free Chilled Drink / Fresh Lime Soda at partner food courts' },
  { id: 'sc_coins_60', name: '60 Court Coins', emoji: '⚡', type: 'COINS', value: 60, weight: 20, description: '60 Court Coins credited to your wallet!' },
  { id: 'sc_disc_75', name: '₹75 Off Next Booking', emoji: '💰', type: 'COUPON', value: 75, weight: 15, description: 'Flat ₹75 discount on your next court booking' },
  { id: 'sc_jackpot', name: '150 Court Coins Mega Card', emoji: '🏆', type: 'COINS', value: 150, weight: 10, description: 'Mega Card! 150 Court Coins added to your wallet' },
];

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please login to view scratch cards' }, { status: 401 });
    }

    // Check completed/confirmed bookings count vs already scratched cards
    const bookingsCount = await prisma.booking.count({
      where: {
        userId: user.id,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
    });

    const scratchedCount = await prisma.gameSession.count({
      where: {
        userId: user.id,
        gameType: 'SCRATCH_CARD',
        isVerified: true,
      },
    });

    // Each booking earns 1 scratch card. Also give 1 starter scratch card to every registered user!
    const totalEarned = bookingsCount + 1; // +1 starter card
    const availableCards = Math.max(0, totalEarned - scratchedCount);

    return NextResponse.json({
      availableCards,
      totalEarned,
      scratchedCount,
    });
  } catch (error) {
    console.error('Error in GET /api/games/scratch:', error);
    return NextResponse.json({ error: 'Failed to fetch scratch cards' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please login to reveal scratch card' }, { status: 401 });
    }

    const bookingsCount = await prisma.booking.count({
      where: {
        userId: user.id,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
    });

    const scratchedCount = await prisma.gameSession.count({
      where: {
        userId: user.id,
        gameType: 'SCRATCH_CARD',
        isVerified: true,
      },
    });

    const totalEarned = bookingsCount + 1;
    const availableCards = Math.max(0, totalEarned - scratchedCount);

    if (availableCards <= 0) {
      return NextResponse.json(
        { error: 'No scratch cards remaining. Book another court to unlock new scratch cards!' },
        { status: 400 }
      );
    }

    // Select random prize
    const totalWeight = SCRATCH_PRIZES.reduce((sum, p) => sum + p.weight, 0);
    let rand = Math.random() * totalWeight;
    let selectedPrize = SCRATCH_PRIZES[0];

    for (const p of SCRATCH_PRIZES) {
      if (rand < p.weight) {
        selectedPrize = p;
        break;
      }
      rand -= p.weight;
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      let coupon = null;

      if (selectedPrize.type === 'COINS') {
        await tx.wallet.upsert({
          where: { userId: user.id },
          create: { userId: user.id, coins: selectedPrize.value },
          update: { coins: { increment: selectedPrize.value } },
        });

        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 6);

        await tx.coinLedger.create({
          data: {
            userId: user.id,
            type: 'EARN',
            amount: selectedPrize.value,
            description: `Scratch Card: Won ${selectedPrize.value} Court Coins!`,
            expiresAt: expiry,
          },
        });
      } else if (selectedPrize.type === 'FOOD_ITEM') {
        const partner = await tx.partnerOutlet.findFirst({ where: { active: true } });
        const couponExpiry = new Date();
        couponExpiry.setDate(couponExpiry.getDate() + 7);

        const code = `SCRATCH-FOOD-${randomUUID().slice(0, 6).toUpperCase()}`;
        coupon = await tx.coupon.create({
          data: {
            code,
            title: selectedPrize.name,
            description: selectedPrize.description,
            type: 'FOOD_ITEM',
            value: selectedPrize.value,
            ownerType: 'PARTNER',
            partnerId: partner?.id || null,
            userId: user.id,
            expiresAt: couponExpiry,
            status: 'ACTIVE',
          },
        });
      } else if (selectedPrize.type === 'COUPON') {
        const couponExpiry = new Date();
        couponExpiry.setDate(couponExpiry.getDate() + 14);

        const code = `SCRATCH75-${randomUUID().slice(0, 6).toUpperCase()}`;
        coupon = await tx.coupon.create({
          data: {
            code,
            title: 'Scratch Card: ₹75 Off Booking',
            description: 'Flat ₹75 discount on any court booking (min ₹300)',
            type: 'FIXED',
            value: 75,
            ownerType: 'SYSTEM',
            userId: user.id,
            minBookingValue: 300,
            expiresAt: couponExpiry,
            status: 'ACTIVE',
          },
        });
      }

      const session = await tx.gameSession.create({
        data: {
          userId: user.id,
          gameType: 'SCRATCH_CARD',
          score: selectedPrize.value,
          tier: selectedPrize.name,
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
      prize: selectedPrize,
      coupon: result.coupon,
      remainingCards: availableCards - 1,
    });
  } catch (error) {
    console.error('Error in POST /api/games/scratch:', error);
    return NextResponse.json({ error: 'Failed to process scratch card' }, { status: 500 });
  }
}
