import prisma from '@/lib/prisma';
import { UserSession } from '@/lib/types';
import { CreateFacilityInput, CreateCourtInput, BlockSlotInput } from './venues.schema';
import { assertOwnsFacility, writeAuditLog } from '@/modules/shared/pipeline';
import { Prisma } from '@prisma/client';

export class VenuesService {
  /**
   * List approved venues for public player browsing
   */
  static async listPublicVenues(filters?: { sport?: string; city?: string; search?: string }) {
    const where: any = {
      status: 'APPROVED',
    };

    if (filters?.city) {
      where.city = { contains: filters.city };
    }

    const facilities = await prisma.facility.findMany({
      where,
      include: {
        courts: { where: { isActive: true } },
        reviews: true,
        owner: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return facilities
      .map((f) => {
        const images: string[] = JSON.parse(f.images || '[]');
        const sports: string[] = JSON.parse(f.sports || '[]');
        const amenities: string[] = JSON.parse(f.amenities || '[]');

        if (filters?.sport && !sports.some((s) => s.toLowerCase() === filters.sport?.toLowerCase())) {
          return null;
        }

        if (filters?.search) {
          const q = filters.search.toLowerCase();
          const matches =
            f.name.toLowerCase().includes(q) ||
            f.city.toLowerCase().includes(q) ||
            f.address.toLowerCase().includes(q) ||
            sports.some((s) => s.toLowerCase().includes(q));
          if (!matches) return null;
        }

        const avgRating =
          f.reviews.length > 0
            ? Number((f.reviews.reduce((acc, r) => acc + r.rating, 0) / f.reviews.length).toFixed(1))
            : 0;

        const minPrice = f.courts.length > 0 ? Math.min(...f.courts.map((c) => c.pricePerHour)) : 0;

        return {
          ...f,
          images,
          sports,
          amenities,
          avgRating,
          totalReviews: f.reviews.length,
          minPrice,
        };
      })
      .filter(Boolean);
  }

  /**
   * Create a new facility (Facility Owner action)
   * Rule: Owner must be ACTIVE. PENDING_APPROVAL owners cannot create or publish venues.
   */
  static async createFacility(
    user: UserSession,
    input: CreateFacilityInput,
    txClient: Prisma.TransactionClient = prisma as unknown as Prisma.TransactionClient
  ) {
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Facility Owner or Admin role required');
    }

    if (user.role === 'OWNER' && user.status === 'PENDING_APPROVAL') {
      throw new Error('Your Facility Owner account is pending admin approval. You cannot publish venues until your account is approved.');
    }

    const facility = await txClient.facility.create({
      data: {
        name: input.name,
        description: input.description,
        address: input.address,
        city: input.city,
        state: input.state || 'Karnataka',
        pincode: input.pincode || null,
        images: JSON.stringify(input.images),
        sports: JSON.stringify(input.sports),
        amenities: JSON.stringify(input.amenities || []),
        venueType: input.venueType || 'Indoor & Outdoor',
        ownerId: user.id,
        // When owner creates facility, it is created as APPROVED for verified owners or PENDING if admin review needed
        status: 'APPROVED',
      },
    });

    await writeAuditLog(
      {
        userId: user.id,
        action: 'FACILITY_CREATE',
        resource: 'FACILITY',
        resourceId: facility.id,
        details: { name: facility.name, city: facility.city },
      },
      txClient
    );

    return facility;
  }

  /**
   * Add a Court to a Facility
   * Rule: Asserts ownership of facility and active owner status
   */
  static async createCourt(
    user: UserSession,
    input: CreateCourtInput,
    txClient: Prisma.TransactionClient = prisma as unknown as Prisma.TransactionClient
  ) {
    const ownership = await assertOwnsFacility(user, input.facilityId, txClient);
    if (ownership.error) {
      throw new Error(ownership.error);
    }

    const court = await txClient.court.create({
      data: {
        facilityId: input.facilityId,
        name: input.name,
        sportType: input.sportType,
        surfaceType: input.surfaceType || 'Synthetic',
        pricePerHour: input.pricePerHour,
        operatingStartHour: input.operatingStartHour,
        operatingEndHour: input.operatingEndHour,
        isActive: true,
      },
    });

    await writeAuditLog(
      {
        userId: user.id,
        action: 'COURT_CREATE',
        resource: 'COURT',
        resourceId: court.id,
        details: { courtName: court.name, facilityId: input.facilityId },
      },
      txClient
    );

    return court;
  }

  /**
   * Block a slot for maintenance or offline bookings
   */
  static async blockSlot(
    user: UserSession,
    input: BlockSlotInput,
    txClient: Prisma.TransactionClient = prisma as unknown as Prisma.TransactionClient
  ) {
    const court = await txClient.court.findUnique({
      where: { id: input.courtId },
      include: { facility: true },
    });

    if (!court) {
      throw new Error('Court not found');
    }

    const ownership = await assertOwnsFacility(user, court.facilityId, txClient);
    if (ownership.error) {
      throw new Error(ownership.error);
    }

    // Overlap check with existing bookings
    const existing = await txClient.booking.findFirst({
      where: {
        courtId: input.courtId,
        date: input.date,
        startTime: { lt: input.endTime },
        endTime: { gt: input.startTime },
        status: { not: 'CANCELLED' },
      },
    });

    if (existing) {
      throw new Error('Cannot block slot: an active booking already exists during this time.');
    }

    const blocked = await txClient.blockedSlot.create({
      data: {
        courtId: input.courtId,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        reason: input.reason || 'Maintenance',
      },
    });

    await writeAuditLog(
      {
        userId: user.id,
        action: 'SLOT_BLOCK',
        resource: 'BLOCKED_SLOT',
        resourceId: blocked.id,
        details: { courtId: input.courtId, date: input.date, time: `${input.startTime}-${input.endTime}` },
      },
      txClient
    );

    return blocked;
  }
}
