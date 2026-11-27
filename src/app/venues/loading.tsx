import React from 'react';

export default function VenuesLoading() {
  return (
    <div className="bg-[var(--paper)] min-h-screen py-10 px-5 md:px-9 max-w-[1400px] mx-auto">
      <div className="space-y-3 mb-8">
        <div className="h-4 w-32 bg-black/5 rounded animate-pulse" />
        <div className="h-10 w-64 bg-black/10 rounded animate-pulse" />
      </div>
      <div className="grid gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-black/5 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}
