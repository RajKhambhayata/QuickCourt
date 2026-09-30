'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Sparkles, ChevronRight, Trophy, TrendingUp, Users, Clock, Shield } from 'lucide-react';
import { SPORTS_LIST, CITIES_LIST } from '@/lib/constants';

export default function HeroSection() {
  const router = useRouter();
  const [selectedSport, setSelectedSport] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('Bangalore');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedSport && selectedSport !== 'All') params.set('sport', selectedSport);
    if (selectedCity && selectedCity !== 'All') params.set('city', selectedCity);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    router.push(`/venues?${params.toString()}`);
  };

  const getSportGradient = (sportId: string) => {
    const gradients: Record<string, string> = {
      'badminton': 'from-emerald-500 to-green-600',
      'cricket': 'from-teal-500 to-emerald-600',
      'tennis': 'from-blue-500 to-indigo-600',
      'football': 'from-orange-500 to-red-600',
      'basketball': 'from-rose-500 to-pink-600',
      'volleyball': 'from-purple-500 to-violet-600',
      'pickleball': 'from-cyan-500 to-blue-600',
      'squash': 'from-indigo-500 to-purple-600',
    };
    return gradients[sportId] || 'from-emerald-500 to-teal-600';
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white py-20 md:py-32 border-b border-slate-800">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        {/* Sports pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 border-2 border-white rounded-full" />
          <div className="absolute top-40 right-20 w-24 h-24 border-2 border-white rounded-lg rotate-45" />
          <div className="absolute bottom-20 left-1/4 w-40 h-40 border-2 border-white rounded-full" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold tracking-wide animate-fade-in">
                <Sparkles className="w-4 h-4" />
                <span>India's #1 Sports Booking Platform</span>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight font-display">
                Book Your <br />
                <span className="text-gradient">Perfect Court</span>
              </h1>

              <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
                Discover and book top-rated sports facilities instantly. From badminton courts to cricket turfs, 
                find your arena in seconds with real-time availability.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 sm:gap-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">500+</div>
                  <div className="text-xs text-slate-400 font-medium">Venues</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">10K+</div>
                  <div className="text-xs text-slate-400 font-medium">Players</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">Instant</div>
                  <div className="text-xs text-slate-400 font-medium">Booking</div>
                </div>
              </div>
            </div>

            {/* Quick Search Bar */}
            <form
              onSubmit={handleSearch}
              className="p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2 max-w-xl"
            >
              <div className="flex-1 flex items-center gap-2 bg-slate-900/90 px-4 py-3 rounded-xl border border-slate-700">
                <Search className="w-5 h-5 text-emerald-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search venues..."
                  className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-3 rounded-xl border border-slate-700">
                <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  aria-label="Filter by City"
                  className="bg-transparent text-sm text-white focus:outline-none cursor-pointer pr-2"
                >
                  <option value="All" className="bg-slate-900 text-white">All Cities</option>
                  {CITIES_LIST.map((city) => (
                    <option key={city} value={city} className="bg-slate-900 text-white">{city}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>Search</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Content - Sports Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-400" />
                <span>Popular Sports</span>
              </h3>
              <button
                onClick={() => router.push('/venues')}
                className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1"
              >
                Explore All <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {SPORTS_LIST.slice(0, 8).map((sport, index) => (
                <button
                  key={sport.id}
                  onClick={() => router.push(`/venues?sport=${encodeURIComponent(sport.id)}`)}
                  className={`group relative p-4 rounded-2xl bg-gradient-to-br ${getSportGradient(sport.id)} hover:scale-105 transition-all duration-300 text-center flex flex-col items-center justify-center gap-3 shadow-lg hover:shadow-xl`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {sport.icon}
                  </div>
                  <span className="text-sm font-bold text-white">{sport.name}</span>
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
                </button>
              ))}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 pt-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-slate-300">Verified Venues</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium text-slate-300">Real-time Slots</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-medium text-slate-300">Instant Booking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
