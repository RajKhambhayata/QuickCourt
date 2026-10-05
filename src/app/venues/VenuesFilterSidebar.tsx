'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SPORTS_LIST, CITIES_LIST, normalizeSportSlug } from '@/lib/constants';
import {
  SlidersHorizontal,
  Star,
  RotateCcw,
  Search,
} from 'lucide-react';

interface VenuesFilterSidebarProps {
  initialSport: string;
  initialCity: string;
  initialSearch: string;
  initialVenueType: string;
  initialMinRating: string;
  initialMaxPrice: string;
}

export default function VenuesFilterSidebar({
  initialSport,
  initialCity,
  initialSearch,
  initialVenueType,
  initialMinRating,
  initialMaxPrice,
}: VenuesFilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [sport, setSport] = useState(normalizeSportSlug(initialSport));
  const [city, setCity] = useState(initialCity || 'All');
  const [search, setSearch] = useState(initialSearch || '');
  const [venueType, setVenueType] = useState(initialVenueType || 'All');
  const [minRating, setMinRating] = useState(initialMinRating || '0');
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice || '5000');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const applyFilters = (overrides?: {
    sport?: string;
    city?: string;
    search?: string;
    venueType?: string;
    minRating?: string;
    maxPrice?: string;
  }) => {
    const s = overrides?.sport !== undefined ? overrides.sport : sport;
    const c = overrides?.city !== undefined ? overrides.city : city;
    const q = overrides?.search !== undefined ? overrides.search : search;
    const v = overrides?.venueType !== undefined ? overrides.venueType : venueType;
    const r = overrides?.minRating !== undefined ? overrides.minRating : minRating;
    const p = overrides?.maxPrice !== undefined ? overrides.maxPrice : maxPrice;

    const params = new URLSearchParams();
    if (s && s !== 'All') params.set('sport', s);
    if (c && c !== 'All') params.set('city', c);
    if (q && q.trim()) params.set('search', q.trim());
    if (v && v !== 'All') params.set('venueType', v);
    if (r && parseFloat(r) > 0) params.set('minRating', r);
    if (p && parseFloat(p) < 5000) params.set('maxPrice', p);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleReset = () => {
    setSport('All');
    setCity('All');
    setSearch('');
    setVenueType('All');
    setMinRating('0');
    setMaxPrice('5000');
    startTransition(() => {
      router.push(pathname);
    });
  };

  return (
    <>
      {/* Top Search Bar & Mobile Trigger */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search venue name, location, sport..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
          >
            {isPending ? 'Searching...' : 'Search'}
          </button>
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 shadow-sm"
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Filter Sidebar (Desktop and Mobile Drawer) */}
      <div className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} lg:col-span-1`}>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              Filter Options
            </span>
            <button
              onClick={handleReset}
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
              onChange={(e) => {
                const val = e.target.value;
                setSport(val);
                applyFilters({ sport: val });
              }}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="All">All Sports</option>
              {SPORTS_LIST.map((s) => (
                <option key={s.slug} value={s.slug}>
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
              onChange={(e) => {
                const val = e.target.value;
                setCity(val);
                applyFilters({ city: val });
              }}
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
                    onChange={() => {
                      setVenueType(type);
                      applyFilters({ venueType: type });
                    }}
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
              max="5000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onMouseUp={() => applyFilters({ maxPrice })}
              onTouchEnd={() => applyFilters({ maxPrice })}
              className="w-full accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
              <span>₹200</span>
              <span>₹5,000+</span>
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
                  onClick={() => {
                    setMinRating(r.val);
                    applyFilters({ minRating: r.val });
                  }}
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
    </>
  );
}
