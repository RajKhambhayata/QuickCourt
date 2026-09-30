export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const [
      totalUsers,
      totalOwners,
      totalBookings,
      totalActiveCourts,
      facilities,
      bookings,
      allUsers,
      reports,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'OWNER' } }),
      prisma.booking.count(),
      prisma.court.count({ where: { isActive: true } }),
      prisma.facility.findMany({
        include: {
          owner: { select: { name: true, email: true } },
          courts: true,
        },
      }),
      prisma.booking.findMany({
        include: {
          court: true,
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.findMany({
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
      prisma.report.findMany({
        include: { reportedBy: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalGMV = bookings
      .filter((b) => b.status !== 'CANCELLED')
      .reduce((acc, b) => acc + b.totalAmount, 0);

    // 1. Booking Activity Over Time (last 7 days)
    const daysMap: Record<string, { date: string; bookings: number; revenue: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      daysMap[dateStr] = { date: dateStr, bookings: 0, revenue: 0 };
    }

    bookings.forEach((b) => {
      if (daysMap[b.date]) {
        daysMap[b.date].bookings += 1;
        if (b.status !== 'CANCELLED') {
          daysMap[b.date].revenue += b.totalAmount;
        }
      }
    });

    const bookingTrends = Object.values(daysMap);

    // 2. User Registration Trends from real DB
    const playerUsers = allUsers.filter(u => u.role === 'USER');
    const ownerUsers = allUsers.filter(u => u.role === 'OWNER');

    const regTrends = [
      { month: 'Recent Active', players: playerUsers.length, owners: ownerUsers.length },
      { month: 'Total Registered', players: totalUsers, owners: totalOwners },
    ];

    // 3. Facility Approval Status Breakdown
    const approvalBreakdown = [
      { status: 'Approved', count: facilities.filter((f) => f.status === 'APPROVED').length },
      { status: 'Pending', count: facilities.filter((f) => f.status === 'PENDING').length },
      { status: 'Rejected', count: facilities.filter((f) => f.status === 'REJECTED').length },
    ];

    // 4. Most Active Sports
    const sportCounts: Record<string, number> = {};
    bookings.forEach((b) => {
      const sport = b.court?.sportType || 'Other';
      sportCounts[sport] = (sportCounts[sport] || 0) + 1;
    });
    const mostActiveSports = Object.entries(sportCounts).map(([name, value]) => ({
      name,
      value,
    }));

    return NextResponse.json({
      kpis: {
        totalUsers,
        totalOwners,
        totalBookings,
        totalActiveCourts,
        totalGMV,
        pendingApprovals: facilities.filter((f) => f.status === 'PENDING').length,
        openReports: reports.filter((r) => r.status === 'PENDING').length,
      },
      charts: {
        bookingTrends,
        regTrends,
        approvalBreakdown,
        mostActiveSports,
      },
      facilities: facilities.map((f) => ({
        ...f,
        images: JSON.parse(f.images || '[]'),
        sports: JSON.parse(f.sports || '[]'),
        amenities: JSON.parse(f.amenities || '[]'),
      })),
      users: allUsers,
      reports,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
