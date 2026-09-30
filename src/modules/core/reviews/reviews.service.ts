import prisma from '@/lib/prisma';
import { UserSession } from '@/lib/types';
import { CreateReviewInput } from './reviews.schema';
import { Prisma } from '@prisma/client';

export class ReviewsService {
  static async addReview(
    user: UserSession,
    input: CreateReviewInput,
    tx: Prisma.TransactionClient = prisma as unknown as Prisma.TransactionClient
  ) {
    const facility = await tx.facility.findUnique({
      where: { id: input.facilityId },
    });

    if (!facility) {
      throw new Error('Facility not found');
    }

    const review = await tx.review.create({
      data: {
        facilityId: input.facilityId,
        userId: user.id,
        rating: input.rating,
        comment: input.comment,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return review;
  }
}
