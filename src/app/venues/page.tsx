import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import VenueCard from '@/components/VenueCard';
import SportsCategoryPills from '@/components/SportsCategoryPills';
import VenuesFilterSidebar from './VenuesFilterSidebar';
import prisma from '@/lib/prisma';
import { FacilityWithDetails } from '@/lib/types';
import {
  normalizeSportSlug,
  getSportDbSearchTerms,
  getCityDbSearchTerms,
  getSportName,
} from '@/lib/constants';
import {
  Building2,
  AlertCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  const sportParam = typeof searchParams?.sport === 'string' ? searchParams.sport : undefined;
  const cityParam = typeof searchParams?.city === 'string' ? searchParams.city : undefined;

  const sportName = sportParam ? getSportName(sportParam) : '';
  const titlePrefix = sportName && sportName !== 'All Sports' ? `${sportName} Venues` : 'Find & Book Sports Venues';
  const locationSuffix = cityParam && cityParam !== 'All' ? ` in ${cityParam}` : '';

  return {
    title: `${titlePrefix}${locationSuffix} | QuickCourt`,
    description: `Browse verified ${sportName || 'sports'} arenas, floodlit turfs, and indoor courts${locationSuffix} available for instant slot booking on QuickCourt.`,
    openGraph: {
      title: `${titlePrefix}${locationSuffix} | QuickCourt`,
      description: `Browse verified ${sportName || 'sports'} arenas, floodlit turfs, and indoor courts${locationSuffix}.`,
      type: 'website',
    },
  };
}

interface PageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

async function fetchVenuesData(params?: { [key: string]: string | string[] | undefined }) {
  const sportParam = typeof params?.sport === 'string' ? params.sport : '';
  const cityParam = typeof params?.city === 'string' ? params.city : '';
  const searchParam = typeof params?.search === 'string' ? params.search.trim() : '';
  const venueTypeParam = typeof params?.venueType === 'string' ? params.venueType : '';
  const minRatingParam = typeof params?.minRating === 'string' ? parseFloat(params.minRating) : 0;
  const maxPriceParam = typeof params?.maxPrice === 'string' ? parseFloat(params.maxPrice) : 5000;
  const pageParam = typeof params?.page === 'string' ? Math.max(1, parseInt(params.page) || 1) : 1;
  const itemsPerPage = 6;

  try {
    const andConditions: any[] = [{ status: 'APPROVED' }];

    // City filtering with alias expansion (e.g. Bengaluru <-> Bangalore)
    const cityTerms = getCityDbSearchTerms(cityParam);
    if (cityTerms.length > 0) {
      andConditions.push({
        OR: cityTerms.map((c) => ({
          city: { contains: c, mode: 'insensitive' },
        })),
      });
    }

    // Venue environment filtering
    if (venueTypeParam && venueTypeParam !== 'All') {
      andConditions.push({
        venueType: { contains: venueTypeParam, mode: 'insensitive' },
      });
    }

    // Keyword search
    if (searchParam) {
      andConditions.push({
        OR: [
          { name: { contains: searchParam, mode: 'insensitive' } },
          { description: { contains: searchParam, mode: 'insensitive' } },
          { address: { contains: searchParam, mode: 'insensitive' } },
          { sports: { contains: searchParam, mode: 'insensitive' } },
        ],
      });
    }

    // Sport filtering at DB level
    const sportTerms = getSportDbSearchTerms(sportParam);
    if (sportTerms.length > 0) {
      andConditions.push({
        OR: sportTerms.map((term) => ({
          sports: { contains: term, mode: 'insensitive' },
        })),
      });
    }

    const where = { AND: andConditions };

    const facilities = await prisma.facility.findMany({
      where,
      include: {
        courts: {
          where: { isActive: true },
          select: { id: true, name: true, sportType: true, pricePerHour: true },
        },
        reviews: {
          select: { id: true, rating: true, user: { select: { id: true, name: true, avatar: true } } },
        },
        owner: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted: FacilityWithDetails[] = facilities.map((f) => {
      let parsedImages: string[] = [];
      let parsedSports: string[] = [];
      let parsedAmenities: string[] = [];

      try {
        parsedImages = typeof f.images === 'string' ? JSON.parse(f.images || '[]') : (f.images || []);
      } catch {
        parsedImages = [];
      }
      try {
        parsedSports = typeof f.sports === 'string' ? JSON.parse(f.sports || '[]') : (f.sports || []);
      } catch {
        parsedSports = [];
      }
      try {
        parsedAmenities = typeof f.amenities === 'string' ? JSON.parse(f.amenities || '[]') : (f.amenities || []);
      } catch {
        parsedAmenities = [];
      }

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
      } as unknown as FacilityWithDetails;
    });

    // Client-side computed fields filter
    let filtered = formatted;
    if (minRatingParam > 0) {
      filtered = filtered.filter((f) => (f.avgRating || 0) >= minRatingParam);
    }
    if (maxPriceParam < 5000) {
      filtered = filtered.filter((f) => (f.minPrice || 0) <= maxPriceParam);
    }

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;
    const currentPage = Math.min(pageParam, totalPages);
    const displayedVenues = filtered.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    return {
      venues: displayedVenues,
      totalCount,
      totalPages,
      currentPage,
      error: null,
    };
  } catch (error) {
    console.error('[fetchVenuesData] Error loading venues:', error);
    return {
      venues: [],
      totalCount: 0,
      totalPages: 1,
      currentPage: 1,
      error: error instanceof Error ? error.message : 'Database service temporarily unavailable.',
    };
  }
}

export default async function VenuesPage({ searchParams }: PageProps) {
  const sport = typeof searchParams?.sport === 'string' ? searchParams.sport : 'All';
  const city = typeof searchParams?.city === 'string' ? searchParams.city : 'All';
  const search = typeof searchParams?.search === 'string' ? searchParams.search : '';
  const venueType = typeof searchParams?.venueType === 'string' ? searchParams.venueType : 'All';
  const minRating = typeof searchParams?.minRating === 'string' ? searchParams.minRating : '0';
  const maxPrice = typeof searchParams?.maxPrice === 'string' ? searchParams.maxPrice : '5000';

  const { venues, totalCount, totalPages, currentPage, error } = await fetchVenuesData(searchParams);

  // Helper for pagination links
  const createPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    if (sport && sport !== 'All') params.set('sport', sport);
    if (city && city !== 'All') params.set('city', city);
    if (search.trim()) params.set('search', search.trim());
    if (venueType && venueType !== 'All') params.set('venueType', venueType);
    if (parseFloat(minRating) > 0) params.set('minRating', minRating);
    if (parseFloat(maxPrice) < 5000) params.set('maxPrice', maxPrice);
    if (targetPage > 1) params.set('page', targetPage.toString());
    const qs = params.toString();
    return `/venues${qs ? `?${qs}` : ''}`;
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">sports_tennis</span>
              <span>Sports Facilities &amp; Clubs</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Find &amp; Book Sports Venues
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Showing {totalCount} approved courts and turfs ready for immediate booking
            </p>
          </div>
        </div>

        {/* Sports Category Pills */}
        <div className="mb-8">
          <SportsCategoryPills />
        </div>

        {/* Layout with Filters Sidebar & Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar (Client Component) */}
          <VenuesFilterSidebar
            initialSport={sport}
            initialCity={city}
            initialSearch={search}
            initialVenueType={venueType}
            initialMinRating={minRating}
            initialMaxPrice={maxPrice}
          />

          {/* Venues Grid */}
          <div className="lg:col-span-3 space-y-6">
            {error ? (
              <div className="bg-white rounded-3xl border border-red-200 p-12 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Unable to load venues</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {error}
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Link
                    href="/venues"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Try Again
                  </Link>
                  <Link
                    href="/venues"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Filters
                  </Link>
                </div>
              </div>
            ) : venues.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">No sports venues found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No arenas match the selected filters. Try choosing a different sport, resetting location, or adjusting the price range.
                </p>
                <div className="pt-2">
                  <Link
                    href="/venues"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset All Filters
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {venues.map((venue) => (
                    <VenueCard key={venue.id} venue={venue} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="pt-6 flex items-center justify-between border-t border-slate-200">
                    {currentPage > 1 ? (
                      <Link
                        href={createPageUrl(currentPage - 1)}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white flex items-center gap-1 transition"
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </Link>
                    ) : (
                      <span className="px-3 py-2 rounded-lg border border-slate-100 text-xs font-bold text-slate-300 cursor-not-allowed flex items-center gap-1">
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </span>
                    )}

                    <div className="text-xs font-bold text-slate-600">
                      Page {currentPage} of {totalPages}
                    </div>

                    {currentPage < totalPages ? (
                      <Link
                        href={createPageUrl(currentPage + 1)}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white flex items-center gap-1 transition"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <span className="px-3 py-2 rounded-lg border border-slate-100 text-xs font-bold text-slate-300 cursor-not-allowed flex items-center gap-1">
                        Next <ChevronRight className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
