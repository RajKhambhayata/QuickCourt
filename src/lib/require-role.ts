/**
 * requireRole — server-side role guard for API routes and server actions.
 *
 * Usage (API route):
 *   const guard = await requireRole(request, 'ADMIN');
 *   if (guard.error) return guard.error;
 *   const user = guard.user;
 *
 * Usage (server action):
 *   const guard = await requireRoleAction('OWNER');
 *   if (!guard.user) throw new Error(guard.message);
 *
 * NEVER rely on middleware alone — always call requireRole inside every
 * /api/admin/* and /api/owner/* handler as a defence-in-depth measure.
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { UserSession } from '@/lib/types';

export type AllowedRole = 'USER' | 'OWNER' | 'ADMIN';

interface GuardSuccess {
  user: UserSession;
  error: null;
}

interface GuardFailure {
  user: null;
  error: NextResponse;
}

/**
 * requireRole — for use inside API Route Handlers (route.ts files).
 * Returns the verified user session or a ready-to-return NextResponse error.
 *
 * @param roles - One or more roles allowed to access this route.
 * @param allowPending - If true, OWNER with status PENDING_APPROVAL is allowed.
 */
export async function requireRole(
  roles: AllowedRole[],
  allowPending = false
): Promise<GuardSuccess | GuardFailure> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      ),
    };
  }

  if (!roles.includes(user.role as AllowedRole)) {
    return {
      user: null,
      error: NextResponse.json(
        {
          error: `Forbidden. This endpoint requires role: [${roles.join(' | ')}]. You are signed in as ${user.role}.`,
        },
        { status: 403 }
      ),
    };
  }

  // Owner pending check
  if (!allowPending && user.role === 'OWNER' && user.status === 'PENDING_APPROVAL') {
    return {
      user: null,
      error: NextResponse.json(
        {
          error: 'Your Facility Owner account is pending admin approval. This action is not available until approved.',
          pendingApproval: true,
        },
        { status: 403 }
      ),
    };
  }

  return { user, error: null };
}

/**
 * requireRoleAction — for use inside Next.js Server Actions.
 * Throws or returns the session; does NOT return NextResponse.
 */
export async function requireRoleAction(
  roles: AllowedRole[],
  allowPending = false
): Promise<{ success: true; user: UserSession } | { success: false; message: string }> {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: 'Authentication required. Please sign in.' };
  }

  if (!roles.includes(user.role as AllowedRole)) {
    return {
      success: false,
      message: `Forbidden. Requires role: [${roles.join(' | ')}].`,
    };
  }

  if (!allowPending && user.role === 'OWNER' && user.status === 'PENDING_APPROVAL') {
    return {
      success: false,
      message: 'Your account is pending admin approval.',
    };
  }

  return { success: true, user };
}
