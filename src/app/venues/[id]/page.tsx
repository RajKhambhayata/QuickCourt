import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import VenueDetailClient from './VenueDetailClient';
import { FacilityWithDetails, CourtItem, ReviewItem } from '@/lib/types';
import { Building2, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const facility = await prisma.facility.findUnique({
      where: { id: params.id },
      select: { name: true, city: true, address: true, sports: true, images: true, description: true },
    });

    if (!facility) {
      return {
        title: 'Venue Not Found | QuickCourt',
        description: 'The requested sports facility could not be found.',
      };
    }

    let sports: string[] = [];
    let images: string[] = [];
    try {
      sports = JSON.parse(facility.sports || '[]');
      images = JSON.parse(facility.images || '[]');
    } catch {
      // ignore
    }

    const primarySport = sports[0] || 'Sports';
    const thumbnail = images[0] || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200';
    const title = `${facility.name} - ${primarySport} Court in ${facility.city} | QuickCourt`;
    const description =
      facility.description ||
      `Book verified ${primarySport} courts at ${facility.name}, ${facility.address}, ${facility.city}. Real-time slots, zero double-booking guarantee.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: thumbnail }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [thumbnail],
      },
    };
  } catch {
    return {
      title: 'Sports Arena | QuickCourt',
      description: 'Book verified sports venues and courts in real-time on QuickCourt.',
    };
  }
}

export default async function SingleVenuePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  let facilityData: FacilityWithDetails | null = null;

  try {
    const facility = await prisma.facility.findUnique({
      where: { id },
      include: {
        courts: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
        reviews: {
          take: 20,
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

    if (facility && facility.status === 'APPROVED') {
      let parsedImages: string[] = [];
      let parsedSports: string[] = [];
      let parsedAmenities: string[] = [];

      try {
        parsedImages = JSON.parse(facility.images || '[]');
      } catch {
        parsedImages = [];
      }
      try {
        parsedSports = JSON.parse(facility.sports || '[]');
      } catch {
        parsedSports = [];
      }
      try {
        parsedAmenities = JSON.parse(facility.amenities || '[]');
      } catch {
        parsedAmenities = [];
      }

      const avgRating =
        facility.reviews.length > 0
          ? Number((facility.reviews.reduce((acc, r) => acc + r.rating, 0) / facility.reviews.length).toFixed(1))
          : 4.9;

      const prices = facility.courts.map((c) => c.pricePerHour);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 400;

      const totalReviews = await prisma.review.count({
        where: { facilityId: id },
      });

      facilityData = {
        ...facility,
        status: facility.status as any,
        images: parsedImages,
        sports: parsedSports,
        amenities: parsedAmenities,
        courts: facility.courts as CourtItem[],
        reviews: facility.reviews as unknown as ReviewItem[],
        avgRating,
        totalReviews,
        minPrice,
      };
    }
  } catch (error) {
    console.error('SingleVenuePage SSR error:', error);
  }

  if (!facilityData) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-24 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mx-auto text-tertiary">
          <Building2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-headline-md text-2xl font-bold text-on-surface">Venue Not Found</h2>
          <p className="text-tertiary text-sm max-w-md mx-auto">
            The sports facility you are looking for may have been unlisted or the URL is invalid.
          </p>
        </div>
        <Link
          href="/venues"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-container text-on-primary-container font-label-lg font-bold rounded-lg shadow-sm hover:opacity-95 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Venues Directory</span>
        </Link>
      </div>
    );
  }

  return <VenueDetailClient venue={facilityData} />;
}
