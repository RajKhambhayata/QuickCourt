import { unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/require-role';
import { revalidateAdminStats } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const guard = await requireRole(['ADMIN']);
    if (guard.error) return guard.error;
    const user = guard.user;

    const [
      totalUsers,
      totalOwners,
      totalBookings,
      totalActiveCourts,
      pendingApprovals,
      openReports,
      totalGMV,
      bookingTrends,
      mostActiveSports,
      facilities,
      users,
      reports,
    ] = await Promise.all([
      unstable_cache(
        () => prisma.user.count({ where: { role: 'USER' } }),
        ['admin-stats-users'],
        { revalidate: 300, tags: ['admin-stats'] }
      )(),
      unstable_cache(
        () => prisma.user.count({ where: { role: 'OWNER' } }),
        ['admin-stats-owners'],
        { revalidate: 300, tags: ['admin-stats'] }
      )(),
      unstable_cache(
        () => prisma.booking.count(),
        ['admin-stats-bookings'],
        { revalidate: 300, tags: ['admin-stats'] }
      )(),
      unstable_cache(
        () => prisma.court.count({ where: { isActive: true } }),
        ['admin-stats-courts'],
        { revalidate: 300, tags: ['admin-stats'] }
      )(),
      unstable_cache(
        () => prisma.facility.count({ where: { status: 'PENDING' } }),
        ['admin-stats-pending'],
        { revalidate: 60, tags: ['admin-stats'] }
      )(),
      unstable_cache(
        () => prisma.report.count({ where: { status: 'PENDING' } }),
        ['admin-stats-reports'],
        { revalidate: 60, tags: ['admin-stats'] }
      )(),
      unstable_cache(
        () => prisma.booking.aggregate({
          _sum: { totalAmount: true },
          where: { status: { not: 'CANCELLED' } },
        }).then(r => r._sum.totalAmount || 0),
        ['admin-stats-gmv'],
        { revalidate: 300, tags: ['admin-stats'] }
      )(),
      // Booking trends - only aggregate data, not full records
      unstable_cache(
        () => prisma.booking.groupBy({
          by: ['date'],
          _count: { id: true },
          _sum: { totalAmount: true },
          where: {
            date: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            },
            status: { not: 'CANCELLED' },
          },
        }),
        ['admin-stats-trends'],
        { revalidate: 300, tags: ['admin-stats'] }
      )(),
      // Most active sports - aggregate only
      unstable_cache(
        () => prisma.booking.groupBy({
          by: ['courtId'],
          _count: { id: true },
          where: { status: { not: 'CANCELLED' } },
          orderBy: {
            _count: {
              courtId: 'desc',
            },
          },
          take: 10,
        }),
        ['admin-stats-sports'],
        { revalidate: 300, tags: ['admin-stats'] }
      )(),
      // Facilities - paginated
      unstable_cache(
        () => prisma.facility.findMany({
          take: 50,
          orderBy: { createdAt: 'desc' },
          include: {
            owner: { select: { name: true, email: true } },
            courts: { select: { id: true, name: true, isActive: true } },
          },
        }),
        ['admin-stats-facilities'],
        { revalidate: 300, tags: ['admin-stats'] }
      )(),
      // Users - paginated
      unstable_cache(
        () => prisma.user.findMany({
          take: 50,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
            phone: true,
            status: true,
            isVerified: true,
            createdAt: true,
            _count: { select: { bookings: true, facilities: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        ['admin-stats-users-list'],
        { revalidate: 300, tags: ['admin-stats'] }
      )(),
      // Reports - paginated
      unstable_cache(
        () => prisma.report.findMany({
          take: 20,
          include: { reportedBy: { select: { name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        }),
        ['admin-stats-reports-list'],
        { revalidate: 60, tags: ['admin-stats'] }
      )(),
    ]);

    // Format booking trends
    const daysMap: Record<string, { date: string; bookings: number; revenue: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      daysMap[dateStr] = { date: dateStr, bookings: 0, revenue: 0 };
    }

    bookingTrends.forEach((bt: any) => {
      if (daysMap[bt.date]) {
        daysMap[bt.date].bookings += bt._count?.id || 0;
        daysMap[bt.date].revenue += bt._sum?.totalAmount || 0;
      }
    });

    const formattedBookingTrends = Object.values(daysMap);

    // Get sport names for most active sports
    const courtIds = mostActiveSports.map(m => m.courtId);
    const courts = await prisma.court.findMany({
      where: { id: { in: courtIds } },
      select: { id: true, sportType: true },
    });

    const sportCounts: Record<string, number> = {};
    mostActiveSports.forEach((m: any) => {
      const court = courts.find(c => c.id === m.courtId);
      const sport = court?.sportType || 'Other';
      sportCounts[sport] = (sportCounts[sport] || 0) + (m._count?.id || 0);
    });

    const formattedMostActiveSports = Object.entries(sportCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // User registration trends
    const playerUsers = users.filter(u => u.role === 'USER');
    const ownerUsers = users.filter(u => u.role === 'OWNER');

    const regTrends = [
      { month: 'Recent Active', players: playerUsers.length, owners: ownerUsers.length },
      { month: 'Total Registered', players: totalUsers, owners: totalOwners },
    ];

    // Facility approval breakdown
    const approvalBreakdown = [
      { status: 'Approved', count: facilities.filter((f) => f.status === 'APPROVED').length },
      { status: 'Pending', count: facilities.filter((f) => f.status === 'PENDING').length },
      { status: 'Rejected', count: facilities.filter((f) => f.status === 'REJECTED').length },
    ];

    return NextResponse.json({
      kpis: {
        totalUsers,
        totalOwners,
        totalBookings,
        totalActiveCourts,
        totalGMV,
        pendingApprovals,
        openReports,
      },
      charts: {
        bookingTrends: formattedBookingTrends,
        regTrends,
        approvalBreakdown,
        mostActiveSports: formattedMostActiveSports,
      },
      facilities: facilities.map((f) => {
        const safeJson = (val: string | null) => {
          if (!val) return [];
          try { return JSON.parse(val); } catch { return []; }
        };
        return {
          ...f,
          images: safeJson(f.images),
          sports: safeJson(f.sports),
          amenities: safeJson(f.amenities),
        };
      }),
      users,
      reports,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
