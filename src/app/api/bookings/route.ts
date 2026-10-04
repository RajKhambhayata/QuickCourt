export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createApiPipeline } from '@/modules/shared/pipeline';
import { CreateBookingSchema, BookingService } from '@/modules/core';
import { revalidateAvailability, revalidateBookings } from '@/lib/cache';

// GET /api/bookings — Fetch bookings for the logged-in user or owner
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filterStatus = searchParams.get('status');
    const forOwner = searchParams.get('forOwner') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    if (forOwner && user.role !== 'OWNER' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Owner access required' }, { status: 403 });
    }
    if (!forOwner && user.role !== 'USER') {
      return NextResponse.json({ error: 'Player account required' }, { status: 403 });
    }

    let where: any = {};

    if (forOwner && (user.role === 'OWNER' || user.role === 'ADMIN')) {
      const facilities = await prisma.facility.findMany({
        where: user.role === 'ADMIN' ? {} : { ownerId: user.id },
        select: { id: true },
      });
      const facilityIds = facilities.map((f) => f.id);

      where = {
        court: {
          facilityId: { in: facilityIds },
        },
      };
    } else {
      where = {
        userId: user.id,
      };
    }

    if (filterStatus && filterStatus !== 'ALL') {
      where.status = filterStatus;
    }

    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          court: {
            include: {
              facility: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                  images: true,
                  sports: true,
                  amenities: true,
                },
              },
            },
          },
          user: {
            select: { id: true, name: true, email: true, phone: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    const formatted = bookings.map((b) => ({
      ...b,
      court: {
        ...b.court,
        facility: {
          ...b.court.facility,
          images: JSON.parse(b.court.facility.images || '[]'),
          sports: JSON.parse(b.court.facility.sports || '[]'),
          amenities: JSON.parse(b.court.facility.amenities || '[]'),
        },
      },
    }));

    return NextResponse.json({
      bookings: formatted,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

// POST /api/bookings — Create booking using the Shared Pipeline (Zod validation, atomic transaction, overlap check)
export const POST = createApiPipeline({
  roles: ['USER'],
  schema: CreateBookingSchema,
  transactional: true,
  audit: {
    action: 'BOOKING_CREATE',
    resource: 'BOOKING',
    resourceId: (ctx) => ctx.result?.id,
    details: (ctx) => ({
      bookingNumber: ctx.result?.bookingNumber,
      courtId: ctx.body?.courtId,
      date: ctx.body?.date,
      time: `${ctx.body?.startTime}-${ctx.body?.endTime}`,
      totalAmount: ctx.result?.totalAmount,
    }),
  },
  handler: async ({ user, body, tx }) => {
    const booking = await BookingService.createBooking(user, body, tx);
    return {
      success: true,
      booking: {
        ...booking,
        court: {
          ...booking.court,
          facility: {
            ...booking.court.facility,
            images: JSON.parse(booking.court.facility.images || '[]'),
            sports: JSON.parse(booking.court.facility.sports || '[]'),
            amenities: JSON.parse(booking.court.facility.amenities || '[]'),
          },
        },
      },
    };
  },
});
