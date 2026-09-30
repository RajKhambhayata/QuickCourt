import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { reason } = await request.json().catch(() => ({ reason: 'User requested cancellation' }));

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { court: { include: { facility: true } } },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check permission: user who booked, or facility owner, or admin
    const isOwner = booking.court.facility.ownerId === user.id;
    const isCustomer = booking.userId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isCustomer && !isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        paymentStatus: booking.paymentStatus === 'PAID' ? 'REFUND_PENDING' : 'CANCELLED',
        cancellationReason: reason || 'Cancelled by user',
      },
    });

    let message = 'Booking successfully cancelled.';
    if (booking.paymentStatus === 'PAID') {
      message += ' Refund will be processed according to our refund policy.';
    }

    return NextResponse.json({
      success: true,
      message,
      booking: updated,
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
}
