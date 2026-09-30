import { z } from 'zod';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createApiPipeline } from '@/modules/shared/pipeline';

const ApproveOwnerSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  reason: z.string().trim().optional(),
});

// POST /api/admin/owners/[id]/approve — approve or reject an owner application via Shared Pipeline
export const POST = async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  return createApiPipeline({
    roles: ['ADMIN'],
    schema: ApproveOwnerSchema,
    transactional: true,
    audit: (ctx) => ({
      action: ctx.body?.action === 'APPROVE' ? 'APPROVE_OWNER' : 'REJECT_OWNER',
      resource: 'USER',
      resourceId: params.id,
      details: {
        targetOwnerId: params.id,
        reason: ctx.body?.reason || null,
      },
    }),
    handler: async ({ body, tx }) => {
      const targetOwner = await tx.user.findUnique({ where: { id: params.id } });

      if (!targetOwner || targetOwner.role !== 'OWNER') {
        return NextResponse.json({ error: 'Owner account not found' }, { status: 404 });
      }

      const newStatus = body.action === 'APPROVE' ? 'ACTIVE' : 'REJECTED';

      const updated = await tx.user.update({
        where: { id: params.id },
        data: { status: newStatus },
        select: { id: true, name: true, email: true, status: true },
      });

      return NextResponse.json({
        success: true,
        message:
          body.action === 'APPROVE'
            ? `Owner account for ${updated.name} has been approved. They can now log in and publish venues.`
            : `Owner application for ${updated.name} has been rejected.${body.reason ? ' Reason: ' + body.reason : ''}`,
        owner: updated,
      });
    },
  })(request, { params });
};
