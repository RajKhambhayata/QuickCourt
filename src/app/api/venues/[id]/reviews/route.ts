export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { validateReview } from '@/lib/validation';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please log in to submit a review' }, { status: 401 });
    }
    if (user.role !== 'USER') return NextResponse.json({ error: 'Player account required' }, { status: 403 });

    const { id: facilityId } = params;
    const { rating, comment } = await request.json();

    // Validate review input
    const validation = validateReview({ rating, comment });
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Use transaction to prevent duplicate reviews
    let review;
    try {
      review = await prisma.$transaction(async (tx) => {
        const facility = await tx.facility.findFirst({ 
          where: { id: facilityId, status: 'APPROVED' }, 
          select: { id: true } 
        });
        if (!facility) {
          throw new Error('VENUE_NOT_FOUND');
        }

        const priorReview = await tx.review.findFirst({ 
          where: { facilityId, userId: user.id }, 
          select: { id: true } 
        });
        if (priorReview) {
          throw new Error('DUPLICATE_REVIEW');
        }

        return await tx.review.create({
          data: {
            facilityId,
            userId: user.id,
            rating: Math.round(rating),
            comment: comment.trim(),
          },
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        });
      });
    } catch (error: any) {
      if (error.message === 'VENUE_NOT_FOUND') {
        return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
      }
      if (error.message === 'DUPLICATE_REVIEW') {
        return NextResponse.json({ error: 'You have already reviewed this venue' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Submit review error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
