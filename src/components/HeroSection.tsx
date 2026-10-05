'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SPORTS_LIST, CITIES_LIST, getCityAreas } from '@/lib/constants';
import { ArrowRight, Calendar, Clock, MapPin, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function HeroSection() {
  const router = useRouter();
  const [selectedSport, setSelectedSport] = useState<string>('badminton');
  const [selectedCity, setSelectedCity] = useState<string>('Bangalore');
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [playDate, setPlayDate] = useState<string>('today');
  const [timeWindow, setTimeWindow] = useState<string>('Evening');

  const availableAreas = getCityAreas(selectedCity);

  useEffect(() => {
    // Check if city was previously saved in localStorage
    const saved = localStorage.getItem('quickcourt_city');
    if (saved && CITIES_LIST.includes(saved)) {
      setSelectedCity(saved);
    }
  }, []);

  const handleCityChange = (newCity: string) => {
    setSelectedCity(newCity);
    setSelectedArea('All');
    if (typeof window !== 'undefined') {
      localStorage.setItem('quickcourt_city', newCity);
      window.dispatchEvent(new CustomEvent('quickcourt_city_changed', { detail: newCity }));
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (selectedSport && selectedSport !== 'All') params.set('sport', selectedSport);
    if (selectedCity && selectedCity !== 'All') params.set('city', selectedCity);
    if (selectedArea && selectedArea !== 'All') params.set('search', selectedArea);
    if (timeWindow) params.set('timeWindow', timeWindow);
    router.push(`/venues?${params.toString()}`);
  };

  return (
    <section className="relative bg-slate-950 text-white overflow-hidden pt-12 pb-16 lg:pb-24 border-b border-slate-800">
      {/* Court Lines Background Graphic */}
      <div className="absolute inset-0 pointer-events-none opacity-15">
        <svg className="w-full h-full object-cover" fill="none" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
          <circle className="text-emerald-500" cx="720" cy="450" r="280" stroke="currentColor" strokeWidth="2" />
          <line className="text-emerald-500" stroke="currentColor" strokeWidth="2" x1="0" x2="1440" y1="450" y2="450" />
          <rect className="text-emerald-500" height="600" rx="16" stroke="currentColor" strokeWidth="2" width="1000" x="220" y="150" />
          <line className="text-emerald-500" stroke="currentColor" strokeDasharray="6 6" strokeWidth="1.5" x1="440" x2="440" y1="150" y2="750" />
          <line className="text-emerald-500" stroke="currentColor" strokeDasharray="6 6" strokeWidth="1.5" x1="1000" x2="1000" y1="150" y2="750" />
        </svg>
      </div>

      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

      <div className="relative max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10">
        {/* Overline Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 backdrop-blur-md mb-6 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-3" />
          <span className="font-label-md text-xs text-emerald-400 uppercase tracking-wider font-bold">
            Real-Time Slot Booking Engine
          </span>
        </div>

        {/* Main Punch Headline */}
        <div className="max-w-4xl mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Book Your Court in 3 Taps.<br />
            <span className="text-emerald-400 underline decoration-emerald-500/40 underline-offset-8">
              Play Tonight.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Discover verified badminton arenas, turf cricket grounds, pickleball courts, and racing circuits across India with live slot matrix confirmation.
          </p>
        </div>

        {/* Floating Booking Search Bar Card */}
        <div className="p-4 md:p-6 rounded-2xl bg-slate-900/95 backdrop-blur-xl shadow-2xl text-slate-900 border border-slate-800">
          <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center" onSubmit={handleSearch}>
            {/* City Selector */}
            <div className="lg:col-span-3 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">City</span>
                <MapPin className="w-4 h-4 text-emerald-400" />
              </div>
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full text-sm font-bold text-white bg-transparent cursor-pointer focus:outline-none mt-1"
              >
                {CITIES_LIST.map((c) => (
                  <option key={c} value={c} className="text-slate-900 bg-white">
                    {c}
                  </option>
                ))}
              </select>
              {/* Dynamic Area Selector */}
              <div className="mt-1 flex items-center gap-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Area:</span>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="text-xs text-emerald-400 font-semibold bg-transparent cursor-pointer focus:outline-none"
                >
                  <option value="All" className="text-slate-900 bg-white">All Areas</option>
                  {availableAreas.map((a) => (
                    <option key={a} value={a} className="text-slate-900 bg-white">
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sport Selector */}
            <div className="lg:col-span-3 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Select Sport</span>
                <span className="text-base">
                  {SPORTS_LIST.find((s) => s.slug === selectedSport)?.icon || '🏸'}
                </span>
              </div>
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="w-full text-sm font-bold text-white bg-transparent cursor-pointer focus:outline-none mt-1"
              >
                <option value="All" className="text-slate-900 bg-white">All Sports</option>
                {SPORTS_LIST.map((s) => (
                  <option key={s.slug} value={s.slug} className="text-slate-900 bg-white">
                    {s.icon} {s.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                {SPORTS_LIST.find((s) => s.slug === selectedSport)?.name || 'Multi-discipline'}
              </p>
            </div>

            {/* Date Picker */}
            <div 
              onClick={() => setPlayDate(playDate === 'today' ? 'tomorrow' : 'today')}
              className="lg:col-span-2 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Play Date</span>
                <Calendar className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-sm font-bold text-white mt-1">
                {playDate === 'today' ? 'Today, Live' : 'Tomorrow'}
              </div>
              <p className="text-[11px] text-emerald-400 font-semibold mt-1">Live slot matrix</p>
            </div>

            {/* Time Slot Filter */}
            <div className="lg:col-span-2 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Time Window</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <select
                value={timeWindow}
                onChange={(e) => setTimeWindow(e.target.value)}
                className="w-full text-sm font-bold text-white bg-transparent cursor-pointer focus:outline-none mt-1"
              >
                <option value="Morning" className="text-slate-900 bg-white">Morning (06:00 - 12:00)</option>
                <option value="Afternoon" className="text-slate-900 bg-white">Afternoon (12:00 - 17:00)</option>
                <option value="Evening" className="text-slate-900 bg-white">Evening (17:00 - 21:00)</option>
                <option value="Night" className="text-slate-900 bg-white">Night (21:00 - 23:00)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">{timeWindow} window</p>
            </div>

            {/* CTA Button */}
            <div className="lg:col-span-2 flex flex-col justify-center h-full">
              <button
                type="submit"
                className="w-full h-[68px] px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold shadow-lg transition-all flex flex-col items-center justify-center text-center cursor-pointer"
              >
                <span className="flex items-center gap-1 text-sm font-bold">
                  Find Courts
                  <ArrowRight className="w-4 h-4" />
                </span>
                <span className="text-[10px] text-emerald-100 font-semibold uppercase tracking-wider mt-0.5">
                  Instant Confirmation
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Platform Benefits Strip (Honest, Real Platform Features) */}
        <div className="mt-6 pt-4 flex flex-wrap items-center justify-between gap-4 text-slate-400 text-xs border-t border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-bold">Live Matrix</span>
            <span>Real-time slot availability sync</span>
          </div>

          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-white font-bold">Verified Arenas</span>
            <span>Inspected surfaces &amp; lighting</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-teal-400" />
            <span className="text-white font-bold">10-Min Hold</span>
            <span>Exclusive checkout reservation</span>
          </div>

          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-white font-bold">Instant Pass</span>
            <span>Direct QR pass on booking</span>
          </div>
        </div>
      </div>
    </section>
  );
}
