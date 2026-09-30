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

    // 1. Get or create Wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
    });
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId: user.id, coins: 50, credit: 0 }, // give initial 50 coins welcome bonus
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

    // 2. Get or create StreakProgress
    let streak = await prisma.streakProgress.findUnique({
      where: { userId: user.id },
    });
    if (!streak) {
      streak = await prisma.streakProgress.create({
        data: { userId: user.id, count: 0, rewardIssued: false },
      });
    }

    // Check 60-day window
    const now = new Date();
    const windowStartMs = new Date(streak.windowStart).getTime();
    const daysSinceStart = Math.floor((now.getTime() - windowStartMs) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 60 - daysSinceStart);

    // 3. Ensure Welcome Coupon exists (Feature 1.5)
    const existingWelcome = await prisma.coupon.findFirst({
      where: { userId: user.id, code: { startsWith: 'WELCOME' } },
    });
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

    // 4. Fetch Active Coupons
    const activeCoupons = await prisma.coupon.findMany({
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
    });

    // 5. Completed bookings count for player tier
    const completedBookingsCount = await prisma.booking.count({
      where: {
        userId: user.id,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
    });

    const tierInfo = calculatePlayerTier(completedBookingsCount);

    // 6. Game tokens available (unplayed sessions)
    const unplayedTokensCount = await prisma.gameSession.count({
      where: {
        userId: user.id,
        isVerified: false,
        score: 0,
      },
    });

    // 7. Recent Coin Ledger
    const ledger = await prisma.coinLedger.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      wallet: {
        coins: wallet.coins,
        credit: wallet.credit,
      },
      streak: {
        count: streak.count,
        target: 5,
        daysRemaining,
        rewardIssued: streak.rewardIssued,
        windowStart: streak.windowStart,
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
