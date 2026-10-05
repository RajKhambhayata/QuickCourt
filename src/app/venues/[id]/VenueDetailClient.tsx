'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import CourtSelector from '@/components/CourtSelector';
import BookingModal from '@/components/BookingModal';
import ReviewSection from '@/components/ReviewSection';
import { FacilityWithDetails, CourtItem, SlotStatus } from '@/lib/types';
import { getSportBySlug } from '@/lib/constants';
import {
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  ChevronRight,
  Share2,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  Mail,
  Camera,
  Wind,
  ParkingCircle,
  Coffee,
  Trophy,
} from 'lucide-react';

interface VenueDetailClientProps {
  venue: FacilityWithDetails;
}

export default function VenueDetailClient({ venue }: VenueDetailClientProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [saved, setSaved] = useState(false);

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<CourtItem | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotStatus | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const handleProceedToBooking = (court: CourtItem, slot: SlotStatus, date: string) => {
    setSelectedCourt(court);
    setSelectedSlot(slot);
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const defaultBentoImages = [
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200',
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
  ];

  const images = venue.images && venue.images.length > 0 ? venue.images : defaultBentoImages;
  const primarySport = venue.sports && venue.sports.length > 0 ? venue.sports[0] : 'Sports';
  const sportMeta = getSportBySlug(primarySport);

  return (
    <div className="bg-background min-h-screen pb-32 text-on-surface">
      <div className="max-w-[1280px] w-full mx-auto px-4 md:px-6 lg:px-10 py-4">
        {/* Breadcrumb Row */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-on-surface-variant font-label-md text-label-md mb-3 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/venues?city=${encodeURIComponent(venue.city || 'Bengaluru')}`} className="hover:text-primary transition-colors">
            {venue.city || 'Bengaluru'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/venues?sport=${encodeURIComponent(primarySport)}`} className="hover:text-primary transition-colors">
            {primarySport}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-on-surface font-semibold truncate max-w-[200px] sm:max-w-none">{venue.name}</span>
        </nav>

        {/* Header & Verification Badges */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-headline-lg text-2xl sm:text-3xl text-on-surface font-black tracking-tight">
                {venue.name}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md font-bold shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                Verified Facility
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-label-md text-label-md font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {venue.avgRating ? venue.avgRating.toFixed(1) : '4.9'}{' '}
                <span className="font-normal text-amber-800/80">({venue.totalReviews || 12} reviews)</span>
              </span>
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant flex flex-wrap items-center gap-y-1 gap-x-2">
              <span className="inline-flex items-center gap-1 text-on-surface font-medium">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                {venue.address}, {venue.city}
              </span>
              <span className="text-outline-variant">•</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                Open 06:00 AM – 11:30 PM
              </span>
              <span className="text-outline-variant">•</span>
              <span className="inline-flex items-center gap-1 text-on-surface">
                <span className="text-sm">{sportMeta?.icon || '🏸'}</span>
                {venue.courts.length} Certified Courts
              </span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start shrink-0">
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Arena link copied to clipboard!');
                }
              }}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button
              onClick={() => setSaved(!saved)}
              type="button"
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-label-md text-label-md transition-colors shadow-sm ${
                saved ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
              }`}
            >
              {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Venue Gallery Bento */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-2 rounded-2xl overflow-hidden mb-6 shadow-md max-h-[460px]">
          {/* Main Hero Shot */}
          <div className="md:col-span-2 lg:col-span-3 relative h-72 md:h-full group overflow-hidden bg-surface-container">
            <img
              src={images[activeImageIndex] || images[0]}
              alt={venue.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/70 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-inverse-surface/85 backdrop-blur-md text-inverse-on-surface font-label-md text-label-md">
              <span>{sportMeta?.icon || '🏸'}</span>
              <span>Court Fleet • BWF &amp; Pro Tournament Grade</span>
            </div>
          </div>

          {/* Secondary Vertical Shot */}
          <div className="relative h-44 md:h-full hidden md:block group overflow-hidden bg-surface-container">
            <img
              src={images[1] || images[0]}
              alt="Surface Layering"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-inverse-surface/75 backdrop-blur-sm text-inverse-on-surface font-label-md text-[11px] font-semibold">
              Synthetic Layering
            </div>
          </div>

          {/* Stacked Right Tiles */}
          <div className="flex flex-col gap-2 lg:col-span-2">
            <div className="relative h-[146px] group overflow-hidden bg-surface-container rounded-lg">
              <img
                src={images[2] || images[0]}
                alt="Pro Shop"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-inverse-surface/75 backdrop-blur-sm text-inverse-on-surface font-label-md text-[11px] font-semibold">
                Equipment &amp; Pro Shop
              </div>
            </div>
            <div className="relative h-[146px] group overflow-hidden bg-surface-container rounded-lg">
              <img
                src={images[3] || images[0]}
                alt="Locker & Showers"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-inverse-surface/75 backdrop-blur-sm text-inverse-on-surface font-label-md text-[11px] font-semibold">
                Showers &amp; Secure Lockers
              </div>
              <button
                onClick={() => setActiveImageIndex((activeImageIndex + 1) % images.length)}
                className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-md text-label-md shadow-md hover:bg-surface-container-lowest transition-colors"
                type="button"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>+{images.length} photos</span>
              </button>
            </div>
          </div>
        </div>

        {/* Amenity Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md whitespace-nowrap shadow-sm border border-surface-container-high/40">
            <Wind className="w-4 h-4 text-emerald-600" />
            <span>Air Conditioned</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md whitespace-nowrap shadow-sm border border-surface-container-high/40">
            <Trophy className="w-4 h-4 text-emerald-600" />
            <span>Equipment Rental</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md whitespace-nowrap shadow-sm border border-surface-container-high/40">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Shower &amp; Locker</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md whitespace-nowrap shadow-sm border border-surface-container-high/40">
            <ParkingCircle className="w-4 h-4 text-emerald-600" />
            <span>Free 4-Wheeler Parking</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md whitespace-nowrap shadow-sm border border-surface-container-high/40">
            <Coffee className="w-4 h-4 text-emerald-600" />
            <span>Cafeteria &amp; Juice Bar</span>
          </div>
        </div>

        {/* Live Slot Matrix Section */}
        {venue.courts.length > 0 ? (
          <div className="mb-10">
            <CourtSelector
              courts={venue.courts}
              facilityName={venue.name}
              onProceedToBooking={handleProceedToBooking}
            />
          </div>
        ) : (
          <div className="p-8 bg-surface-container-lowest rounded-2xl border border-surface-container-high text-center text-on-surface-variant font-semibold mb-10">
            Courts are currently being updated by the facility manager.
          </div>
        )}

        {/* Venue Information & Rules Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* About Arena */}
            <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-6 shadow-sm space-y-3">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">About {venue.name}</h3>
              <p className="font-body-md text-body-md text-tertiary leading-relaxed whitespace-pre-line">
                {venue.description || 'Premier athletic destination featuring BWF certified courts, high-grade anti-glare tournament LED lighting, player lounges, and modern changing facilities.'}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-6 shadow-sm space-y-3">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Included Facility Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {venue.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="p-3 bg-surface-container-low rounded-xl border border-surface-container-high/40 flex items-center gap-2 text-xs font-bold text-on-surface"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Reviews Section */}
            <ReviewSection
              facilityId={venue.id}
              reviews={venue.reviews}
              avgRating={venue.avgRating || 4.9}
            />
          </div>

          {/* Sidebar Venue Info & Rules */}
          <div className="space-y-6">
            <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-6 shadow-sm space-y-4">
              <h3 className="font-label-md text-label-md uppercase font-bold text-tertiary tracking-wider">
                Operating Rules &amp; Guidelines
              </h3>
              <div className="flex items-center gap-3 text-xs text-on-surface">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">Open 7 Days: 06:00 AM – 11:30 PM</span>
              </div>
              <div className="pt-3 border-t border-surface-container-high/40 text-xs text-tertiary space-y-2">
                <p className="font-bold text-on-surface">Player Policy:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Non-marking rubber shoes strictly mandatory on wooden/mat courts.</li>
                  <li>Arrive 10 minutes prior to your allocated slot for gate check-in.</li>
                  <li>Certified equipment available on rent at the reception pro shop.</li>
                  <li>Digital QR pass generated instantly in your QuickCourt bookings portal.</li>
                </ul>
              </div>
            </div>

            {venue.owner && (
              <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-6 shadow-sm space-y-3">
                <h3 className="font-label-md text-label-md uppercase font-bold text-tertiary tracking-wider">
                  Facility Management
                </h3>
                <div className="text-xs space-y-1.5">
                  <div className="font-bold text-sm text-on-surface">{venue.owner.name}</div>
                  {venue.owner.email && (
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <Mail className="w-4 h-4 text-tertiary" />
                      <span>{venue.owner.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-emerald-600 font-semibold pt-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verified Arena Partner</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedCourt && selectedSlot && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          court={selectedCourt}
          slot={selectedSlot}
          date={selectedDate}
          facilityName={venue.name}
          facilityAddress={`${venue.address}, ${venue.city}`}
        />
      )}
    </div>
  );
}
