'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SPORTS_LIST } from '@/lib/constants';

export default function SportsCategoryPills() {
  const router = useRouter();

  const handleSportClick = (sportId: string) => {
    router.push(`/venues?sport=${encodeURIComponent(sportId)}`);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
      <button
        onClick={() => router.push('/venues')}
        className="flex-shrink-0 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition border border-slate-200"
      >
        All Sports
      </button>
      {SPORTS_LIST.map((sport) => (
        <button
          key={sport.id}
          onClick={() => handleSportClick(sport.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-full bg-gradient-to-r ${sport.color} hover:opacity-90 text-white text-sm font-semibold transition shadow-md hover:shadow-lg flex items-center gap-2`}
        >
          <span className="text-lg">{sport.icon}</span>
          <span>{sport.name}</span>
        </button>
      ))}
    </div>
  );
}