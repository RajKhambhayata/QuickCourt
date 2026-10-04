export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/require-role';
import { createApiPipeline, assertOwnsFacility } from '@/modules/shared/pipeline';
import { CreateCourtSchema, VenuesService } from '@/modules/core';

export async function GET(request: Request) {
  try {
    const guard = await requireRole(['OWNER']);
    if (guard.error) return guard.error;
    const user = guard.user;

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    const where: any = {};
    if (facilityId) {
      const ownership = await assertOwnsFacility(user, facilityId);
      if (ownership.error) return NextResponse.json({ error: ownership.error }, { status: ownership.status || 403 });
      where.facilityId = facilityId;
    } else {
      where.facility = { ownerId: user.id };
    }

    const courts = await prisma.court.findMany({
      where,
      include: {
        facility: {
          select: { id: true, name: true, city: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ courts });
  } catch (error) {
    console.error('Fetch owner courts error:', error);
    return NextResponse.json({ error: 'Failed to fetch courts' }, { status: 500 });
  }
}

// POST /api/owner/courts — Add court using Shared Pipeline
export const POST = createApiPipeline({
  roles: ['OWNER'],
  allowPendingOwner: false,
  facilityId: (ctx) => ctx.body?.facilityId, // Asserts facility ownership
  schema: CreateCourtSchema,
  transactional: true,
  audit: {
    action: 'COURT_CREATE',
    resource: 'COURT',
    resourceId: (ctx) => ctx.result?.id,
    details: (ctx) => ({
      courtName: ctx.body?.name,
      sportType: ctx.body?.sportType,
      facilityId: ctx.body?.facilityId,
    }),
  },
  handler: async ({ user, body, tx }) => {
    const court = await VenuesService.createCourt(user, body, tx);
    return {
      success: true,
      court,
    };
  },
});
