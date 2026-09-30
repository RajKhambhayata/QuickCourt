'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CourtSelector from '@/components/CourtSelector';
import BookingModal from '@/components/BookingModal';
import ReviewSection from '@/components/ReviewSection';
import { FacilityWithDetails, CourtItem, SlotStatus } from '@/lib/types';
import {
  MapPin,
  Star,
  CheckCircle2,
  Phone,
  Mail,
  Shield,
  Clock,
  ArrowLeft,
  Share2,
  CalendarCheck,
  Building,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export default function SingleVenuePage() {
  const params = useParams();
  const router = useRouter();
  const venueId = params.id as string;

  const [venue, setVenue] = useState<FacilityWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<CourtItem | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotStatus | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    if (!venueId) return;

    fetch(`/api/venues/${venueId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.facility) {
          setVenue(data.facility);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [venueId]);

  const handleProceedToBooking = (court: CourtItem, slot: SlotStatus, date: string) => {
    setSelectedCourt(court);
    setSelectedSlot(slot);
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const scrollToBooking = () => {
    const el = document.getElementById('booking-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="animate-pulse space-y-4">
          <div className="h-96 bg-slate-200 rounded-3xl" />
          <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto" />
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <Building className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Venue Not Found</h2>
        <button
          onClick={() => router.push('/venues')}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Venues Directory
        </button>
      </div>
    );
  }

  const images = venue.images && venue.images.length > 0 ? venue.images : [
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200'
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Top breadcrumb bar */}
      <div className="bg-white border-b border-slate-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => router.push('/venues')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Venues</span>
          </button>

          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                alert('Venue link copied to clipboard!');
              }
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-600 transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Venue</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* 1. Photo Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-[350px] sm:h-[450px] rounded-3xl overflow-hidden relative shadow-md">
            <img
              src={images[activeImageIndex] || images[0]}
              alt={venue.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold">
              {venue.venueType || 'Indoor & Outdoor'}
            </div>
          </div>

          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative h-28 sm:h-[138px] min-w-[120px] rounded-2xl overflow-hidden border-2 transition ${
                  activeImageIndex === idx
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* 2. Venue Main Details & Quick Booking Action */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-2.5 py-0.5 rounded-full border border-emerald-200">
                Verified Venue
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{venue.avgRating ? venue.avgRating.toFixed(1) : '5.0'}</span>
                <span className="text-slate-500 font-normal">({venue.totalReviews || 0} reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{venue.name}</h1>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{venue.address}, {venue.city}</span>
            </div>

            {/* Sports Offered Tags */}
            <div className="pt-2 flex flex-wrap gap-1.5">
              {venue.sports.map((sport) => (
                <span
                  key={sport}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition"
                >
                  🏸 {sport}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div>
              <span className="text-xs text-slate-400 font-semibold block uppercase">Starts from</span>
              <span className="text-3xl font-black text-slate-900">
                ₹{venue.minPrice || 400}
                <span className="text-xs font-normal text-slate-500"> / hour</span>
              </span>
            </div>

            <button
              onClick={scrollToBooking}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Book Now</span>
            </button>
          </div>
        </div>

        {/* 3. About Venue & Amenities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* About Venue */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-slate-900">About this Venue</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {venue.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-slate-900">Amenities & Facilities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {venue.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5 text-xs font-bold text-slate-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Court Slot Selector Section */}
            {venue.courts.length > 0 ? (
              <CourtSelector
                courts={venue.courts}
                facilityName={venue.name}
                onProceedToBooking={handleProceedToBooking}
              />
            ) : (
              <div className="p-8 bg-amber-50 rounded-2xl border border-amber-200 text-center text-amber-800 text-xs">
                Courts are currently being updated by the facility owner.
              </div>
            )}

            {/* 5. Reviews Section */}
            <ReviewSection
              facilityId={venue.id}
              reviews={venue.reviews}
              avgRating={venue.avgRating || 5.0}
            />
          </div>

          {/* Sidebar Venue Info & Rules */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Operating Schedule
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-700">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Open 7 Days: 06:00 AM – 11:00 PM</span>
              </div>
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-2">
                <p className="font-semibold text-slate-800">Venue Rules:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Non-marking sports shoes mandatory for wooden courts.</li>
                  <li>Please arrive 10 minutes prior to your booked slot.</li>
                  <li>Equipment available on rent at reception.</li>
                </ul>
              </div>
            </div>

            {venue.owner && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Facility Manager
                </h3>
                <div className="text-xs space-y-1">
                  <div className="font-bold text-slate-900">{venue.owner.name}</div>
                  {venue.owner.email && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{venue.owner.email}</span>
                    </div>
                  )}
                  {venue.owner.phone && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{venue.owner.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Checkout Modal */}
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
