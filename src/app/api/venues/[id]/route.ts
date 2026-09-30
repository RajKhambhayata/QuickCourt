import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const facility = await prisma.facility.findUnique({
      where: { id },
      include: {
        courts: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        owner: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!facility) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }
    const user = await getCurrentUser();
    if (facility.status !== 'APPROVED' && facility.ownerId !== user?.id && user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    const parsedImages = JSON.parse(facility.images || '[]');
    const parsedSports = JSON.parse(facility.sports || '[]');
    const parsedAmenities = JSON.parse(facility.amenities || '[]');

    const avgRating =
      facility.reviews.length > 0
        ? Number((facility.reviews.reduce((acc, r) => acc + r.rating, 0) / facility.reviews.length).toFixed(1))
        : 5.0;

    const prices = facility.courts.map((c) => c.pricePerHour);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 400;

    return NextResponse.json({
      facility: {
        ...facility,
        images: parsedImages,
        sports: parsedSports,
        amenities: parsedAmenities,
        avgRating,
        totalReviews: facility.reviews.length,
        minPrice,
      },
    });
  } catch (error) {
    console.error('Get venue error:', error);
    return NextResponse.json({ error: 'Failed to fetch venue details' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const existing = await prisma.facility.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    if (existing.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, description, address, city, venueType, sports, amenities, images } = await request.json();

    const updated = await prisma.facility.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(description ? { description: description.trim() } : {}),
        ...(address ? { address: address.trim() } : {}),
        ...(city ? { city: city.trim() } : {}),
        ...(venueType ? { venueType } : {}),
        ...(sports ? { sports: JSON.stringify(sports) } : {}),
        ...(amenities ? { amenities: JSON.stringify(amenities) } : {}),
        ...(images ? { images: JSON.stringify(images) } : {}),
      },
    });

    return NextResponse.json({ success: true, facility: updated });
  } catch (error) {
    console.error('Update venue error:', error);
    return NextResponse.json({ error: 'Failed to update venue' }, { status: 500 });
  }
}
