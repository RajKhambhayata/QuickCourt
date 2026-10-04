export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/require-role';

// GET /api/admin/owners — list all owner accounts grouped by status
export async function GET() {
  try {
    const guard = await requireRole(['ADMIN']);
    if (guard.error) return guard.error;
    const user = guard.user;

    const owners = await prisma.user.findMany({
      where: { role: 'OWNER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        status: true,
        isVerified: true,
        createdAt: true,
        _count: { select: { facilities: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const pending = owners.filter((o) => o.status === 'PENDING_APPROVAL');
    const active = owners.filter((o) => o.status === 'ACTIVE');
    const rejected = owners.filter((o) => o.status === 'REJECTED');
    const banned = owners.filter((o) => o.status === 'BANNED');

    return NextResponse.json({ owners, pending, active, rejected, banned });
  } catch (error) {
    console.error('Admin owners list error:', error);
    return NextResponse.json({ error: 'Failed to fetch owners' }, { status: 500 });
  }
}
