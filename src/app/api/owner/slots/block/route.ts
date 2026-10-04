export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/require-role';
import { createApiPipeline, assertOwnsFacility } from '@/modules/shared/pipeline';
import { BlockSlotSchema, VenuesService } from '@/modules/core';

// GET /api/owner/slots/block — list blocked slots for a court
export async function GET(request: Request) {
  try {
    const guard = await requireRole(['OWNER']);
    if (guard.error) return guard.error;
    const user = guard.user;

    const { searchParams } = new URL(request.url);
    const courtId = searchParams.get('courtId');
    const date = searchParams.get('date');

    if (!courtId) {
      return NextResponse.json({ error: 'Court ID is required' }, { status: 400 });
    }

    const court = await prisma.court.findUnique({
      where: { id: courtId },
      include: { facility: { select: { ownerId: true } } },
    });

    if (!court) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 });
    }

    // Stage 3: assertOwnsFacility
    const ownership = await assertOwnsFacility(user, court.facilityId);
    if (ownership.error) {
      return NextResponse.json({ error: ownership.error }, { status: ownership.status || 403 });
    }

    const where: any = { courtId };
    if (date) where.date = date;

    const blockedSlots = await prisma.blockedSlot.findMany({
      where,
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json({ blockedSlots });
  } catch (error) {
    console.error('Fetch blocked slots error:', error);
    return NextResponse.json({ error: 'Failed to fetch blocked slots' }, { status: 500 });
  }
}

// POST /api/owner/slots/block — block a slot using Shared Pipeline
export const POST = createApiPipeline({
  roles: ['OWNER'],
  allowPendingOwner: false,
  schema: BlockSlotSchema,
  transactional: true,
  audit: {
    action: 'SLOT_BLOCK',
    resource: 'BLOCKED_SLOT',
    resourceId: (ctx) => ctx.result?.id,
    details: (ctx) => ({
      courtId: ctx.body?.courtId,
      date: ctx.body?.date,
      time: `${ctx.body?.startTime}-${ctx.body?.endTime}`,
      reason: ctx.body?.reason,
    }),
  },
  handler: async ({ user, body, tx }) => {
    const blocked = await VenuesService.blockSlot(user, body, tx);
    return { success: true, blockedSlot: blocked };
  },
});

// DELETE /api/owner/slots/block?id=<blockedSlotId> — unblock a slot
export async function DELETE(request: Request) {
  try {
    const guard = await requireRole(['OWNER']);
    if (guard.error) return guard.error;
    const user = guard.user;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Blocked slot ID is required' }, { status: 400 });
    }

    const blockedSlot = await prisma.blockedSlot.findUnique({
      where: { id },
      include: { court: { include: { facility: { select: { ownerId: true, id: true } } } } },
    });

    if (!blockedSlot) {
      return NextResponse.json({ error: 'Blocked slot not found' }, { status: 404 });
    }

    // Stage 3: assertOwnsFacility for deletion
    const ownership = await assertOwnsFacility(user, blockedSlot.court.facility.id);
    if (ownership.error) {
      return NextResponse.json({ error: ownership.error }, { status: ownership.status || 403 });
    }

    await prisma.blockedSlot.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Slot unblocked successfully' });
  } catch (error) {
    console.error('Unblock slot error:', error);
    return NextResponse.json({ error: 'Failed to unblock slot' }, { status: 500 });
  }
}
