import { randomUUID } from 'crypto';
import prisma from '@/lib/prisma';
import { UserSession } from '@/lib/types';
import { CreateBookingInput } from './booking.schema';
import { Prisma } from '@prisma/client';
import { awardBookingRewards } from '@/lib/rewards';

export class BookingService {
  /**
   * Create a booking with atomic overlap check inside transaction
   */
  static async createBooking(
    user: UserSession,
    input: CreateBookingInput,
    tx: Prisma.TransactionClient
  ) {
    const { courtId, date, startTime, endTime, paymentMethod } = input;

    // Fetch court and facility
    const court = await tx.court.findUnique({
      where: { id: courtId },
      include: { facility: true },
    });

    if (!court || !court.isActive || court.facility.status !== 'APPROVED') {
      const err = new Error('Court is currently unavailable');
      (err as any).status = 400;
      throw err;
    }

    const startHour = Number(startTime.slice(0, 2)) + Number(startTime.slice(3)) / 60;
    const endHour = Number(endTime.slice(0, 2)) + Number(endTime.slice(3)) / 60;
    if (startHour < court.operatingStartHour || endHour > court.operatingEndHour) {
      const err = new Error('The selected time is outside this court’s operating hours');
      (err as any).status = 400;
      throw err;
    }

    if (endHour <= startHour) {
      const err = new Error('End time must be after start time');
      (err as any).status = 400;
      throw err;
    }

    // Clean up stale PENDING_PAYMENT holds older than 10 minutes on this court/date
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    await tx.booking.updateMany({
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

    // Atomic Overlap Check 1: Confirmed / Valid Pending Bookings
    const existingBooking = await tx.booking.findFirst({
      where: {
        courtId,
        date,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
        status: { not: 'CANCELLED' },
      },
    });

    if (existingBooking) {
      const err = new Error('This time slot is already booked. Please choose another slot.');
      (err as any).status = 409;
      throw err;
    }

    // Atomic Overlap Check 2: Blocked Slots
    const blocked = await tx.blockedSlot.findFirst({
      where: {
        courtId,
        date,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    if (blocked) {
      const err = new Error(`This time slot is blocked for maintenance: ${blocked.reason}`);
      (err as any).status = 409;
      throw err;
    }

    const bookingNumber = `QC-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const durationHours = endHour - startHour;
    const baseAmount = court.pricePerHour * durationHours;

    let discount = 0;
    let appliedCouponId: string | null = null;

    // Optional Coupon Validation
    if (input.couponCode) {
      const coupon = await tx.coupon.findUnique({
        where: { code: input.couponCode.toUpperCase().trim() },
      });

      if (coupon && coupon.status === 'ACTIVE' && new Date(coupon.expiresAt) > new Date()) {
        if (!coupon.minBookingValue || baseAmount >= coupon.minBookingValue) {
          if (coupon.type === 'PERCENTAGE') {
            discount = Math.min((baseAmount * coupon.value) / 100, coupon.maxDiscount || Infinity);
          } else if (coupon.type === 'FIXED') {
            discount = Math.min(coupon.value, baseAmount);
          }
          appliedCouponId = coupon.id;
        }
      }
    }

    const totalAmount = Math.max(0, baseAmount - discount);

    const booking = await tx.booking.create({
      data: {
        bookingNumber,
        userId: user.id,
        courtId,
        date,
        startTime,
        endTime,
        totalAmount,
        appliedCouponId,
        couponDiscount: discount,
        status: 'PENDING_PAYMENT',
        paymentMethod: paymentMethod || 'UPI',
        paymentStatus: 'PENDING',
      },
      include: {
        court: {
          include: {
            facility: true,
          },
        },
      },
    });

    return booking;
  }

  /**
   * Cancel an existing booking
   */
  static async cancelBooking(
    bookingId: string,
    user: UserSession,
    reason: string,
    tx: Prisma.TransactionClient
  ) {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { court: { include: { facility: true } } },
    });

    if (!booking) {
      const err = new Error('Booking not found');
      (err as any).status = 404;
      throw err;
    }

    // Must be either the booking owner, facility owner, or admin
    const isPlayer = booking.userId === user.id;
    const isOwner = booking.court.facility.ownerId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isPlayer && !isOwner && !isAdmin) {
      const err = new Error('Unauthorized to cancel this booking');
      (err as any).status = 403;
      throw err;
    }

    if (booking.status === 'CANCELLED') {
      const err = new Error('Booking is already cancelled');
      (err as any).status = 400;
      throw err;
    }

    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason,
        paymentStatus: booking.paymentStatus === 'PAID' ? 'REFUNDED' : 'FAILED',
      },
    });

    return updated;
  }
}
