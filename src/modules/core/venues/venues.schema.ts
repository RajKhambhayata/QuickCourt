import { z } from 'zod';

export const CreateFacilitySchema = z.object({
  name: z.string().trim().min(3, 'Facility name must be at least 3 characters'),
  description: z.string().trim().min(10, 'Please provide a descriptive overview (at least 10 characters)'),
  address: z.string().trim().min(5, 'Address is required'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().default('Karnataka'),
  pincode: z.string().trim().optional(),
  images: z.array(z.string().url()).min(1, 'Please provide at least one facility photo URL'),
  sports: z.array(z.string()).min(1, 'Please select at least one sport'),
  amenities: z.array(z.string()).default([]),
  venueType: z.string().default('Indoor & Outdoor'),
});

export type CreateFacilityInput = z.infer<typeof CreateFacilitySchema>;

export const CreateCourtSchema = z.object({
  facilityId: z.string().min(1, 'Facility ID is required'),
  name: z.string().trim().min(2, 'Court name is required'),
  sportType: z.string().min(2, 'Sport type is required'),
  surfaceType: z.string().default('Synthetic'),
  // coerce handles form payloads where numbers arrive as strings
  pricePerHour: z.coerce.number().positive('Price per hour must be greater than zero'),
  operatingStartHour: z.coerce.number().int().min(0).max(23).default(6),
  operatingEndHour: z.coerce.number().int().min(1).max(24).default(23),
});

export type CreateCourtInput = z.infer<typeof CreateCourtSchema>;

export const BlockSlotSchema = z.object({
  courtId: z.string().min(1, 'Court ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be formatted as HH:MM'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be formatted as HH:MM'),
  reason: z.string().trim().default('Maintenance'),
});

export type BlockSlotInput = z.infer<typeof BlockSlotSchema>;
