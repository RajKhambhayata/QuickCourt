import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken, TOKEN_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  return NextResponse.json({ error: 'Demo accounts and demo login have been permanently removed. Please use your real account credentials.' }, { status: 404 });
}
