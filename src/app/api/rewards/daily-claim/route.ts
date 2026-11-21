export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Please login to claim daily rewards' }, { status: 401 });
    if (user.role !== 'USER') return NextResponse.json({ error: 'Player account required' }, { status: 403 });

    const now = new Date();
    const result = await prisma.$transaction(async (tx) => {
      // Account row lock makes concurrent requests across sessions serialize.
      await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${user.id} FOR UPDATE`;
      const recent = await tx.gameSession.findFirst({
        where: { userId: user.id, gameType: 'DAILY_REWARD', isVerified: true, startedAt: { gt: new Date(now.getTime() - COOLDOWN_MS) } },
        orderBy: { startedAt: 'desc' },
      });
      if (recent) return { claimed: false, nextClaimAt: new Date(recent.startedAt.getTime() + COOLDOWN_MS) };

      await tx.wallet.upsert({
        where: { userId: user.id },
        create: { userId: user.id, coins: 25, credit: 0 },
        update: { coins: { increment: 25 } },
      });
      await tx.coinLedger.create({
        data: { userId: user.id, type: 'BONUS', amount: 25, description: 'Daily streak reward' },
      });
      await tx.gameSession.create({
        data: { userId: user.id, gameType: 'DAILY_REWARD', score: 25, tier: 'Daily streak reward', isVerified: true, startedAt: now, endedAt: now },
      });
      return { claimed: true, nextClaimAt: new Date(now.getTime() + COOLDOWN_MS) };
    });

    if (!result.claimed) return NextResponse.json({ ...result, error: 'Daily reward already claimed' }, { status: 429 });
    return NextResponse.json({ success: true, coinsAwarded: 25, ...result });
  } catch (error) {
    console.error('Error in /api/rewards/daily-claim:', error);
    return NextResponse.json({ error: 'Failed to claim daily reward' }, { status: 500 });
  }
}
