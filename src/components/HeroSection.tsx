'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SPORTS_LIST, CITIES_LIST } from '@/lib/constants';

export default function HeroSection() {
  const router = useRouter();
  const [selectedSport, setSelectedSport] = useState<string>('Badminton');
  const [selectedCity, setSelectedCity] = useState<string>('Bengaluru');
  const [playDate, setPlayDate] = useState<string>('today');
  const [timeWindow, setTimeWindow] = useState<string>('Evening');

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (selectedSport && selectedSport !== 'All') params.set('sport', selectedSport);
    if (selectedCity && selectedCity !== 'All') params.set('city', selectedCity);
    if (timeWindow) params.set('window', timeWindow);
    router.push(`/venues?${params.toString()}`);
  };

  return (
    <section className="relative bg-inverse-surface text-inverse-on-surface overflow-hidden pt-12 pb-16 lg:pb-24 border-b border-surface-container-high/30">
      {/* Atmospheric Court Lines & Volt Radial Background Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full object-cover" fill="none" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
          <circle className="text-primary-container" cx="720" cy="450" r="280" stroke="currentColor" strokeWidth="2" />
          <line className="text-primary-container" stroke="currentColor" strokeWidth="2" x1="0" x2="1440" y1="450" y2="450" />
          <rect className="text-primary-container" height="600" rx="16" stroke="currentColor" strokeWidth="2" width="1000" x="220" y="150" />
          <line className="text-primary-container" stroke="currentColor" strokeDasharray="6 6" strokeWidth="1.5" x1="440" x2="440" y1="150" y2="750" />
          <line className="text-primary-container" stroke="currentColor" strokeDasharray="6 6" strokeWidth="1.5" x1="1000" x2="1000" y1="150" y2="750" />
        </svg>
      </div>

      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary-container/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />

      <div className="relative max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10">
        {/* Kinetic Overline Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-variant/20 backdrop-blur-md mb-6 border border-white/10">
          <span className="w-2 h-2 rounded-full bg-primary-container animate-ping" />
          <span className="w-2 h-2 rounded-full bg-primary-container -ml-3" />
          <span className="font-label-md text-label-md text-primary-fixed uppercase tracking-wider font-bold">
            Guaranteed Zero Double-Booking Tech
          </span>
        </div>

        {/* Main Punch Headline */}
        <div className="max-w-4xl mb-8">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-display tracking-tight text-inverse-on-surface mb-4 leading-tight">
            Book Your Court in 3 Taps.<br />
            <span className="text-primary-container underline decoration-primary-container/40 underline-offset-8">
              Play Tonight.
            </span>
          </h1>
          <p className="font-body-lg text-body-lg text-tertiary-fixed max-w-2xl leading-relaxed">
            Discover premier badminton arenas, turf cricket grounds, pickleball clubs, and racing circuits across India.
            Real-time matrix slot sync with instant entry passes.
          </p>
        </div>

        {/* Comprehensive Floating Booking Search Bar Card */}
        <div className="p-4 md:p-6 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-xl shadow-2xl text-on-surface border border-white/30">
          <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center" onSubmit={handleSearch}>
            {/* Location Selector */}
            <div className="lg:col-span-3 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer group">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-tertiary uppercase tracking-wider">City &amp; Area</span>
                <span className="material-symbols-outlined text-[18px] text-primary">my_location</span>
              </div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full font-headline-sm text-headline-sm text-on-surface bg-transparent font-bold cursor-pointer focus:outline-none mt-0.5"
              >
                {CITIES_LIST.map((c) => (
                  <option key={c} value={c} className="text-slate-900 bg-white">
                    {c}
                  </option>
                ))}
              </select>
              <p className="font-body-sm text-body-sm text-tertiary truncate">Koramangala, Indiranagar, HSR</p>
            </div>

            {/* Sport Selector */}
            <div className="lg:col-span-3 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer group">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-tertiary uppercase tracking-wider">Select Sport</span>
                <span className="material-symbols-outlined text-[18px] text-secondary-container">sports_tennis</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="font-headline-sm text-headline-sm text-on-surface bg-transparent font-bold cursor-pointer focus:outline-none"
                >
                  <option value="All" className="text-slate-900 bg-white">All Sports</option>
                  {SPORTS_LIST.map((s) => (
                    <option key={s.id} value={s.name} className="text-slate-900 bg-white">
                      {s.name}
                    </option>
                  ))}
                </select>
                <span className="px-1.5 py-0.5 rounded bg-surface-container-highest font-label-md text-body-sm text-on-surface-variant font-semibold">
                  64 Open
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-tertiary truncate">Synthetic wooden / BWF mats</p>
            </div>

            {/* Date Picker */}
            <div 
              onClick={() => setPlayDate(playDate === 'today' ? 'tomorrow' : 'today')}
              className="lg:col-span-2 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-tertiary uppercase tracking-wider">Play Date</span>
                <span className="material-symbols-outlined text-[18px] text-tertiary">calendar_today</span>
              </div>
              <div className="font-headline-sm text-headline-sm text-on-surface mt-0.5 font-bold">
                {playDate === 'today' ? 'Today, Live' : 'Tomorrow'}
              </div>
              <p className="font-body-sm text-body-sm text-primary font-semibold">Tonight’s slots alive</p>
            </div>

            {/* Time Slot Filter */}
            <div className="lg:col-span-2 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer group">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-tertiary uppercase tracking-wider">Time Window</span>
                <span className="material-symbols-outlined text-[18px] text-tertiary">schedule</span>
              </div>
              <select
                value={timeWindow}
                onChange={(e) => setTimeWindow(e.target.value)}
                className="w-full font-headline-sm text-headline-sm text-on-surface bg-transparent font-bold cursor-pointer focus:outline-none mt-0.5"
              >
                <option value="Morning" className="text-slate-900 bg-white">Morning</option>
                <option value="Afternoon" className="text-slate-900 bg-white">Afternoon</option>
                <option value="Evening" className="text-slate-900 bg-white">Evening</option>
                <option value="Night" className="text-slate-900 bg-white">Night (Floodlit)</option>
              </select>
              <p className="font-body-sm text-body-sm text-tertiary">06:00 PM - 10:00 PM</p>
            </div>

            {/* High-Energy Kinetic CTA */}
            <div className="lg:col-span-2 flex flex-col justify-center h-full">
              <button
                type="submit"
                className="w-full h-[68px] px-4 py-3 rounded-xl bg-primary-container hover:bg-inverse-primary active:scale-[0.98] text-on-primary-container font-label-lg text-label-lg font-extrabold shadow-lg transition-all flex flex-col items-center justify-center text-center cursor-pointer"
              >
                <span className="flex items-center gap-1 font-headline-sm text-headline-sm leading-tight text-on-primary-container font-bold">
                  Find Courts
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </span>
                <span className="font-label-md text-[11px] text-on-primary-container/90 font-bold uppercase tracking-wider">
                  Instant Confirmation
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Platform Status Strip */}
        <div className="mt-6 pt-4 flex flex-wrap items-center justify-between gap-4 text-tertiary-fixed font-body-sm text-body-sm border-t border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse" />
            <span className="font-data-mono text-data-mono text-inverse-on-surface font-bold">1,840+</span>
            <span>Live Slots Available in City Today</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-secondary-container material-symbols-fill">star</span>
            <span className="font-data-mono text-data-mono text-inverse-on-surface font-bold">4.9★</span>
            <span>Average Arena Rating from 120k+ reviews</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary-container">groups</span>
            <span className="font-data-mono text-data-mono text-inverse-on-surface font-bold">45,000+</span>
            <span>Active Local Players in Bengaluru</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary-fixed">verified_user</span>
            <span className="text-inverse-on-surface font-semibold">100% Instant Confirmation</span>
            <span className="text-tertiary-fixed">(Zero Call Backs)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
