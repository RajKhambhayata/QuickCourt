import React from 'react';
import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import VenueCard from '@/components/VenueCard';
import prisma from '@/lib/prisma';
import {
  CalendarCheck2,
  ShieldCheck,
  Zap,
  Users2,
  ArrowRight,
  Star,
  CheckCircle,
  Building2,
  Award,
} from 'lucide-react';
import { FacilityWithDetails } from '@/lib/types';

export const revalidate = 0;

async function getFeaturedVenues() {
  const venues = await prisma.facility.findMany({
    where: { status: 'APPROVED' },
    include: {
      courts: { where: { isActive: true } },
      reviews: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      owner: { select: { id: true, name: true, email: true } },
    },
    take: 6,
    orderBy: { createdAt: 'desc' },
  });

  return venues.map((f) => {
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
      ...f,
      images: parsedImages,
      sports: parsedSports,
      amenities: parsedAmenities,
      avgRating,
      totalReviews: f.reviews.length,
      minPrice,
    };
  }) as unknown as FacilityWithDetails[];
}

export default async function HomePage() {
  const venues = await getFeaturedVenues();

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Section with Carousel & Search */}
      <HeroSection />

      {/* 2. Featured / Popular Venues Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span>Verified Sports Complexes</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              Popular Venues Near You
            </h2>
          </div>

          <Link
            href="/venues"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 group"
          >
            <span>Browse All Venues</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {venues.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold">No approved venues available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}
      </section>

      {/* 3. Why QuickCourt (Key Features) */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Seamless Experience
            </span>
            <h2 className="text-3xl font-black text-white mt-1">
              Engineered For Players & Facility Owners
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Live Slot Matrix</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero double bookings. View real-time open time slots and reserve within seconds.
              </p>
            </div>

            <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">100% Verified Courts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every listed venue is thoroughly audited by admins for flooring, lighting, and amenities.
              </p>
            </div>

            <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <CalendarCheck2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Instant Rescheduling</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Flexibility to cancel or reschedule your games directly from your player portal.
              </p>
            </div>

            <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Users2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Owner Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Facility owners get deep insights into peak hours, revenue trends, and maintenance controls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Step-by-Step Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">
              Own a Sports Turf or Badminton Court?
            </span>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              List Your Arena & Maximize Daily Court Bookings
            </h2>
            <p className="text-sm text-emerald-100 leading-relaxed">
              Join hundreds of sports clubs using QuickCourt to manage time slot availability, block maintenance hours, and track automated earnings.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/signup?role=OWNER"
                className="px-6 py-3 bg-white hover:bg-slate-100 text-emerald-950 font-black text-xs rounded-xl shadow-lg transition"
              >
                Register as Facility Owner
              </Link>
              <Link
                href="/venues"
                className="px-6 py-3 bg-emerald-800/60 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl border border-emerald-400/40 transition"
              >
                Explore Venues
              </Link>
            </div>
          </div>

          <div className="w-full md:w-80 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-3 text-xs">
            <div className="font-bold text-white uppercase tracking-wider text-[11px] pb-2 border-b border-white/20">
              Owner Benefits
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Real-time booking notifications</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Automated conflict-free slot calendar</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Maintenance & coaching slot blockers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Detailed revenue & peak hours analytics</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
