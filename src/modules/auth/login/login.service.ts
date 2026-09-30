import prisma from '@/lib/prisma';
import { comparePassword, signToken, TOKEN_COOKIE_NAME } from '@/lib/auth';
import { LoginInput } from './login.schema';
import { writeAuditLog } from '@/modules/shared/pipeline';

export interface LoginResult {
  success: boolean;
  error?: string;
  status?: number;
  token?: string;
  cookieOptions?: {
    name: string;
    value: string;
    httpOnly: boolean;
    path: string;
    maxAge: number;
    sameSite: 'lax';
    secure: boolean;
  };
  pendingApproval?: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    avatar?: string | null;
  };
}

export class LoginService {
  /**
   * Process a login request across Player, Owner, or Admin portals
   */
  static async authenticate(input: LoginInput, ipAddress?: string | null): Promise<LoginResult> {
    const email = input.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: 'Invalid email or password', status: 401 };
    }

    if (user.status === 'BANNED') {
      return { success: false, error: 'Your account has been suspended by an administrator.', status: 403 };
    }

    if (user.status === 'REJECTED') {
      return { success: false, error: 'Your owner application was rejected. Please contact support.', status: 403 };
    }

    if (!user.isVerified) {
      return {
        success: false,
        error: 'Please verify your phone number with OTP before signing in.',
        status: 403,
      };
    }

    // Portal role mismatch check
    if (input.portalRole === 'ADMIN' && user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'This account does not have Admin access. Please use the correct login portal.',
        status: 403,
      };
    }

    if (input.portalRole === 'OWNER' && user.role !== 'OWNER') {
      return {
        success: false,
        error: 'This account is not a Facility Owner account. Please use the Player login portal.',
        status: 403,
      };
    }

    if (input.portalRole === 'USER' && (user.role === 'ADMIN' || user.role === 'OWNER')) {
      return {
        success: false,
        error: 'Please use the Owner or Admin login portal for your account type.',
        status: 403,
      };
    }

    const isMatch = await comparePassword(input.password, user.password);
    if (!isMatch) {
      return { success: false, error: 'Invalid email or password', status: 401 };
    }

    const token = signToken(user);

    // Audit log for Admin and Owner logins
    if (user.role === 'ADMIN' || user.role === 'OWNER') {
      await writeAuditLog({
        userId: user.id,
        action: 'USER_LOGIN',
        resource: 'AUTH',
        resourceId: user.id,
        details: { portalRole: input.portalRole, email: user.email },
        ipAddress: ipAddress || null,
      });
    }

    return {
      success: true,
      token,
      pendingApproval: user.status === 'PENDING_APPROVAL',
      cookieOptions: {
        name: TOKEN_COOKIE_NAME,
        value: token,
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
      },
    };
  }
}
