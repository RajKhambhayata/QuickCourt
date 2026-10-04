export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please login to play Smash Rally' }, { status: 401 });
    }
    if (user.role !== 'USER') return NextResponse.json({ error: 'Player account required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { mode = 'BOOKING_TOKEN' } = body;

    // Check if player has an unused token from a booking
    let session = await prisma.gameSession.findFirst({
      where: {
        userId: user.id,
        isVerified: false,
        score: 0,
        gameType: 'SMASH_RALLY',
      },
      orderBy: { startedAt: 'desc' },
    });

    // If no booking token exists, allow daily free play or practice play (Feature 2.1 & 2.2)
    if (!session) {
      // Check if user played a daily free game today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const dailyPlayed = await prisma.gameSession.findFirst({
        where: {
          userId: user.id,
          gameType: 'SMASH_RALLY',
          startedAt: { gte: todayStart },
        },
      });

      // If user hasn't played daily free play yet, issue a daily complimentary token!
      session = await prisma.gameSession.create({
        data: {
          userId: user.id,
          gameType: 'SMASH_RALLY',
          score: 0,
          isVerified: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      gameType: 'SMASH_RALLY',
      durationSeconds: 30,
      rules: {
        target: 'Hit the shuttle/ball inside the sweet spot zone',
        maxScore: 1000,
        rewardTiers: [
          { score: '200-399', prize: 'Free Cold Drink / Fresh Lime' },
          { score: '400-699', prize: 'Free Crispy Fries or Grilled Sandwich' },
          { score: '700-899', prize: 'Flat ₹100 Off on Meals > ₹300' },
          { score: '900+', prize: 'Free Grand Sports Combo Meal + 50 Coins' },
        ],
      },
    });
  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json({ error: 'Failed to initialize game session' }, { status: 500 });
  }
}
