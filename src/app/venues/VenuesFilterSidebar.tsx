'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SPORTS_LIST, CITIES_LIST, normalizeSportSlug } from '@/lib/constants';
import {
  SlidersHorizontal,
  Star,
  RotateCcw,
  Search,
  X,
  Check,
  ChevronDown,
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

  // Calculate number of active filters
  const activeFiltersCount =
    (sport && sport !== 'All' ? 1 : 0) +
    (city && city !== 'All' ? 1 : 0) +
    (venueType && venueType !== 'All' ? 1 : 0) +
    (parseFloat(minRating) > 0 ? 1 : 0) +
    (parseFloat(maxPrice) < 5000 ? 1 : 0);

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

  const filterContent = (
    <div className="space-y-5">
      {/* Sport Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Sport Discipline
        </label>
        <select
          value={sport}
          onChange={(e) => {
            const val = e.target.value;
            setSport(val);
            applyFilters({ sport: val });
          }}
          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500 font-semibold text-slate-800"
        >
          <option value="All">All Sports (All Disciplines)</option>
          {SPORTS_LIST.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.icon} {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* City Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          City / Metropolitan Area
        </label>
        <select
          value={city}
          onChange={(e) => {
            const val = e.target.value;
            setCity(val);
            applyFilters({ city: val });
          }}
          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500 font-semibold text-slate-800"
        >
          <option value="All">All Indian Cities</option>
          {CITIES_LIST.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Venue Type */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Surface &amp; Court Environment
        </label>
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          {['All', 'Indoor', 'Outdoor'].map((type) => {
            const active = venueType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setVenueType(type);
                  applyFilters({ venueType: type });
                }}
                className={`py-2 px-2 text-center rounded-xl font-bold transition text-[11px] border ${
                  active
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {type === 'All' ? 'Any' : type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Slider */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          <span>Max Price / Hour</span>
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
          className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
          <span>₹200</span>
          <span>₹2,500</span>
          <span>₹5,000+</span>
        </div>
      </div>

      {/* Min Rating Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Minimum Rating
        </label>
        <div className="space-y-1 text-xs">
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
              className={`w-full text-left px-3 py-2 rounded-xl font-medium transition flex items-center justify-between ${
                minRating === r.val
                  ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                  : 'text-slate-600 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Star className={`w-3.5 h-3.5 ${r.val !== '0' ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                <span>{r.label}</span>
              </span>
              {minRating === r.val && <Check className="w-3.5 h-3.5 text-emerald-600" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="lg:col-span-1 space-y-4">
      {/* Mobile & Tablet Search Bar + Filter Trigger */}
      <div className="lg:hidden">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search court, area, turf..."
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2.5 bg-emerald-600 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm shrink-0"
          >
            {isPending ? '...' : 'Search'}
          </button>
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 shadow-sm shrink-0 transition ${
              activeFiltersCount > 0
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            aria-label="Filter venues"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span
                className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black ${
                  activeFiltersCount > 0 ? 'bg-white text-emerald-700' : 'bg-emerald-600 text-white'
                }`}
              >
                {activeFiltersCount}
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Desktop Sticky Filter Sidebar */}
      <aside className="hidden lg:block">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm sticky top-24 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>Filter Options</span>
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                  {activeFiltersCount}
                </span>
              )}
            </span>
            <button
              onClick={handleReset}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Desktop Search Input inside Sidebar */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Quick Keyword Search
            </label>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Arena name, area..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </form>
          </div>

          {filterContent}
        </div>
      </aside>

      {/* Mobile & Tablet Filter Drawer Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Filter Venues</h3>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                    {activeFiltersCount} Active
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filter Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              {filterContent}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  handleReset();
                  setMobileFilterOpen(false);
                }}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All
              </button>
              <button
                type="button"
                onClick={() => {
                  applyFilters();
                  setMobileFilterOpen(false);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition flex items-center justify-center gap-1.5"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
