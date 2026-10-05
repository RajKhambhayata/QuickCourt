import React from 'react';
import Link from 'next/link';
import { FacilityWithDetails } from '@/lib/types';
import { getSportBySlug } from '@/lib/constants';
import { MapPin, Star, CheckCircle2, ChevronRight } from 'lucide-react';

export default function VenueCard({ venue }: { venue: FacilityWithDetails }) {
  const thumbnail =
    venue.images && venue.images.length > 0
      ? venue.images[0]
      : 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600';

  const primarySport = venue.sports && venue.sports.length > 0 ? venue.sports[0] : 'Sports';
  const sportMeta = getSportBySlug(primarySport);

  return (
    <div className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Image Container with Scrim & Badges */}
        <div className="relative h-48 w-full overflow-hidden bg-surface-container">
          <img
            src={thumbnail}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-on-background/85 via-transparent to-black/30" />

          {/* Pill sport tag */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-inverse-surface/85 backdrop-blur-md text-inverse-on-surface font-label-md text-body-sm font-bold flex items-center gap-1.5 shadow-sm">
            <span>{sportMeta?.icon || '🏸'}</span>
            <span>{primarySport}</span>
          </div>

          {/* Distance & Rating badge */}
          <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-inverse-surface/85 backdrop-blur-md text-inverse-on-surface font-label-md text-body-sm font-bold flex items-center gap-1 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{venue.avgRating ? venue.avgRating.toFixed(1) : '4.9'}</span>
          </div>

          {/* Bottom verified indicator & proximity */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-inverse-on-surface">
            <span className="font-label-md text-body-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{venue.venueType || 'Verified Facility'}</span>
            </span>
            <span className="font-data-mono text-body-sm text-emerald-400 font-bold">
              2.1 km away
            </span>
          </div>
        </div>

        {/* Body Meta */}
        <div className="p-4 space-y-2">
          <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors font-bold truncate">
            {venue.name}
          </h3>

          <p className="font-body-sm text-body-sm text-tertiary flex items-center gap-1.5 truncate">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">{venue.address}, {venue.city}</span>
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {venue.courts && venue.courts.length > 0 && (
              <span className="px-2 py-0.5 rounded bg-surface-container font-label-md text-[11px] text-on-surface-variant font-medium">
                {venue.courts.length} Courts
              </span>
            )}
            {venue.amenities && venue.amenities.slice(0, 2).map((a) => (
              <span key={a} className="px-2 py-0.5 rounded bg-surface-container font-label-md text-[11px] text-on-surface-variant font-medium">
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info & Conversion Button */}
      <div className="p-4 pt-2 border-t border-surface-container-high/40 flex items-center justify-between mt-auto">
        <div>
          <span className="font-label-md text-[11px] uppercase font-bold text-tertiary tracking-wider block">
            Starts from
          </span>
          <div className="font-headline-sm text-headline-sm text-on-surface font-extrabold tnum">
            ₹{venue.minPrice || 400}
            <span className="text-body-sm font-normal text-tertiary">/hr</span>
          </div>
        </div>

        <Link
          href={`/venues/${venue.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary-container hover:bg-secondary-container/90 active:scale-[0.98] text-on-secondary font-label-lg text-label-lg font-bold shadow-sm transition-all"
        >
          <span>Book Slot</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
