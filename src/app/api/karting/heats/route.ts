import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toISOString().slice(0, 10);

    const heats = await prisma.kartHeat.findMany({
      where: { date },
      orderBy: { startTime: 'asc' },
      include: {
        lapRecords: {
          take: 3,
          orderBy: { timeMs: 'asc' },
          include: { user: { select: { name: true } } },
        },
      },
    });

    const enriched = heats.map((h) => ({
      ...h,
      seatsRemaining: Math.max(0, h.capacity - h.seatsTaken),
      isFull: h.seatsTaken >= h.capacity,
    }));

    return NextResponse.json({
      success: true,
      date,
      heats: enriched,
    });
  } catch (error) {
    console.error('Error fetching kart heats:', error);
    return NextResponse.json({ error: 'Failed to retrieve karting heats' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please login to book a karting heat' }, { status: 401 });
    }

    const body = await req.json();
    const { heatId, seats = 1, waiverAccepted = false } = body;

    const requestedSeats = Math.max(1, Number(seats) || 1);

    if (!waiverAccepted) {
      return NextResponse.json(
        { error: 'You must sign/accept the digital racing safety waiver before booking.' },
        { status: 400 }
      );
    }

    const heat = await prisma.kartHeat.findUnique({
      where: { id: heatId },
    });

    if (!heat) {
      return NextResponse.json({ error: 'Selected kart heat not found' }, { status: 404 });
    }

    if (heat.seatsTaken + requestedSeats > heat.capacity) {
      return NextResponse.json(
        { error: `Only ${heat.capacity - heat.seatsTaken} seats remaining in this heat.` },
        { status: 409 }
      );
    }

    // Update heat seats
    const updatedHeat = await prisma.kartHeat.update({
      where: { id: heatId },
      data: {
        seatsTaken: { increment: requestedSeats },
        status: heat.seatsTaken + requestedSeats >= heat.capacity ? 'FULL' : 'OPEN',
      },
    });

    // Also award Court Coins for the karting booking!
    const totalAmount = heat.pricePerSeat * requestedSeats;
    const coinsEarned = Math.floor(totalAmount / 10);

    await prisma.wallet.upsert({
      where: { userId: user.id },
      update: { coins: { increment: coinsEarned } },
      create: { userId: user.id, coins: coinsEarned, credit: 0 },
    });

    await prisma.coinLedger.create({
      data: {
        userId: user.id,
        type: 'EARN',
        amount: coinsEarned,
        description: `Earned ${coinsEarned} coins for Karting Heat #${heat.startTime} at ${heat.trackName}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully booked ${requestedSeats} seat(s) for ${heat.trackName} at ${heat.startTime}!`,
      heat: updatedHeat,
      coinsEarned,
      waiverSigned: true,
    });
  } catch (error) {
    console.error('Error booking kart heat:', error);
    return NextResponse.json({ error: 'Failed to book karting heat' }, { status: 500 });
  }
}
