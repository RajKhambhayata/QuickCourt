'use client';

import React from 'react';
import Link from 'next/link';
import { SPORTS_LIST } from '@/lib/constants';

import { ChevronRight } from 'lucide-react';

interface SportsCategoryPillsProps {
  courtCounts?: Record<string, number>;
}

const SPORT_SUBTEXTS: Record<string, string> = {
  badminton: 'BWF Wooden & Synthetic',
  'box-cricket': 'Roof netted & floodlit',
  pickleball: 'USAPA Pro Acrylics',
  tennis: 'Clay & Hard courts',
  football: '5v5 & 7v7 FIFA quality',
  basketball: 'Shock-absorbing maple',
  'table-tennis': 'Stag 25mm ITTF tables',
  squash: 'Glass-back tournament courts',
};

export default function SportsCategoryPills({ courtCounts }: SportsCategoryPillsProps) {
  return (
    <section className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-12 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="font-label-md text-label-md text-emerald-600 uppercase font-bold tracking-widest mb-1">
            Pick Your Discipline
          </div>
          <h2 className="font-headline-lg text-headline-lg text-slate-900 font-extrabold tracking-tight">
            Explore Live Arenas By Sport
          </h2>
        </div>
        <Link
          href="/venues"
          className="inline-flex items-center gap-1 text-emerald-600 font-label-lg text-label-lg font-bold hover:underline"
        >
          View All {SPORTS_LIST.length} Sports Categories{' '}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Sports Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {SPORTS_LIST.map((sport, index) => {
          const isTrending = sport.slug === 'pickleball';
          const subtext = SPORT_SUBTEXTS[sport.slug] || 'Verified turf & courts';
          
          // Compute badge from real counts or fallback
          const rawCount = courtCounts
            ? (courtCounts[sport.name] ?? courtCounts[sport.id] ?? courtCounts[sport.slug] ?? 0)
            : undefined;

          let badgeText = 'Available';
          if (rawCount !== undefined) {
            badgeText = rawCount > 0 ? `${rawCount} Court${rawCount > 1 ? 's' : ''}` : 'Available';
          } else if (isTrending) {
            badgeText = 'Trending #1';
          }

          if (isTrending) {
            return (
              <Link
                key={sport.slug}
                href={`/venues?sport=${encodeURIComponent(sport.slug)}`}
                className="group p-4 rounded-xl bg-slate-900 text-white shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-start justify-between relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    <span>{sport.icon}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-label-md text-[11px] font-extrabold uppercase tracking-wide">
                    {badgeText}
                  </span>
                </div>
                <div className="mt-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline-sm text-headline-sm text-white font-bold">
                      {sport.name}
                    </h3>
                  </div>
                  <p className="font-body-sm text-xs text-slate-400 mt-0.5">{subtext}</p>
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={sport.slug}
              href={`/venues?sport=${encodeURIComponent(sport.slug)}`}
              className="group p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  <span>{sport.icon}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full font-label-md text-[11px] font-bold ${
                    index % 2 === 0
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {badgeText}
                </span>
              </div>
              <div className="mt-6">
                <h3 className="font-headline-sm text-headline-sm text-slate-900 font-bold">
                  {sport.name}
                </h3>
                <p className="font-body-sm text-xs text-slate-500 mt-0.5">{subtext}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}