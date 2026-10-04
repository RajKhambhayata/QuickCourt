import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { normalizePhoneNumber } from '@/lib/phone';
import { createOtp, hashOtp, otpExpiry, otpMatches, OTP_MAX_ATTEMPTS, isOtpExpired } from '@/lib/otp';
import { sendVerificationSms, isSmsConfigured } from '@/lib/sms';
import { SignupInput, VerifyOtpInput } from './signup.schema';
import { writeAuditLog } from '@/modules/shared/pipeline';

export interface SignupResult {
  success: boolean;
  error?: string;
  status?: number;
  message?: string;
  isOwner?: boolean;
  isAdmin?: boolean;
  pendingApproval?: boolean;
  email?: string;
  loginUrl?: string;
  devOtp?: string; // provided only when SMS is not configured in development
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
  };
}

export class SignupService {
  /**
   * Register a new user enforcing strict business rules:
   * 1. Admin: NEVER self-signup. Rejected with 403.
   * 2. Player: Active after OTP verification.
   * 3. Facility Owner: Created with status = PENDING_APPROVAL. Admin approval required.
   */
  static async register(input: SignupInput, ipAddress?: string | null): Promise<SignupResult> {
    const isAdmin = input.role === 'ADMIN';
    const isOwner = input.role === 'OWNER';

    // Privileged accounts are provisioned out of band, never through public signup.
    if (isAdmin) {
      return { success: false, error: 'Administrator accounts must be provisioned by the platform.', status: 403 };
    }

    const email = input.email.toLowerCase().trim();
    const normalizedPhone = input.phone ? normalizePhoneNumber(input.phone) : null;

    // Check if account already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please log in.',
        status: 409,
      };
    }

    const hashedPassword = await hashPassword(input.password);

    // Initial status:
    // Owner: status = PENDING_APPROVAL until Admin approves
    // Player & Admin: status = ACTIVE
    // All accounts are immediately verified (OTP disabled for now)
    const initialStatus = isOwner ? 'PENDING_APPROVAL' : 'ACTIVE';
    const initialVerified = true;

    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email,
        password: hashedPassword,
        role: isAdmin ? 'ADMIN' : isOwner ? 'OWNER' : 'USER',
        status: initialStatus,
        avatar: input.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        phone: normalizedPhone,
        isVerified: initialVerified,
        otpCode: null,
        otpExpiresAt: null,
        otpLastSentAt: null,
      },
    });

    // Audit log for Facility Owner applications
    if (isOwner) {
      await writeAuditLog({
        userId: user.id,
        action: 'OWNER_APPLICATION_SUBMITTED',
        resource: 'USER',
        resourceId: user.id,
        details: {
          email: user.email,
          name: user.name,
          phone: normalizedPhone,
          facilityName: input.facilityName || null,
          status: 'PENDING_APPROVAL',
        },
        ipAddress: ipAddress || null,
      });
    }

    let message = 'Player account created successfully! You can now log in and book courts.';
    if (isOwner) {
      message = 'Facility Owner application submitted! Your account is currently pending administrator review and approval.';
    } else if (isAdmin) {
      message = 'Administrator account created successfully! You can now log in.';
    }

    const loginUrl = isAdmin ? '/admin/login' : isOwner ? '/owner/login' : '/player/login';

    return {
      success: true,
      isOwner,
      isAdmin,
      pendingApproval: isOwner,
      email: user.email,
      loginUrl,
      message,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  /**
   * Verify OTP and activate user account
   */
  static async verifyOtp(input: VerifyOtpInput, ipAddress?: string | null): Promise<SignupResult> {
    const email = input.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: 'User account not found', status: 404 };
    }

    if (user.isVerified) {
      return { success: false, error: 'Account is already verified. Please sign in.', status: 409 };
    }
    if (!user.otpCode || !user.otpExpiresAt) {
      return { success: false, error: 'No pending verification code. Request a new code before continuing.', status: 400 };
    }
    if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
      return { success: false, error: 'Too many verification attempts. Request a new code.', status: 429 };
    }
    if (isOtpExpired(user.otpExpiresAt)) {
      return { success: false, error: 'Verification code has expired. Request a new code.', status: 400 };
    }
    if (!otpMatches(input.otp, user.otpCode)) {
      await prisma.user.update({ where: { id: user.id }, data: { otpAttempts: { increment: 1 } } });
      return { success: false, error: 'Invalid verification code.', status: 400 };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, otpCode: null, otpExpiresAt: null, otpAttempts: 0 },
    });

    const isOwner = user.role === 'OWNER';
    return {
      success: true,
      isOwner,
      pendingApproval: user.status === 'PENDING_APPROVAL',
      message: isOwner
        ? 'Account verified! Your application is under review by platform administrators.'
        : 'Your account is verified! You can now log in and book courts.',
      loginUrl: isOwner ? '/owner/login' : '/player/login',
    };
  }
}
