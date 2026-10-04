export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/require-role';
import { createApiPipeline } from '@/modules/shared/pipeline';
import { CreateFacilitySchema, VenuesService } from '@/modules/core';

// GET /api/owner/facilities — returns all facilities for the logged-in owner
export async function GET() {
  try {
    const guard = await requireRole(['OWNER']);
    if (guard.error) return guard.error;
    const user = guard.user;

    const facilities = await prisma.facility.findMany({
      where: { ownerId: user.id },
      include: {
        courts: { orderBy: { name: 'asc' } },
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        owner: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = facilities.map((f) => ({
      ...f,
      images: JSON.parse(f.images || '[]'),
      sports: JSON.parse(f.sports || '[]'),
      amenities: JSON.parse(f.amenities || '[]'),
      avgRating:
        f.reviews.length > 0
          ? Number((f.reviews.reduce((acc, r) => acc + r.rating, 0) / f.reviews.length).toFixed(1))
          : 0,
      totalReviews: f.reviews.length,
      minPrice: f.courts.length > 0 ? Math.min(...f.courts.map((c) => c.pricePerHour)) : 0,
    }));

    return NextResponse.json({ facilities: formatted });
  } catch (error) {
    console.error('Owner facilities fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch your facilities' }, { status: 500 });
  }
}

// POST /api/owner/facilities — creates a new facility via Shared Pipeline
export const POST = createApiPipeline({
  roles: ['OWNER'],
  allowPendingOwner: false, // Rule: Admin must approve before owner can publish venues
  schema: CreateFacilitySchema,
  transactional: true,
  audit: {
    action: 'FACILITY_CREATE',
    resource: 'FACILITY',
    resourceId: (ctx) => ctx.result?.id,
    details: (ctx) => ({
      facilityName: ctx.body?.name,
      city: ctx.body?.city,
    }),
  },
  handler: async ({ user, body, tx }) => {
    const facility = await VenuesService.createFacility(user, body, tx);
    return {
      success: true,
      facility: {
        ...facility,
        images: JSON.parse(facility.images || '[]'),
        sports: JSON.parse(facility.sports || '[]'),
        amenities: JSON.parse(facility.amenities || '[]'),
      },
    };
  },
});
