import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { normalizePhoneNumber } from '@/lib/phone';
import { createOtp, hashOtp, otpExpiry, otpMatches } from '@/lib/otp';
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
    // RULE 1: Admin: never self-signup
    if (input.role === 'ADMIN') {
      return {
        success: false,
        error: 'Admin accounts cannot be self-registered. They must be provisioned via the system seed script or administrative invite only.',
        status: 403,
      };
    }

    const email = input.email.toLowerCase().trim();
    const normalizedPhone = normalizePhoneNumber(input.phone);

    if (!normalizedPhone) {
      return {
        success: false,
        error: 'Please provide a valid phone number in international format (e.g. +919876543210)',
        status: 400,
      };
    }

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

    const isOwner = input.role === 'OWNER';
    const hashedPassword = await hashPassword(input.password);
    const smsEnabled = isSmsConfigured();
    const rawOtp = createOtp();

    // RULE 2 & 3:
    // Player: isVerified = false until OTP verification completes
    // Owner: status = PENDING_APPROVAL until Admin approves
    const initialStatus = isOwner ? 'PENDING_APPROVAL' : 'ACTIVE';
    const initialVerified = false; // Both must verify their phone OTP

    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email,
        password: hashedPassword,
        role: isOwner ? 'OWNER' : 'USER',
        status: initialStatus,
        avatar: input.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        phone: normalizedPhone,
        isVerified: initialVerified,
        otpCode: hashOtp(rawOtp),
        otpExpiresAt: otpExpiry(),
        otpLastSentAt: new Date(),
      },
    });

    // Send verification SMS if configured
    if (smsEnabled) {
      try {
        await sendVerificationSms(normalizedPhone, rawOtp);
      } catch (smsError) {
        console.error('SMS delivery failed:', smsError);
        // Clean up unverified user if SMS fails
        await prisma.user.delete({ where: { id: user.id } });
        return {
          success: false,
          error: 'We could not send a verification SMS to your phone number. Please check the number and try again.',
          status: 503,
        };
      }
    }

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

    return {
      success: true,
      isOwner,
      isAdmin: false,
      pendingApproval: isOwner,
      email: user.email,
      loginUrl: isOwner ? '/owner/login' : '/player/login',
      // In local dev without SMS gateway, pass raw OTP so developer can verify easily
      devOtp: !smsEnabled ? rawOtp : undefined,
      message: isOwner
        ? 'Facility Owner application submitted! Please verify your phone number. Once verified, the admin team will review and approve your account.'
        : 'Player account created! Please enter the 6-digit verification code sent to your phone.',
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
      return {
        success: true,
        message: 'Account is already verified. You may proceed to log in.',
        loginUrl: user.role === 'OWNER' ? '/owner/login' : '/player/login',
      };
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      return { success: false, error: 'No pending OTP verification found. Please request a new code.', status: 400 };
    }

    if (new Date() > user.otpExpiresAt) {
      return { success: false, error: 'Verification code has expired. Please request a new one.', status: 400 };
    }

    const isValid = otpMatches(input.otp, user.otpCode);
    if (!isValid) {
      await prisma.user.update({
        where: { id: user.id },
        data: { otpAttempts: { increment: 1 } },
      });
      return { success: false, error: 'Invalid verification code. Please check and try again.', status: 400 };
    }

    // Activate verification
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpiresAt: null,
        otpAttempts: 0,
      },
    });

    const isOwner = updated.role === 'OWNER';

    await writeAuditLog({
      userId: updated.id,
      action: 'PHONE_VERIFIED',
      resource: 'USER',
      resourceId: updated.id,
      details: { email: updated.email, role: updated.role, status: updated.status },
      ipAddress: ipAddress || null,
    });

    return {
      success: true,
      isOwner,
      pendingApproval: updated.status === 'PENDING_APPROVAL',
      message: isOwner
        ? 'Phone number verified! Your application is now under review by platform administrators.'
        : 'Your player account has been verified successfully! You can now log in and book courts.',
      loginUrl: isOwner ? '/owner/login' : '/player/login',
    };
  }
}
