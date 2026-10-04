'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';

export default function PlayerDashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/player/login?from=/player/dashboard');
      return;
    }

    if (user) {
      fetch('/api/bookings')
        .then((res) => (res.ok ? res.json() : { bookings: [] }))
        .then((data) => {
          setBookings(data.bookings || []);
        })
        .catch(() => {})
        .finally(() => setDataLoading(false));
    }
  }, [user, loading, router]);

  if (loading || (dataLoading && user)) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-40 bg-surface-container-high rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-28 bg-surface-container rounded-2xl" />
            <div className="h-28 bg-surface-container rounded-2xl" />
            <div className="h-28 bg-surface-container rounded-2xl" />
            <div className="h-28 bg-surface-container rounded-2xl" />
          </div>
          <div className="h-64 bg-surface-container rounded-2xl" />
        </div>
      </div>
    );
  }

  const upcomingBookings = bookings.filter((b) => b.status === 'CONFIRMED');
  const pastBookings = bookings.filter((b) => b.status !== 'CONFIRMED');

  return (
    <div className="min-h-screen bg-background text-on-surface py-10">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 space-y-8">
        {/* Welcome Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-inverse-surface via-slate-900 to-inverse-surface text-surface rounded-3xl p-8 lg:p-10 shadow-xl border border-surface-container-high">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/20 border border-primary-container/30 text-primary-container text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">sports_tennis</span>
                <span>Player Athlete Portal</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight">
                Welcome back, {user?.name || 'Athlete'}!
              </h1>
              <p className="text-tertiary-fixed text-sm max-w-xl">
                Ready for today's match? Track your active court passes, redeem athlete points, and reserve top-tier arenas across Bengaluru.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/venues"
                className="px-6 py-3.5 rounded-xl bg-primary-container text-on-primary-container font-label-lg text-sm font-extrabold hover:bg-inverse-primary transition-all shadow-lg shadow-primary-container/20 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">bolt</span>
                <span>Book Court Now</span>
              </Link>
              <Link
                href="/rewards"
                className="px-5 py-3.5 rounded-xl bg-surface-container-high/80 text-surface font-label-lg text-sm font-semibold hover:bg-surface-container-highest transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">military_tech</span>
                <span>Rewards</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Athlete Quick KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-xs font-bold text-tertiary uppercase tracking-wider">Upcoming Games</span>
              <div className="w-8 h-8 rounded-lg bg-primary-container/20 text-on-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              </div>
            </div>
            <div className="text-2xl font-black text-on-surface font-data-mono">{upcomingBookings.length}</div>
            <div className="text-xs text-primary font-semibold">Active reservations</div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-xs font-bold text-tertiary uppercase tracking-wider">Completed Matches</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container text-on-surface flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">sports_score</span>
              </div>
            </div>
            <div className="text-2xl font-black text-on-surface font-data-mono">{pastBookings.length}</div>
            <div className="text-xs text-tertiary font-semibold">Played this year</div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-xs font-bold text-tertiary uppercase tracking-wider">QC Points</span>
              <div className="w-8 h-8 rounded-lg bg-secondary-container/20 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">military_tech</span>
              </div>
            </div>
            <div className="text-2xl font-black text-secondary font-data-mono">480 pts</div>
            <div className="text-xs text-secondary font-semibold">Redeemable on cafeteria &amp; courts</div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-xs font-bold text-tertiary uppercase tracking-wider">Athlete Rank</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
              </div>
            </div>
            <div className="text-2xl font-black text-on-surface font-headline-sm">Gold Tier</div>
            <div className="text-xs text-tertiary font-semibold">Top 15% local players</div>
          </div>
        </div>

        {/* Active Bookings & Quick Links Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Bookings List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-xl font-black text-on-surface">Your Court Bookings</h2>
              <Link href="/my-bookings" className="text-xs font-bold text-primary hover:underline">
                View All History →
              </Link>
            </div>

            {bookings.length === 0 ? (
              <div className="p-10 rounded-3xl bg-surface-container-lowest border border-surface-container-high text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mx-auto text-tertiary">
                  <span className="material-symbols-outlined text-[32px]">calendar_today</span>
                </div>
                <div>
                  <h3 className="font-bold text-on-surface text-base">No active reservations found</h3>
                  <p className="text-xs text-tertiary mt-1">Book your preferred court or turf now to get real-time access passes.</p>
                </div>
                <Link
                  href="/venues"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container text-xs font-bold hover:bg-inverse-primary transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">search</span>
                  <span>Explore Available Courts</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-sm hover:border-surface-container-highest transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-on-primary-container flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[24px]">sports_tennis</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-on-surface text-sm">
                            {booking.court?.facility?.name || 'QuickCourt Arena'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              booking.status === 'CONFIRMED'
                                ? 'bg-primary-container text-on-primary-container'
                                : 'bg-surface-container text-on-surface-variant'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-xs text-tertiary mt-0.5">
                          {booking.court?.name || 'Court'} · {booking.court?.sport || 'Sports'}
                        </p>
                        <p className="text-xs font-semibold text-on-surface-variant mt-1 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px] text-primary">schedule</span>
                          <span>
                            {booking.startTime ? new Date(booking.startTime).toLocaleDateString() : 'Today'} ·{' '}
                            {booking.startTime ? new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Scheduled'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <div className="font-data-mono font-bold text-sm text-on-surface">₹{booking.totalPrice}</div>
                        <div className="text-[10px] text-tertiary">Paid via Card/UPI</div>
                      </div>
                      <Link
                        href={`/my-bookings`}
                        className="px-3.5 py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high text-xs font-bold transition-colors"
                      >
                        Pass
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Shortcuts & Facility Access */}
          <div className="space-y-6">
            <h2 className="font-headline-sm text-xl font-black text-on-surface">Quick Access</h2>

            <div className="space-y-3">
              <Link
                href="/venues?sport=Badminton"
                className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high hover:border-primary-container transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-container/20 text-on-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">sports_tennis</span>
                  </div>
                  <div>
                    <div className="font-bold text-xs text-on-surface group-hover:text-primary transition-colors">
                      Badminton Courts
                    </div>
                    <div className="text-[11px] text-tertiary">BWF Synthetic, wooden floors</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-tertiary group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>

              <Link
                href="/karting"
                className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high hover:border-secondary transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container/20 text-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">sports_motorsports</span>
                  </div>
                  <div>
                    <div className="font-bold text-xs text-on-surface group-hover:text-secondary transition-colors">
                      Go-Karting Sprints
                    </div>
                    <div className="text-[11px] text-tertiary">Asphalt tracks &amp; high-speed karts</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-tertiary group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>

              <Link
                href="/food-court"
                className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high hover:border-amber-500 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">local_cafe</span>
                  </div>
                  <div>
                    <div className="font-bold text-xs text-on-surface group-hover:text-amber-600 transition-colors">
                      Sports Cafeteria
                    </div>
                    <div className="text-[11px] text-tertiary">Smoothies, electrolytes &amp; post-game snacks</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-tertiary group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>

              <Link
                href="/rewards"
                className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high hover:border-primary-container transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">military_tech</span>
                  </div>
                  <div>
                    <div className="font-bold text-xs text-on-surface group-hover:text-primary transition-colors">
                      Athlete Rewards
                    </div>
                    <div className="text-[11px] text-tertiary">Tier perks &amp; booking cashback</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-tertiary group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
