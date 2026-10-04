'use client';

import React from 'react';
import Link from 'next/link';

interface SportCategoryItem {
  id: string;
  name: string;
  subtext: string;
  badge: string;
  badgeStyle: 'primary' | 'secondary' | 'trending' | 'neutral';
  icon: string;
  isTrending?: boolean;
}

const CATEGORIES: SportCategoryItem[] = [
  {
    id: 'Badminton',
    name: 'Badminton',
    subtext: 'BWF Wooden & Synthetic',
    badge: '64 Courts',
    badgeStyle: 'primary',
    icon: 'sports_tennis',
  },
  {
    id: 'Cricket',
    name: 'Box Cricket',
    subtext: 'Roof netted & floodlit',
    badge: '28 Turfs',
    badgeStyle: 'secondary',
    icon: 'sports_cricket',
  },
  {
    id: 'Pickleball',
    name: 'Pickleball',
    subtext: 'USAPA Pro Acrylics',
    badge: 'Trending #1',
    badgeStyle: 'trending',
    icon: 'sports_baseball',
    isTrending: true,
  },
  {
    id: 'Tennis',
    name: 'Lawn Tennis',
    subtext: 'Clay & Hard courts',
    badge: '19 Courts',
    badgeStyle: 'neutral',
    icon: 'sports_tennis',
  },
  {
    id: 'Football',
    name: 'Football',
    subtext: '5v5 & 7v7 FIFA quality',
    badge: '42 Turfs',
    badgeStyle: 'primary',
    icon: 'sports_soccer',
  },
  {
    id: 'Basketball',
    name: 'Basketball',
    subtext: 'Shock-absorbing maple',
    badge: '15 Courts',
    badgeStyle: 'neutral',
    icon: 'sports_basketball',
  },
  {
    id: 'Table Tennis',
    name: 'Table Tennis',
    subtext: 'Stag 25mm ITTF tables',
    badge: '22 Tables',
    badgeStyle: 'neutral',
    icon: 'sports_handball',
  },
  {
    id: 'Go-Karting',
    name: 'Go-Karting',
    subtext: 'Twin-engine tarmac circuits',
    badge: '4 Tracks',
    badgeStyle: 'secondary',
    icon: 'sports_motorsports',
  },
];

export default function SportsCategoryPills() {
  return (
    <section className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-12 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="font-label-md text-label-md text-secondary uppercase font-bold tracking-widest mb-1">
            Pick Your Discipline
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
            Explore Live Arenas By Sport
          </h2>
        </div>
        <Link
          href="/venues"
          className="inline-flex items-center gap-1 text-primary font-label-lg text-label-lg font-bold hover:underline"
        >
          View All 16 Sports Categories <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </Link>
      </div>

      {/* 8 Sports Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {CATEGORIES.map((sport) => {
          if (sport.isTrending) {
            return (
              <Link
                key={sport.id}
                href={`/venues?sport=${encodeURIComponent(sport.id)}`}
                className="group p-4 rounded-xl bg-inverse-surface text-inverse-on-surface shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary-container/20 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-start justify-between relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-surface-variant/20 flex items-center justify-center text-primary-container group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[28px]">{sport.icon}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-md text-[11px] font-extrabold uppercase tracking-wide">
                    {sport.badge}
                  </span>
                </div>
                <div className="mt-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline-sm text-headline-sm text-inverse-on-surface font-bold">
                      {sport.name}
                    </h3>
                    <span className="font-data-mono text-body-sm text-primary-fixed font-semibold">36 Open</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-tertiary-fixed">{sport.subtext}</p>
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={sport.id}
              href={`/venues?sport=${encodeURIComponent(sport.id)}`}
              className="group p-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container border border-surface-container-high/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[28px]">{sport.icon}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full font-label-md text-[11px] font-bold ${
                    sport.badgeStyle === 'primary'
                      ? 'bg-primary-container/20 text-on-primary-container'
                      : sport.badgeStyle === 'secondary'
                      ? 'bg-secondary-fixed text-on-secondary-fixed'
                      : 'bg-surface-container-highest text-on-surface-variant'
                  }`}
                >
                  {sport.badge}
                </span>
              </div>
              <div className="mt-6">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  {sport.name}
                </h3>
                <p className="font-body-sm text-body-sm text-tertiary">{sport.subtext}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}