import React from 'react';
import Link from 'next/link';
import { MapPin, Star, Sparkles, ArrowRight, Clock, Shield, Trophy } from 'lucide-react';
import { FacilityWithDetails } from '@/lib/types';

export default function VenueCard({ venue }: { venue: FacilityWithDetails }) {
  const thumbnail =
    venue.images && venue.images.length > 0
      ? venue.images[0]
      : 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600';

  const getSportColor = (sport: string) => {
    const colors: Record<string, string> = {
      'Badminton': 'bg-emerald-500',
      'Cricket': 'bg-teal-500',
      'Tennis': 'bg-blue-500',
      'Football': 'bg-orange-500',
      'Basketball': 'bg-rose-500',
      'Volleyball': 'bg-purple-500',
      'Pickleball': 'bg-cyan-500',
      'Squash': 'bg-indigo-500',
    };
    return colors[sport] || 'bg-emerald-500';
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden card-hover">
      {/* Image Thumbnail */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-100">
        <img
          src={thumbnail}
          alt={venue.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg text-xs font-bold text-slate-900">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>{venue.avgRating ? venue.avgRating.toFixed(1) : '5.0'}</span>
          <span className="text-slate-400 font-normal">({venue.totalReviews || 0})</span>
        </div>

        {/* Venue Type Tag */}
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-lg text-[11px] font-semibold text-white tracking-wide flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span>{venue.venueType || 'Verified'}</span>
        </div>

        {/* Sports tags inside image bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
          {venue.sports.slice(0, 3).map((sport) => (
            <span
              key={sport}
              className={`${getSportColor(sport)} backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md`}
            >
              {sport}
            </span>
          ))}
          {venue.sports.length > 3 && (
            <span className="bg-slate-800/90 text-white text-[11px] font-bold px-2 py-1 rounded-full shadow-md">
              +{venue.sports.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1 font-display">
              {venue.name}
            </h3>
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              <Trophy className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">Top Rated</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">{venue.address}, {venue.city}</span>
          </div>

          <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
            {venue.description}
          </p>

          {/* Quick info badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>Real-time Slots</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Instant Booking</span>
            </div>
          </div>
        </div>

        {/* Footer info & CTA */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
              Starting from
            </span>
            <div className="text-slate-900 font-extrabold text-lg">
              ₹{venue.minPrice || 400}
              <span className="text-xs font-normal text-slate-500">/hr</span>
            </div>
          </div>

          <Link
            href={`/venues/${venue.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40"
          >
            <span>Book Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
