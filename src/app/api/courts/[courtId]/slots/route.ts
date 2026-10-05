export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SlotStatus } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: { courtId: string } }
) {
  try {
    const { courtId } = params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const court = await prisma.court.findUnique({
      where: { id: courtId },
      include: { facility: true },
    });

    if (!court) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 });
    }

    // 10-Minute Hold Expiry: clean up any stale pending bookings older than 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    try {
      await prisma.booking.updateMany({
        where: {
          courtId,
          date,
          status: 'PENDING_PAYMENT',
          createdAt: { lt: tenMinutesAgo },
        },
        data: {
          status: 'CANCELLED',
          cancellationReason: 'Payment window expired (10 minutes)',
        },
      });
    } catch (cleanupErr) {
      console.warn('Slot hold expiry cleanup non-fatal warning:', cleanupErr);
    }

    // Get all valid active bookings on this court for the date
    const bookings = await prisma.booking.findMany({
      where: {
        courtId,
        date,
        status: { not: 'CANCELLED' },
      },
    });

    // Get all blocked maintenance slots on this court for the date
    const blockedSlots = await prisma.blockedSlot.findMany({
      where: {
        courtId,
        date,
      },
    });

    // Generate slots
    const startHour = court.operatingStartHour || 6;
    const endHour = court.operatingEndHour || 23;
    const slots: SlotStatus[] = [];

    for (let hour = startHour; hour < endHour; hour++) {
      const startStr = `${hour.toString().padStart(2, '0')}:00`;
      const endStr = `${(hour + 1).toString().padStart(2, '0')}:00`;
      const timeLabel = `${startStr} - ${endStr}`;

      const booking = bookings.find((b) => b.startTime === startStr);
      const blocked = blockedSlots.find((b) => b.startTime === startStr);

      slots.push({
        time: timeLabel,
        startTime: startStr,
        endTime: endStr,
        isBooked: !!booking,
        isBlocked: !!blocked,
        blockedReason: blocked?.reason,
        blockedSlotId: blocked?.id,
        price: court.pricePerHour,
        bookingId: booking?.id,
      });
    }

    return NextResponse.json({
      court,
      date,
      slots,
    });
  } catch (error) {
    console.error('Fetch slots error:', error);
    return NextResponse.json({ error: 'Failed to fetch court slots' }, { status: 500 });
  }
}
