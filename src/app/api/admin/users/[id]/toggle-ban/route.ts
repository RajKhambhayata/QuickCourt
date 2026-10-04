export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.role === 'ADMIN') {
      return NextResponse.json({ error: 'Cannot ban an admin account' }, { status: 400 });
    }

    const newStatus = targetUser.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';

    const updated = await prisma.user.update({
      where: { id },
      data: { status: newStatus },
    });

    return NextResponse.json({
      success: true,
      message: `User status changed to ${newStatus}`,
      user: updated,
    });
  } catch (error) {
    console.error('Toggle ban error:', error);
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
  }
}
