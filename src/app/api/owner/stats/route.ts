import { unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/require-role';
import { revalidateOwnerStats } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const guard = await requireRole(['OWNER']);
    if (guard.error) return guard.error;
    const user = guard.user;

    // Facilities owned by this user
    const facilities = await unstable_cache(
      () => prisma.facility.findMany({
        where: { ownerId: user.id },
        include: {
          courts: { select: { id: true, name: true, sportType: true, isActive: true, pricePerHour: true } },
        },
      }),
      [`owner-facilities-${user.id}`],
      { revalidate: 60, tags: [`owner-stats-${user.id}`] }
    )();

    const facilityIds = facilities.map((f) => f.id);
    const courtIds = facilities.flatMap((f) => f.courts.map((c) => c.id));

    // Active courts count
    const totalActiveCourts = facilities.flatMap((f) => f.courts).filter((c) => c.isActive).length;

    // Use aggregation for KPIs instead of fetching all bookings
    const [totalBookingsCount, totalEarningsResult, bookingTrendsRaw, peakHoursRaw, todaysBookings] = await Promise.all([
      unstable_cache(
        () => prisma.booking.count({
          where: {
            courtId: { in: courtIds },
            status: { not: 'CANCELLED' },
          },
        }),
        [`owner-bookings-count-${user.id}`],
        { revalidate: 60, tags: [`owner-stats-${user.id}`] }
      )(),
      unstable_cache(
        () => prisma.booking.aggregate({
          _sum: { totalAmount: true },
          where: {
            courtId: { in: courtIds },
            status: { not: 'CANCELLED' },
          },
        }),
        [`owner-earnings-${user.id}`],
        { revalidate: 60, tags: [`owner-stats-${user.id}`] }
      )(),
      // Booking trends - aggregate only
      unstable_cache(
        () => prisma.booking.groupBy({
          by: ['date'],
          _count: { id: true },
          _sum: { totalAmount: true },
          where: {
            courtId: { in: courtIds },
            status: { not: 'CANCELLED' },
            date: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            },
          },
        }),
        [`owner-trends-${user.id}`],
        { revalidate: 60, tags: [`owner-stats-${user.id}`] }
      )(),
      // Peak hours - aggregate only
      unstable_cache(
        () => prisma.booking.groupBy({
          by: ['startTime'],
          _count: { id: true },
          where: {
            courtId: { in: courtIds },
            status: { not: 'CANCELLED' },
          },
        }),
        [`owner-peak-hours-${user.id}`],
        { revalidate: 60, tags: [`owner-stats-${user.id}`] }
      )(),
      // Today's bookings - limited to 20, shorter cache
      unstable_cache(
        () => prisma.booking.findMany({
          where: {
            courtId: { in: courtIds },
            date: new Date().toISOString().split('T')[0],
          },
          include: {
            court: { select: { name: true, sportType: true } },
            user: { select: { name: true, phone: true } },
          },
          orderBy: { startTime: 'asc' },
          take: 20,
        }),
        [`owner-today-${user.id}`],
        { revalidate: 10, tags: [`owner-stats-${user.id}`] }
      )(),
    ]);

    const totalEarnings = totalEarningsResult._sum.totalAmount || 0;

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

    bookingTrendsRaw.forEach((bt: any) => {
      if (daysMap[bt.date]) {
        daysMap[bt.date].bookings += bt._count?.id || 0;
        daysMap[bt.date].revenue += bt._sum?.totalAmount || 0;
      }
    });

    const bookingTrends = Object.values(daysMap);

    // 2. Earnings & Bookings summary by Sport / Court - use aggregation
    const sportEarningsRaw = await prisma.booking.groupBy({
      by: ['courtId'],
      _count: { id: true },
      _sum: { totalAmount: true },
      where: {
        courtId: { in: courtIds },
        status: { not: 'CANCELLED' },
      },
    });

    const sportEarningsMap: Record<string, { sport: string; revenue: number; bookings: number }> = {};
    sportEarningsRaw.forEach((se) => {
      const court = facilities.flatMap(f => f.courts).find(c => c.id === se.courtId);
      const sport = court?.sportType || 'Other';
      if (!sportEarningsMap[sport]) {
        sportEarningsMap[sport] = { sport, revenue: 0, bookings: 0 };
      }
      sportEarningsMap[sport].revenue += se._sum.totalAmount || 0;
      sportEarningsMap[sport].bookings += se._count.id;
    });
    const earningsSummary = Object.values(sportEarningsMap);

    // 3. Peak Booking Hours (Area / Heatmap data)
    const hourMap: Record<string, { hour: string; label: string; count: number }> = {};
    for (let h = 6; h <= 23; h++) {
      const hStr = `${h.toString().padStart(2, '0')}:00`;
      const label = h >= 12 ? `${h === 12 ? 12 : h - 12} PM` : `${h} AM`;
      hourMap[hStr] = { hour: hStr, label, count: 0 };
    }

    peakHoursRaw.forEach((ph: any) => {
      if (hourMap[ph.startTime]) {
        hourMap[ph.startTime].count += ph._count?.id || 0;
      }
    });

    const peakHours = Object.values(hourMap);

    // 4. Upcoming today bookings for calendar / schedule
    const formattedTodaysBookings = todaysBookings.map((b) => ({
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
      todaysBookings: formattedTodaysBookings,
      facilities,
    });
  } catch (error) {
    console.error('Owner stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch owner statistics' }, { status: 500 });
  }
}
