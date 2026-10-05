import React from 'react';

export default function VenuesLoading() {
  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-6">
        {/* Header Skeleton */}
        <div className="mb-6 space-y-2">
          <div className="h-4 w-36 bg-slate-200 rounded animate-pulse" />
          <div className="h-8 w-72 bg-slate-200 rounded animate-pulse" />
          <div className="h-3 w-48 bg-slate-200 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Skeleton */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 h-96 animate-pulse space-y-4">
              <div className="h-5 bg-slate-200 rounded w-1/2" />
              <div className="h-10 bg-slate-100 rounded" />
              <div className="h-10 bg-slate-100 rounded" />
              <div className="h-10 bg-slate-100 rounded" />
            </div>
          </div>

          {/* Cards Grid Skeleton */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-white border border-slate-200 animate-pulse p-4 space-y-3"
              >
                <div className="h-44 bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
