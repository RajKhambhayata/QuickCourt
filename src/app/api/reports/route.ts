import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { validateReport } from '@/lib/validation';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const reports = await prisma.report.findMany({
      include: {
        reportedBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Fetch reports error:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please login to submit a report' }, { status: 401 });
    }

    const { targetType, targetId, targetName, reason } = await request.json();

    // Validate report input
    const validation = validateReport({ targetType, targetId, targetName, reason });
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        reportedById: user.id,
        targetType: validation.data.targetType,
        targetId: validation.data.targetId,
        targetName: validation.data.targetName,
        reason: validation.data.reason,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id, status, adminNote } = await request.json();

    const report = await prisma.report.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(adminNote ? { adminNote } : {}),
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Update report error:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
