'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import VenueCard from '@/components/VenueCard';
import SportsCategoryPills from '@/components/SportsCategoryPills';
import { FacilityWithDetails } from '@/lib/types';
import { SPORTS_LIST, CITIES_LIST } from '@/lib/constants';
import {
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  Sparkles,
  Building2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

function VenuesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter states initialized from URL
  const initialSport = searchParams.get('sport') || 'All';
  const initialCity = searchParams.get('city') || 'All';
  const initialSearch = searchParams.get('search') || '';
  const initialVenueType = searchParams.get('venueType') || 'All';
  const initialRating = searchParams.get('minRating') || '0';
  const initialMaxPrice = searchParams.get('maxPrice') || '2000';

  const [venues, setVenues] = useState<FacilityWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [sport, setSport] = useState(initialSport);
  const [city, setCity] = useState(initialCity);
  const [search, setSearch] = useState(initialSearch);
  const [venueType, setVenueType] = useState(initialVenueType);
  const [minRating, setMinRating] = useState(initialRating);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchVenues = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (sport !== 'All') params.set('sport', sport);
    if (city !== 'All') params.set('city', city);
    if (search.trim()) params.set('search', search.trim());
    if (venueType !== 'All') params.set('venueType', venueType);
    if (parseFloat(minRating) > 0) params.set('minRating', minRating);
    if (parseFloat(maxPrice) < 5000) params.set('maxPrice', maxPrice);

    fetch(`/api/venues?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.facilities) {
          setVenues(data.facilities);
          setCurrentPage(1);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVenues();
  }, [sport, city, venueType, minRating, maxPrice]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVenues();
  };

  const handleResetFilters = () => {
    setSport('All');
    setCity('All');
    setSearch('');
    setVenueType('All');
    setMinRating('0');
    setMaxPrice('5000');
  };

  // Pagination slices
  const totalPages = Math.ceil(venues.length / itemsPerPage);
  const displayedVenues = venues.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sports Facilities & Clubs</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1 font-display">
            Find & Book Sports Venues
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {venues.length} approved courts and turfs ready for immediate booking
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search venue name, location..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/25"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Sports Category Pills */}
      <div className="mb-8">
        <SportsCategoryPills />
      </div>

      {/* Layout with Filters Sidebar & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} lg:col-span-1`}>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                Filter Options
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Sport Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Sport Type
              </label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="All">All Sports</option>
                {SPORTS_LIST.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Location / City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="All">All Locations</option>
                {CITIES_LIST.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Venue Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Venue Environment
              </label>
              <div className="space-y-2 text-xs">
                {['All', 'Indoor', 'Outdoor'].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="venueType"
                      checked={venueType === type}
                      onChange={() => setVenueType(type)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-700">{type === 'All' ? 'All Types' : type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                <span>Max Hourly Price</span>
                <span className="text-emerald-600 font-extrabold text-sm">₹{maxPrice}/hr</span>
              </div>
              <input
                type="range"
                min="200"
                max="3000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                <span>₹200</span>
                <span>₹3,000+</span>
              </div>
            </div>

            {/* Min Rating Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Minimum Rating
              </label>
              <div className="space-y-1.5 text-xs">
                {[
                  { val: '0', label: 'Any Rating' },
                  { val: '4.5', label: '4.5 & above' },
                  { val: '4.0', label: '4.0 & above' },
                  { val: '3.5', label: '3.5 & above' },
                ].map((r) => (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => setMinRating(r.val)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition flex items-center justify-between ${
                      minRating === r.val
                        ? 'bg-emerald-50 text-emerald-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{r.label}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Venues Grid */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-white border border-slate-200 animate-pulse p-4 space-y-3">
                  <div className="h-44 bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : venues.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">No sports venues found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your filters, selecting a different sport, or resetting the search criteria.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayedVenues.map((venue) => (
                  <VenueCard key={venue.id} venue={venue} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pt-6 flex items-center justify-between border-t border-slate-200">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40 hover:bg-white flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  <div className="text-xs font-bold text-slate-600">
                    Page {currentPage} of {totalPages}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40 hover:bg-white flex items-center gap-1"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VenuesPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <Suspense fallback={<div className="max-w-7xl mx-auto p-8 text-center text-slate-400">Loading sports directory...</div>}>
        <VenuesContent />
      </Suspense>
    </div>
  );
}
