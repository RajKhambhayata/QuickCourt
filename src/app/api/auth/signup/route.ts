import { NextResponse } from 'next/server';
import { SignupSchema, SignupService } from '@/modules/auth';

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const validation = SignupSchema.safeParse(rawBody);

    if (!validation.success) {
      const issues = (validation.error.issues || []) as any[];
      const errorMessage = issues.map((e) => `${(e.path || []).join('.')}: ${e.message}`).join(', ');
      return NextResponse.json({ error: errorMessage || 'Invalid registration details' }, { status: 400 });
    }

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const result = await SignupService.register(validation.data, ipAddress);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Registration failed' }, { status: result.status || 400 });
    }

    return NextResponse.json({
      success: true,
      isOwner: result.isOwner,
      pendingApproval: result.pendingApproval,
      message: result.message,
      email: result.email,
      loginUrl: result.loginUrl,
      devOtp: result.devOtp,
      user: result.user,
    });
  } catch (error) {
    console.error('Signup route error:', error);
    return NextResponse.json({ error: 'Internal server error during registration' }, { status: 500 });
  }
}
