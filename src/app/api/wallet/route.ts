export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'USER') return NextResponse.json({ error: 'Player account required' }, { status: 403 });

    const [wallet, coinLedger] = await Promise.all([
      prisma.wallet.findUnique({ where: { userId: user.id }, select: { coins: true, credit: true, updatedAt: true } }),
      prisma.coinLedger.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 20 }),
    ]);
    return NextResponse.json({ wallet: wallet ?? { coins: 0, credit: 0 }, coinLedger });
  } catch (error) {
    console.error('Error in /api/wallet:', error);
    return NextResponse.json({ error: 'Failed to retrieve wallet' }, { status: 500 });
  }
}
