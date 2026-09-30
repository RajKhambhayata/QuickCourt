export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const sport = searchParams.get('sport') || '';
    const city = searchParams.get('city') || '';
    const venueType = searchParams.get('venueType') || '';
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '10000');
    const status = searchParams.get('status') || 'APPROVED';
    const ownerId = searchParams.get('ownerId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Max 100 per page

    const where: any = {};

    // Security: Require authentication for owner-specific queries
    if (ownerId) {
      const user = await getCurrentUser();
      if (!user || (user.id !== ownerId && user.role !== 'ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      where.ownerId = ownerId;
    } else if (status) {
      where.status = status;
    }

    if (city && city !== 'All') {
      where.city = { contains: city };
    }

    if (venueType && venueType !== 'All') {
      where.venueType = { contains: venueType };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } },
        { sports: { contains: search } },
      ];
    }

    const facilities = await prisma.facility.findMany({
      where,
      include: {
        courts: {
          where: { isActive: true },
        },
        reviews: {
          take: 5, // Limit reviews to prevent data dumping
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        owner: {
          select: { id: true, name: true }, // Remove email/phone from public view
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    let formatted = facilities.map((f) => {
      const parsedImages = JSON.parse(f.images || '[]');
      const parsedSports = JSON.parse(f.sports || '[]');
      const parsedAmenities = JSON.parse(f.amenities || '[]');

      const avgRating =
        f.reviews.length > 0
          ? Number((f.reviews.reduce((acc, r) => acc + r.rating, 0) / f.reviews.length).toFixed(1))
          : 5.0;

      const prices = f.courts.map((c) => c.pricePerHour);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 400;

      return {
        id: f.id,
        name: f.name,
        description: f.description,
        address: f.address,
        city: f.city,
        state: f.state,
        pincode: f.pincode,
        venueType: f.venueType,
        status: f.status,
        rejectionReason: f.rejectionReason,
        ownerId: f.ownerId,
        owner: f.owner,
        images: parsedImages,
        sports: parsedSports,
        amenities: parsedAmenities,
        courts: f.courts,
        reviews: f.reviews,
        avgRating,
        totalReviews: f.reviews.length,
        minPrice,
        createdAt: f.createdAt,
      };
    });

    if (sport && sport !== 'All') {
      formatted = formatted.filter((f) =>
        f.sports.some((s: string) => s.toLowerCase().includes(sport.toLowerCase()))
      );
    }

    if (minRating > 0) {
      formatted = formatted.filter((f) => f.avgRating >= minRating);
    }

    if (maxPrice < 10000) {
      formatted = formatted.filter((f) => f.minPrice <= maxPrice);
    }

    // Get total count for pagination
    const totalCount = await prisma.facility.count({ where });

    return NextResponse.json({ 
      facilities: formatted,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    });
  } catch (error) {
    console.error('Fetch venues error:', error);
    return NextResponse.json({ error: 'Failed to fetch venues' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized. Facility Owner role required to create facilities.' }, { status: 403 });
    }

    // Block owners who are pending admin approval
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Your owner account is pending admin approval. You cannot add facilities until your account is approved.' },
        { status: 403 }
      );
    }

    const { name, description, address, city, venueType, sports, amenities, images } = await request.json();

    if (!name || !address || !city) {
      return NextResponse.json({ error: 'Name, address, and city are required' }, { status: 400 });
    }

    const facility = await prisma.facility.create({
      data: {
        name: name.trim(),
        description: description || 'Premium sports facility equipped with professional turf and court flooring.',
        address: address.trim(),
        city: city.trim(),
        venueType: venueType || 'Indoor & Outdoor',
        sports: JSON.stringify(sports && sports.length > 0 ? sports : ['Badminton']),
        amenities: JSON.stringify(amenities && amenities.length > 0 ? amenities : ['Floodlights', 'Free Parking', 'Drinking Water']),
        images: JSON.stringify(
          images && images.length > 0
            ? images
            : ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1000']
        ),
        status: 'PENDING',
        ownerId: user.id,
      },
    });

    return NextResponse.json({ success: true, facility });
  } catch (error) {
    console.error('Create facility error:', error);
    return NextResponse.json({ error: 'Failed to create facility' }, { status: 500 });
  }
}
