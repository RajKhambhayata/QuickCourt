export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const season = await prisma.season.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        standings: {
          orderBy: { points: 'desc' },
          include: {
            player: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
    });

    if (!season) {
      return NextResponse.json({ success: true, season: null, standings: [] });
    }

    let rounds = [];
    try {
      rounds = JSON.parse(season.rounds);
    } catch (e) {
      rounds = [];
    }

    return NextResponse.json({
      success: true,
      season: {
        id: season.id,
        name: season.name,
        sport: season.sport,
        pointsRule: season.pointsRule,
        startDate: season.startDate,
        rounds,
      },
      standings: season.standings,
      scoringTable: [
        { pos: '1st', pts: 25 },
        { pos: '2nd', pts: 18 },
        { pos: '3rd', pts: 15 },
        { pos: '4th', pts: 12 },
        { pos: '5th', pts: 10 },
        { pos: '6th', pts: 8 },
        { pos: '7th', pts: 6 },
        { pos: '8th', pts: 4 },
        { pos: '9th', pts: 2 },
        { pos: '10th', pts: 1 },
        { pos: 'Fastest Lap', pts: '+1 Bonus' },
      ],
    });
  } catch (error) {
    console.error('Error in /api/seasons/standings:', error);
    return NextResponse.json({ error: 'Failed to load season standings' }, { status: 500 });
  }
}
