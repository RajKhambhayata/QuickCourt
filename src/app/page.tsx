import React from 'react';
import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import SportsCategoryPills from '@/components/SportsCategoryPills';
import VenueCard from '@/components/VenueCard';
import prisma from '@/lib/prisma';
import { FacilityWithDetails } from '@/lib/types';

export const revalidate = 0;

async function getFeaturedVenues(): Promise<FacilityWithDetails[]> {
  try {
    const venues = await prisma.facility.findMany({
      where: { status: 'APPROVED' },
      include: {
        courts: { where: { isActive: true } },
        reviews: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        owner: { select: { id: true, name: true, email: true } },
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
    });

    return venues.map((f) => {
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
          : 4.9;

      const prices = f.courts.map((c) => c.pricePerHour);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 450;

      return {
        ...f,
        images: parsedImages,
        sports: parsedSports,
        amenities: parsedAmenities,
        avgRating,
        totalReviews: f.reviews.length,
        minPrice,
      };
    }) as unknown as FacilityWithDetails[];
  } catch (error) {
    console.error('[getFeaturedVenues] Database query failed:', error);
    return [];
  }
}

export default async function HomePage() {
  const venues = await getFeaturedVenues();

  return (
    <div className="space-y-0 pb-20 bg-background text-on-surface">
      {/* 1. Kinetic Hero Section */}
      <HeroSection />

      {/* 2. 8 Sports Discipline Grid */}
      <SportsCategoryPills />

      {/* 3. How It Works in 3 Taps */}
      <section className="bg-surface-container-low py-16 w-full border-y border-surface-container-high/60">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-label-md text-label-md text-primary font-bold uppercase tracking-widest">
              Frictionless Athletics
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1 font-extrabold tracking-tight">
              Booked to Battling in 3 Steps
            </h2>
            <p className="font-body-md text-body-md text-tertiary mt-2">
              Zero phone calls, zero double-booked court disputes. Direct hardware integration locks your court instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="relative p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-full bg-primary text-on-primary font-display text-headline-sm flex items-center justify-center font-bold">
                    1
                  </span>
                  <span className="material-symbols-outlined text-[28px] text-tertiary">filter_alt</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2 font-bold">
                  Filter by Exact Surface
                </h3>
                <p className="font-body-md text-body-md text-tertiary leading-relaxed">
                  Browse arenas strictly certified by standards. Filter by BWF synthetic wooden mats, 50mm FIFA monofilament turf, or USAPA acrylic cushion.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-surface-container-high/40">
                <div className="flex items-center gap-2 text-primary font-label-md text-label-md font-semibold">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>BWF &amp; FIFA Verified Badges</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container font-display text-headline-sm flex items-center justify-center font-bold">
                    2
                  </span>
                  <span className="material-symbols-outlined text-[28px] text-primary">lock_clock</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2 font-bold">
                  Pick Live Instant Slot
                </h3>
                <p className="font-body-md text-body-md text-tertiary leading-relaxed">
                  Tap any green time slot on our live matrix. The moment you tap, your slot is locked exclusively for 10 minutes so nobody else can take it.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-surface-container-high/40">
                <div className="flex items-center gap-2 text-secondary-container font-label-md text-label-md font-semibold">
                  <span className="material-symbols-outlined text-[16px]">timer</span>
                  <span>Real-Time 10-Min Cart Lock</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary font-display text-headline-sm flex items-center justify-center font-bold">
                    3
                  </span>
                  <span className="material-symbols-outlined text-[28px] text-secondary-container">qr_code_scanner</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2 font-bold">
                  Flash QR &amp; Smash
                </h3>
                <p className="font-body-md text-body-md text-tertiary leading-relaxed">
                  Get an instant WhatsApp entry pass with QR code and turnstile pin. Walk right past the reception desk directly onto your court.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-surface-container-high/40">
                <div className="flex items-center gap-2 text-primary font-label-md text-label-md font-semibold">
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  <span>Direct WhatsApp Ticket Sync</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Verified Arenas Ready For Tonight */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-16 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-md text-[11px] font-extrabold uppercase tracking-wide">
                Top Rated Near You
              </span>
              <span className="font-label-md text-label-md text-tertiary font-semibold">
                Bengaluru • Live Availability
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
              Verified Arenas Ready For Tonight
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/venues"
              className="px-3.5 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors font-semibold"
            >
              Browse All Venues
            </Link>
          </div>
        </div>

        {venues.length === 0 ? (
          <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-surface-container-high">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">stadium</span>
            <p className="text-on-surface font-semibold">No approved arenas available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Facility Owner Banner */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 pt-4">
        <div className="bg-inverse-surface text-inverse-on-surface rounded-2xl p-8 sm:p-12 relative overflow-hidden border border-surface-container-high/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />
          <div className="space-y-4 max-w-xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-variant/20 text-primary-fixed text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-primary-container" />
              <span>For Arena &amp; Turf Owners</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">
              List Your Arena &amp; Turn Zero-Show Slots Into Revenue
            </h2>
            <p className="font-body-md text-body-md text-tertiary-fixed leading-relaxed">
              Join leading sports facilities using QuickCourt's zero double-booking live slot matrix, hardware lighting automation, and instant turnstile access control.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/owner/signup"
                className="px-6 py-3 rounded-lg bg-secondary-container hover:bg-secondary-container/90 text-on-secondary font-label-lg text-label-lg font-bold shadow-md transition-all"
              >
                Register Your Facility
              </Link>
              <Link
                href="/venues"
                className="px-6 py-3 rounded-lg bg-surface-container-low/20 hover:bg-surface-container-low/30 text-surface font-label-lg text-label-lg font-semibold border border-white/20 transition-all"
              >
                Explore Live Matrix
              </Link>
            </div>
          </div>

          <div className="w-full md:w-80 bg-surface-variant/10 backdrop-blur-md rounded-xl p-6 border border-white/10 space-y-3 font-body-sm text-body-sm text-tertiary-fixed relative z-10">
            <div className="font-bold text-surface uppercase tracking-wider font-label-md pb-2 border-b border-white/10 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary-container">verified</span>
              <span>Facility Partner Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-[18px]">check_circle</span>
              <span>Real-time booking sync &amp; instant payouts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-[18px]">check_circle</span>
              <span>Automated 10-minute hold lock</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-[18px]">check_circle</span>
              <span>One-tap walk-in &amp; academy blocking</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-[18px]">check_circle</span>
              <span>Live hardware lights &amp; gate controls</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
