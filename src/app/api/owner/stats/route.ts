export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Facilities owned by this user
    const facilities = await prisma.facility.findMany({
      where: user.role === 'ADMIN' ? {} : { ownerId: user.id },
      include: {
        courts: true,
      },
    });

    const facilityIds = facilities.map((f) => f.id);
    const courtIds = facilities.flatMap((f) => f.courts.map((c) => c.id));

    // Active courts count
    const totalActiveCourts = facilities.flatMap((f) => f.courts).filter((c) => c.isActive).length;

    // All bookings
    const bookings = await prisma.booking.findMany({
      where: {
        courtId: { in: courtIds },
      },
      include: {
        court: true,
        user: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const confirmedBookings = bookings.filter((b) => b.status !== 'CANCELLED');
    const totalBookingsCount = confirmedBookings.length;
    const totalEarnings = confirmedBookings.reduce((acc, b) => acc + b.totalAmount, 0);

    // 1. Daily/Weekly trends (last 7 days)
    const daysMap: Record<string, { date: string; day: string; bookings: number; revenue: number }> = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = dayNames[d.getDay()];
      daysMap[dateStr] = { date: dateStr, day: dayName, bookings: 0, revenue: 0 };
    }

    confirmedBookings.forEach((b) => {
      if (daysMap[b.date]) {
        daysMap[b.date].bookings += 1;
        daysMap[b.date].revenue += b.totalAmount;
      }
    });

    const bookingTrends = Object.values(daysMap);

    // 2. Earnings & Bookings summary by Sport / Court
    const sportEarningsMap: Record<string, { sport: string; revenue: number; bookings: number }> = {};
    confirmedBookings.forEach((b) => {
      const sport = b.court.sportType || 'Other';
      if (!sportEarningsMap[sport]) {
        sportEarningsMap[sport] = { sport, revenue: 0, bookings: 0 };
      }
      sportEarningsMap[sport].revenue += b.totalAmount;
      sportEarningsMap[sport].bookings += 1;
    });
    const earningsSummary = Object.values(sportEarningsMap);

    // 3. Peak Booking Hours (Area / Heatmap data)
    const hourMap: Record<string, { hour: string; label: string; count: number }> = {};
    for (let h = 6; h <= 23; h++) {
      const hStr = `${h.toString().padStart(2, '0')}:00`;
      const label = h >= 12 ? `${h === 12 ? 12 : h - 12} PM` : `${h} AM`;
      hourMap[hStr] = { hour: hStr, label, count: 0 };
    }

    confirmedBookings.forEach((b) => {
      if (hourMap[b.startTime]) {
        hourMap[b.startTime].count += 1;
      }
    });

    const peakHours = Object.values(hourMap);

    // 4. Upcoming today bookings for calendar / schedule
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysBookings = bookings
      .filter((b) => b.date === todayStr)
      .map((b) => ({
        id: b.id,
        bookingNumber: b.bookingNumber,
        courtName: b.court.name,
        sportType: b.court.sportType,
        userName: b.user.name,
        userPhone: b.user.phone,
        time: `${b.startTime} - ${b.endTime}`,
        status: b.status,
        amount: b.totalAmount,
      }));

    return NextResponse.json({
      kpis: {
        totalBookings: totalBookingsCount,
        activeCourts: totalActiveCourts,
        totalEarnings,
        facilitiesCount: facilities.length,
      },
      bookingTrends,
      earningsSummary,
      peakHours,
      todaysBookings,
      facilities,
    });
  } catch (error) {
    console.error('Owner stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch owner statistics' }, { status: 500 });
  }
}
