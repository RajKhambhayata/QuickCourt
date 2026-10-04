export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { calculatePlayerTier } from '@/lib/rewards';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'USER') return NextResponse.json({ error: 'Player account required' }, { status: 403 });

    const now = new Date();

    // Parallelize all independent queries
    const [wallet, streak, existingWelcome, activeCoupons, completedBookingsCount, unplayedTokensCount, ledger] = await Promise.all([
      // 1. Get or create Wallet
      prisma.wallet.findUnique({
        where: { userId: user.id },
      }),
      // 2. Get or create StreakProgress
      prisma.streakProgress.findUnique({
        where: { userId: user.id },
      }),
      // 3. Check if Welcome Coupon exists
      prisma.coupon.findFirst({
        where: { userId: user.id, code: { startsWith: 'WELCOME' } },
      }),
      // 4. Fetch Active Coupons
      prisma.coupon.findMany({
        where: {
          userId: user.id,
          status: 'ACTIVE',
          expiresAt: { gt: now },
        },
        include: {
          partnerOutlet: {
            select: { name: true, category: true, address: true, city: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      // 5. Completed bookings count for player tier
      prisma.booking.count({
        where: {
          userId: user.id,
          status: { in: ['CONFIRMED', 'COMPLETED'] },
        },
      }),
      // 6. Game tokens available (unplayed sessions)
      prisma.gameSession.count({
        where: {
          userId: user.id,
          isVerified: false,
          score: 0,
        },
      }),
      // 7. Recent Coin Ledger
      prisma.coinLedger.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Create wallet if doesn't exist
    let finalWallet = wallet;
    if (!wallet) {
      finalWallet = await prisma.wallet.create({
        data: { userId: user.id, coins: 50, credit: 0 },
      });
      // record welcome bonus
      await prisma.coinLedger.create({
        data: {
          userId: user.id,
          type: 'BONUS',
          amount: 50,
          description: 'Welcome bonus coins on QuickCourt Rewards signup',
        },
      });
    }

    // Create streak if doesn't exist
    let finalStreak = streak;
    if (!streak) {
      finalStreak = await prisma.streakProgress.create({
        data: { userId: user.id, count: 0, rewardIssued: false },
      });
    }

    if (!finalWallet || !finalStreak) {
      throw new Error('Failed to initialize wallet or streak');
    }

    // Check 60-day window
    const windowStartMs = new Date(finalStreak.windowStart).getTime();
    const daysSinceStart = Math.floor((now.getTime() - windowStartMs) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 60 - daysSinceStart);

    // Create welcome coupon if doesn't exist
    if (!existingWelcome) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      await prisma.coupon.create({
        data: {
          code: `WELCOME10-${user.id.slice(-4).toUpperCase()}`,
          title: 'Welcome Gift: 10% Off',
          description: 'Get 10% off your court booking as a new QuickCourt player!',
          type: 'PERCENTAGE',
          value: 10,
          maxDiscount: 150,
          minBookingValue: 200,
          userId: user.id,
          ownerType: 'SYSTEM',
          expiresAt: expiry,
          status: 'ACTIVE',
        },
      });
    }

    const tierInfo = calculatePlayerTier(completedBookingsCount);

    return NextResponse.json({
      success: true,
      wallet: {
        coins: finalWallet.coins,
        credit: finalWallet.credit,
      },
      streak: {
        count: finalStreak.count,
        target: 5,
        daysRemaining,
        rewardIssued: finalStreak.rewardIssued,
        windowStart: finalStreak.windowStart,
      },
      playerTier: tierInfo,
      completedBookingsCount,
      gameTokensAvailable: unplayedTokensCount,
      activeCoupons,
      coinLedger: ledger,
    });
  } catch (error) {
    console.error('Error in /api/rewards/summary:', error);
    return NextResponse.json({ error: 'Failed to retrieve rewards summary' }, { status: 500 });
  }
}
