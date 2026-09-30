import { NextResponse } from 'next/server';
import { LoginSchema, LoginService } from '@/modules/auth';

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const validation = LoginSchema.safeParse(rawBody);

    if (!validation.success) {
      const issues = (validation.error.issues || []) as any[];
      const errorMessage = issues.map((e) => e.message).join(', ');
      return NextResponse.json({ error: errorMessage || 'Invalid login details' }, { status: 400 });
    }

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const result = await LoginService.authenticate(validation.data, ipAddress);

    if (!result.success || !result.cookieOptions) {
      return NextResponse.json({ error: result.error || 'Authentication failed' }, { status: result.status || 401 });
    }

    const response = NextResponse.json({
      success: true,
      pendingApproval: result.pendingApproval,
      user: result.user,
    });

    response.cookies.set({
      name: result.cookieOptions.name,
      value: result.cookieOptions.value,
      httpOnly: result.cookieOptions.httpOnly,
      path: result.cookieOptions.path,
      maxAge: result.cookieOptions.maxAge,
      sameSite: result.cookieOptions.sameSite,
      secure: result.cookieOptions.secure,
    });

    return response;
  } catch (error) {
    console.error('Login route error:', error);
    return NextResponse.json({ error: 'Internal server error during authentication' }, { status: 500 });
  }
}
