import { z } from 'zod';

export const CreateReviewSchema = z.object({
  facilityId: z.string().min(1, 'Facility ID is required'),
  rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().trim().min(3, 'Review comment must be at least 3 characters'),
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
