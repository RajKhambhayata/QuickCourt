export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/require-role';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const guard = await requireRole(['ADMIN']);
    if (guard.error) return guard.error;

    const { id } = params;
    const { action, comments } = await request.json(); // action: "APPROVE" or "REJECT"

    if (!action || (action !== 'APPROVE' && action !== 'REJECT')) {
      return NextResponse.json({ error: 'Valid action (APPROVE/REJECT) is required' }, { status: 400 });
    }

    const facility = await prisma.facility.update({
      where: { id },
      data: {
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        rejectionReason: action === 'REJECT' ? (comments || 'Did not meet quality standards') : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Facility ${action === 'APPROVE' ? 'approved and published live' : 'rejected'}.`,
      facility,
    });
  } catch (error) {
    console.error('Approve facility error:', error);
    return NextResponse.json({ error: 'Failed to update facility status' }, { status: 500 });
  }
}
