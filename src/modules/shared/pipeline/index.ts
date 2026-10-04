import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { UserSession } from '@/lib/types';
import { Prisma } from '@prisma/client';
import { revalidateAvailability, revalidateBookings, revalidateVenues, revalidateVenue } from '@/lib/cache';

export type UserRole = 'ADMIN' | 'OWNER' | 'USER';

export interface PipelineContext<TBody = any, TParams = any> {
  req: Request;
  params?: TParams;
  user: UserSession;
  body: TBody;
  tx: Prisma.TransactionClient;
}

export interface PipelineOptions<TBody = any, TParams = any, TResult = any> {
  // 1 & 2. Role Verification
  roles?: UserRole[];
  allowPendingOwner?: boolean;

  // 3. Facility Ownership Assertion
  facilityId?: string | ((ctx: { user: UserSession; body: TBody; params?: TParams; req: Request }) => string | null | undefined | Promise<string | null | undefined>);

  // 4. Zod Input Validation
  schema?: z.ZodType<TBody>;

  // 5. Database Transaction
  // If true (default is true for mutating operations), handler runs inside prisma.$transaction
  transactional?: boolean;

  // 6. AuditLog Recording (runs automatically for ADMIN and OWNER actions when configured)
  audit?: {
    action: string;
    resource: string;
    resourceId?: (ctx: { user: UserSession; body: TBody; result: any }) => string | undefined;
    details?: (ctx: { user: UserSession; body: TBody; result: any }) => any;
  } | ((ctx: { user: UserSession; body: TBody; result: any }) => {
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
  } | null);

  // 7. Cache Invalidation (automatic based on resource type)
  invalidateCache?: boolean;

  // Core business logic handler
  handler: (ctx: PipelineContext<TBody, TParams>) => Promise<NextResponse | TResult>;
}

/**
 * Stage 2: requireRole
 * Ensures the authenticated user has one of the required roles.
 */
export function requireRole(user: UserSession | null, ...allowedRoles: UserRole[]): { error?: string; status?: number } | null {
  if (!user) {
    return { error: 'Authentication required. Please log in.', status: 401 };
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role as UserRole)) {
    return {
      error: `Forbidden. This action requires one of the following roles: [${allowedRoles.join(', ')}].`,
      status: 403,
    };
  }

  return null;
}

/**
 * Stage 3: assertOwnsFacility
 * Asserts that the authenticated owner owns the facility (or is platform ADMIN).
 * Also enforces that an OWNER with status "PENDING_APPROVAL" cannot manage/publish facilities.
 */
export async function assertOwnsFacility(
  user: UserSession,
  facilityId: string,
  txClient: Prisma.TransactionClient | typeof prisma = prisma
): Promise<{ error?: string; status?: number; facility?: any }> {
  if (!facilityId) {
    return { error: 'Facility ID is required for ownership verification.', status: 400 };
  }

  // Admins have overarching authority
  if (user.role === 'ADMIN') {
    const facility = await txClient.facility.findUnique({ where: { id: facilityId } });
    if (!facility) return { error: 'Facility not found.', status: 404 };
    return { facility };
  }

  if (user.role !== 'OWNER') {
    return { error: 'Unauthorized: Facility Owner role required.', status: 403 };
  }

  // Check if owner is pending approval
  if (user.status === 'PENDING_APPROVAL') {
    return {
      error: 'Your Facility Owner account is pending admin approval. You cannot manage or publish facilities until approved.',
      status: 403,
    };
  }

  const facility = await txClient.facility.findFirst({
    where: {
      id: facilityId,
      ownerId: user.id,
    },
  });

  if (!facility) {
    return {
      error: 'Access denied: You do not own this facility or it does not exist.',
      status: 403,
    };
  }

  return { facility };
}

/**
 * Stage 4: Input Validation with Zod
 */
export function validateInput<T>(schema: z.ZodType<T>, data: unknown): { success: true; data: T } | { success: false; error: string; details?: any } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues || [];
    const formattedError = issues.map((e: any) => `${(e.path || []).join('.')}: ${e.message}`).join(', ');
    return {
      success: false,
      error: formattedError || 'Input validation failed',
      details: issues,
    };
  }
  return { success: true, data: result.data };
}

/**
 * Stage 5: runTransaction
 * Runs operations within an atomic Prisma transaction
 */
export async function runTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: { maxWait?: number; timeout?: number; isolationLevel?: Prisma.TransactionIsolationLevel }
): Promise<T> {
  return prisma.$transaction(fn, options);
}

/**
 * Stage 6: writeAuditLog
 * Writes an immutable audit record for tracking sensitive Owner and Admin actions.
 */
export async function writeAuditLog(
  data: {
    userId: string;
    action: string;
    resource: string;
    resourceId?: string | null;
    details?: any;
    ipAddress?: string | null;
  },
  client: Prisma.TransactionClient | typeof prisma = prisma
) {
  try {
    const detailsString = typeof data.details === 'string' ? data.details : data.details ? JSON.stringify(data.details) : null;
    return await client.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId || null,
        details: detailsString,
        ipAddress: data.ipAddress || null,
      },
    });
  } catch (error) {
    console.error('AuditLog writing failed:', error);
    // Audit log failure should not crash core read operations, but log warning
  }
}

/**
 * Unified Shared Pipeline Runner
 * Combines all 6 stages into a standardized API pipeline execution:
 * 1. Middleware + session extraction
 * 2. requireRole(role)
 * 3. assertOwnsFacility(user, facilityId)
 * 4. validate input (Zod)
 * 5. run the change in a database transaction
 * 6. write an AuditLog entry for admin and owner actions
 */
export function createApiPipeline<TBody = any, TParams = any, TResult = any>(
  options: PipelineOptions<TBody, TParams, TResult>
) {
  return async (req: Request, { params }: { params?: TParams } = {}): Promise<NextResponse> => {
    try {
      // Stage 1 & 2: User Authentication & Role Check
      const user = await getCurrentUser();

      if (options.roles && options.roles.length > 0) {
        const roleCheck = requireRole(user, ...options.roles);
        if (roleCheck) {
          return NextResponse.json({ error: roleCheck.error }, { status: roleCheck.status });
        }
      }

      // Check if owner is pending approval when accessing protected owner actions
      if (user && user.role === 'OWNER' && user.status === 'PENDING_APPROVAL' && !options.allowPendingOwner) {
        return NextResponse.json(
          {
            error: 'Your Facility Owner account is pending admin approval. You cannot perform this action until approved.',
            pendingApproval: true,
          },
          { status: 403 }
        );
      }

      // Stage 4: Input Validation (Zod)
      let parsedBody: TBody = {} as TBody;
      const contentType = req.headers.get('content-type') || '';
      if (req.method !== 'GET' && req.method !== 'DELETE' && contentType.includes('application/json')) {
        try {
          const rawBody = await req.json();
          if (options.schema) {
            const validation = validateInput(options.schema, rawBody);
            if (!validation.success) {
              return NextResponse.json({ error: validation.error, details: validation.details }, { status: 400 });
            }
            parsedBody = validation.data;
          } else {
            parsedBody = rawBody;
          }
        } catch (jsonErr) {
          return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 });
        }
      }

      // Stage 3: assertOwnsFacility
      if (options.facilityId && user) {
        let fid: string | null | undefined;
        if (typeof options.facilityId === 'function') {
          fid = await options.facilityId({ user, body: parsedBody, params, req });
        } else {
          fid = options.facilityId;
        }

        if (fid) {
          const ownership = await assertOwnsFacility(user, fid);
          if (ownership.error) {
            return NextResponse.json({ error: ownership.error }, { status: ownership.status });
          }
        }
      }

      // Stage 5 & 6: Transactional Execution & Audit Logging
      const executeWithTx = async (tx: Prisma.TransactionClient) => {
        const handlerResult = await options.handler({
          req,
          params,
          user: user as UserSession,
          body: parsedBody,
          tx,
        });

        // Stage 6: Audit Log (for Admin and Owner actions)
        if (user && (user.role === 'ADMIN' || user.role === 'OWNER') && options.audit) {
          let auditData: { action: string; resource: string; resourceId?: string; details?: any } | null = null;
          if (typeof options.audit === 'function') {
            auditData = options.audit({ user, body: parsedBody, result: handlerResult });
          } else {
            auditData = {
              action: options.audit.action,
              resource: options.audit.resource,
              resourceId: options.audit.resourceId ? options.audit.resourceId({ user, body: parsedBody, result: handlerResult }) : undefined,
              details: options.audit.details ? options.audit.details({ user, body: parsedBody, result: handlerResult }) : undefined,
            };
          }

          if (auditData) {
            const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
            await writeAuditLog(
              {
                userId: user.id,
                action: auditData.action,
                resource: auditData.resource,
                resourceId: auditData.resourceId,
                details: auditData.details,
                ipAddress: ip,
              },
              tx
            );
          }
        }

        return handlerResult;
      };

      const result = options.transactional !== false
        ? await runTransaction(executeWithTx)
        : await executeWithTx(prisma as unknown as Prisma.TransactionClient);

      // Stage 7: Cache Invalidation
      if (options.invalidateCache !== false) {
        // Invalidate based on action/resource
        if (typeof options.audit === 'object' || typeof options.audit === 'function') {
          const auditData = typeof options.audit === 'function'
            ? options.audit({ user: user as UserSession, body: parsedBody, result })
            : options.audit;

          if (auditData) {
            const resource = auditData.resource;
            const resourceId = typeof auditData.resourceId === 'function'
              ? auditData.resourceId({ user: user as UserSession, body: parsedBody, result })
              : auditData.resourceId;

            switch (resource) {
              case 'BOOKING':
                revalidateAvailability();
                revalidateBookings();
                break;
              case 'FACILITY':
                if (resourceId) {
                  revalidateVenue(resourceId);
                }
                revalidateVenues();
                break;
              case 'COURT':
                revalidateAvailability();
                break;
              case 'BLOCKED_SLOT':
                revalidateAvailability();
                break;
            }
          }
        }
      }

      if (result instanceof NextResponse) {
        return result;
      }

      return NextResponse.json(result);
    } catch (error: any) {
      console.error('Shared pipeline error:', error);
      return NextResponse.json(
        { error: error?.message || 'Internal server error in request pipeline' },
        { status: error?.status || 500 }
      );
    }
  };
}
