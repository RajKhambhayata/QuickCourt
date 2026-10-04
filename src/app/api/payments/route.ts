import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createPaymentIntent, validatePaymentConfig } from '@/lib/payment';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments
 * Create a payment intent for a booking
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'USER') return NextResponse.json({ error: 'Player account required' }, { status: 403 });

    // Validate payment configuration
    if (!validatePaymentConfig()) {
      return NextResponse.json(
        { error: 'Payment system is not properly configured' },
        { status: 503 }
      );
    }

    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Fetch booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        court: {
          include: {
            facility: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify ownership
    if (booking.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if booking is already paid
    if (booking.paymentStatus === 'PAID') {
      return NextResponse.json(
        { error: 'Booking is already paid' },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent(
      booking.totalAmount,
      'INR',
      {
        bookingId: booking.id,
        userId: user.id,
        courtId: booking.courtId,
      }
    );

    // Update booking with payment provider ID
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentProviderId: paymentIntent.id,
      },
    });

    return NextResponse.json({
      success: true,
      paymentIntent,
      booking: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        totalAmount: booking.totalAmount,
        court: booking.court.name,
        facility: booking.court.facility.name,
      },
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments
 * List payment methods (placeholder for future implementation)
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'USER') return NextResponse.json({ error: 'Player account required' }, { status: 403 });

    // Placeholder for available payment methods
    const paymentMethods = [
      {
        id: 'upi',
        name: 'UPI',
        icon: '📱',
        enabled: true,
      },
      {
        id: 'card',
        name: 'Credit/Debit Card',
        icon: '💳',
        enabled: true,
      },
      {
        id: 'netbanking',
        name: 'Net Banking',
        icon: '🏦',
        enabled: true,
      },
    ];

    return NextResponse.json({ paymentMethods });
  } catch (error) {
    console.error('Fetch payment methods error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}
