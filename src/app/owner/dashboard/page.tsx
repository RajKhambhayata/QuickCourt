'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OwnerSidebar from '@/components/OwnerSidebar';
import {
  BookingTrendsChart,
  RevenueBarChart,
  PeakHoursAreaChart,
} from '@/components/Charts';

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ownerStatus, setOwnerStatus] = useState<string | null>(null);
  const [acceptingBookings, setAcceptingBookings] = useState(true);
  const [walkinModalOpen, setWalkinModalOpen] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinCourt, setWalkinCourt] = useState('Court 1 (BWF Pro)');
  const [walkinSlot, setWalkinSlot] = useState('07:00 PM - 08:00 PM');
  const [walkinPayment, setWalkinPayment] = useState('UPI');
  const [walkinSuccess, setWalkinSuccess] = useState(false);

  useEffect(() => {
    // Fetch owner status
    fetch('/api/auth/me')
      .then((r) => {
        if (r.status === 401) {
          router.push('/owner/login');
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        if (d.user) {
          if (d.user.role !== 'OWNER') {
            router.push('/owner/login');
            return;
          }
          setOwnerStatus(d.user.status);
        }
      })
      .catch(() => {});

    fetch('/api/owner/stats')
      .then((res) => {
        if (res.status === 401) {
          router.push('/owner/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && !data.error) setStats(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [router]);

  const handleWalkinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWalkinSuccess(true);
    setTimeout(() => {
      setWalkinSuccess(false);
      setWalkinModalOpen(false);
      setWalkinName('');
      setWalkinPhone('');
    }, 1200);
  };

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-10 flex flex-col md:flex-row gap-8">
        <OwnerSidebar />
        <div className="flex-1 space-y-6 animate-pulse">
          <div className="h-32 bg-surface-container rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            <div className="h-28 bg-surface-container rounded-xl" />
            <div className="h-28 bg-surface-container rounded-xl" />
            <div className="h-28 bg-surface-container rounded-xl" />
            <div className="h-28 bg-surface-container rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const kpis = stats?.kpis || {
    totalBookings: 46,
    activeCourts: 6,
    totalEarnings: 24850,
    facilitiesCount: 1,
  };

  return (
    <div className="bg-background min-h-screen py-6 text-on-surface">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <OwnerSidebar />

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {/* Pending Approval Banner */}
          {ownerStatus === 'PENDING_APPROVAL' && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600 text-xl">warning</span>
              <div className="flex-1 text-xs text-amber-900">
                <span className="font-bold">Account Under Review:</span> Your facility registration is being audited by admins.
              </div>
            </div>
          )}

          {/* Operational Header & Controls Strip */}
          <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high/60">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-inverse-surface text-surface flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[28px] text-primary-container">sports_tennis</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Smash Pro Arena</h1>
                    <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-md text-xs flex items-center gap-1">
                      <span>Koramangala Branch</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-tertiary">
                    Venue ID: #BLR-KRM-882 • 6 Synthetic &amp; Wooden Courts
                  </span>
                </div>
              </div>

              <div className="h-8 w-px bg-surface-container-high hidden md:block" />

              {/* Live Switcher State Toggle */}
              <div className="flex items-center gap-3 bg-surface-container-low px-3.5 py-2 rounded-xl border border-surface-container-high/40">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptingBookings}
                    onChange={(e) => setAcceptingBookings(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-dim peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:rounded-full after:h-5 after:w-5 after:transition-all" />
                </label>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                    {acceptingBookings ? 'Accepting Bookings' : 'Bookings Paused'}
                  </span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant">Public instant checkout active</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Group */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setWalkinModalOpen(true)}
                className="px-4 py-2.5 rounded-lg bg-secondary-container text-on-secondary font-label-lg text-label-lg font-bold shadow-sm hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">person_add</span>
                <span>+ Quick Offline Walk-in</span>
              </button>

              <Link
                href="/owner/slots"
                className="px-3.5 py-2.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-label-lg text-label-lg font-semibold transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px] text-error">lock_clock</span>
                <span>Block Maintenance</span>
              </Link>

              <button
                type="button"
                onClick={() => alert('Exporting Daily Manifest PDF/CSV...')}
                className="px-3 py-2.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
                title="Download Daily Manifest"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
              </button>
            </div>
          </section>

          {/* 4 Core Performance KPI Metrics */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: Today's Gross Revenue */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high/60 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-container/10 rounded-full blur-xl group-hover:bg-primary-container/20 transition-all pointer-events-none" />
              <div className="flex items-center justify-between z-10">
                <span className="font-label-md text-label-md uppercase tracking-wider text-tertiary font-bold">
                  Today's Earnings
                </span>
                <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">currency_rupee</span>
                </span>
              </div>
              <div className="mt-4 z-10">
                <div className="font-display text-3xl font-extrabold text-on-surface leading-none tnum">
                  ₹{kpis.totalEarnings.toLocaleString()}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center text-primary font-label-md text-xs font-bold bg-surface-container px-2 py-0.5 rounded">
                    <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span>
                    +18.4%
                  </span>
                  <span className="font-body-sm text-xs text-tertiary">vs last Thursday</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-surface-container-high/40 flex items-center justify-between text-tertiary font-body-sm text-xs">
                <span>Target: ₹28,000</span>
                <span className="font-data-mono font-semibold text-on-surface">88.7%</span>
              </div>
            </div>

            {/* Card 2: Slot Occupancy Rate */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high/60 flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between z-10">
                <span className="font-label-md text-label-md uppercase tracking-wider text-tertiary font-bold">
                  Today's Occupancy
                </span>
                <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[18px]">pie_chart</span>
                </span>
              </div>
              <div className="mt-4 z-10">
                <div className="font-display text-3xl font-extrabold text-on-surface leading-none tnum">
                  88.5%
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-data-mono font-bold text-on-surface text-xs">46 / 52</span>
                  <span className="font-body-sm text-xs text-tertiary">slots locked</span>
                </div>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between">
                <div className="w-full bg-surface-container rounded-full h-2 mr-3 overflow-hidden">
                  <div className="bg-secondary-container h-2 rounded-full" style={{ width: '88.5%' }} />
                </div>
                <span className="font-label-md text-xs text-secondary-container whitespace-nowrap font-bold">
                  4 Peak Left
                </span>
              </div>
            </div>

            {/* Card 3: Weekly Velocity */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high/60 flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between z-10">
                <span className="font-label-md text-label-md uppercase tracking-wider text-tertiary font-bold">
                  Weekly Bookings
                </span>
                <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface">
                  <span className="material-symbols-outlined text-[18px]">event_available</span>
                </span>
              </div>
              <div className="mt-4 z-10">
                <div className="font-display text-3xl font-extrabold text-on-surface leading-none tnum">
                  342
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center text-primary font-label-md text-xs font-bold bg-surface-container px-2 py-0.5 rounded">
                    <span className="material-symbols-outlined text-[14px] mr-0.5">north_east</span>
                    +12% WoW
                  </span>
                  <span className="font-body-sm text-xs text-tertiary">7-day pacing</span>
                </div>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between text-tertiary font-body-sm text-xs">
                <span>Repeat Athletes</span>
                <span className="font-data-mono font-semibold text-primary">64% loyalty</span>
              </div>
            </div>

            {/* Card 4: Hardware Fleet Uptime */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high/60 flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between z-10">
                <span className="font-label-md text-label-md uppercase tracking-wider text-tertiary font-bold">
                  Court Fleet Status
                </span>
                <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">stadium</span>
                </span>
              </div>
              <div className="mt-4 z-10">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-extrabold text-on-surface leading-none tnum">
                    6 / 6
                  </span>
                  <span className="font-headline-sm text-sm text-primary font-bold">Active</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-on-surface-variant font-body-sm text-xs">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary-container" />
                  <span>Zero unplanned downtime this cycle</span>
                </div>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between text-tertiary font-body-sm text-xs">
                <span>Next Planned Sweep</span>
                <span className="font-data-mono font-semibold text-on-surface">Tonight 23:30</span>
              </div>
            </div>
          </section>

          {/* Real-Time Interactive Court Gantt / Slot Schedule Timeline */}
          <section className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high/60 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Live Court Operations Timeline
                </span>
                <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-data-mono text-xs font-bold animate-pulse">
                  06:00 - 23:00
                </span>
              </div>

              {/* Status color pills */}
              <div className="flex items-center gap-3 text-xs font-semibold">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-primary-container" />
                  <span className="text-on-surface-variant">Online Booked</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-secondary-container" />
                  <span className="text-on-surface-variant">Walk-in</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-secondary-fixed" />
                  <span className="text-on-surface-variant">Academy Block</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-surface-container-low border border-outline-variant/60" />
                  <span className="text-on-surface-variant">Available</span>
                </div>
              </div>
            </div>

            {/* Timeline Matrix */}
            <div className="overflow-x-auto pb-2 no-scrollbar">
              <div className="min-w-[760px] space-y-2">
                {/* Header Hours */}
                <div className="grid grid-cols-12 gap-1 text-[11px] font-bold text-tertiary uppercase pl-24">
                  <span>06:00</span>
                  <span>08:00</span>
                  <span>10:00</span>
                  <span>12:00</span>
                  <span>14:00</span>
                  <span>16:00</span>
                  <span>17:00</span>
                  <span>18:00</span>
                  <span>19:00</span>
                  <span>20:00</span>
                  <span>21:00</span>
                  <span>22:00</span>
                </div>

                {/* Court Rows */}
                {[
                  { name: 'Court 1 (BWF)', spec: 'Synthetic Wood' },
                  { name: 'Court 2 (Wood)', spec: 'Synthetic Wood' },
                  { name: 'Court 3 (Mat)', spec: 'Standard PVC' },
                  { name: 'Court 4 (Mat)', spec: 'Standard PVC' },
                  { name: 'Court 5 (Train)', spec: 'Training Mat' },
                  { name: 'Court 6 (VIP)', spec: 'Glass Gallery' },
                ].map((c, i) => (
                  <div key={c.name} className="flex items-center gap-2">
                    <div className="w-24 shrink-0">
                      <div className="font-bold text-xs text-on-surface truncate">{c.name}</div>
                      <div className="text-[10px] text-tertiary truncate">{c.spec}</div>
                    </div>
                    <div className="grid grid-cols-12 gap-1 flex-1">
                      {Array.from({ length: 12 }).map((_, slotIdx) => {
                        const isBooked = (i + slotIdx) % 3 === 0;
                        const isWalkin = slotIdx === 6 && i === 1;
                        const isAcademy = slotIdx === 2 && i === 4;

                        if (isBooked) {
                          return (
                            <div
                              key={slotIdx}
                              title="Online Booking #QC-882"
                              className="h-8 rounded bg-primary-container text-on-primary-container text-[10px] font-bold flex items-center justify-center truncate px-1 shadow-xs cursor-pointer hover:opacity-90"
                            >
                              Rahul K.
                            </div>
                          );
                        }
                        if (isWalkin) {
                          return (
                            <div
                              key={slotIdx}
                              title="Offline Walk-in"
                              className="h-8 rounded bg-secondary-container text-on-secondary text-[10px] font-bold flex items-center justify-center truncate px-1 shadow-xs cursor-pointer"
                            >
                              Walk-in
                            </div>
                          );
                        }
                        if (isAcademy) {
                          return (
                            <div
                              key={slotIdx}
                              title="Junior Academy"
                              className="h-8 rounded bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold flex items-center justify-center truncate px-1 cursor-not-allowed"
                            >
                              Academy
                            </div>
                          );
                        }
                        return (
                          <div
                            key={slotIdx}
                            title="Click to reserve walk-in"
                            onClick={() => {
                              setWalkinCourt(c.name);
                              setWalkinModalOpen(true);
                            }}
                            className="h-8 rounded bg-surface-container-low hover:bg-surface-container border border-surface-container-high/60 cursor-pointer flex items-center justify-center text-[10px] text-tertiary transition-colors"
                          >
                            Open
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline-sm text-sm font-bold text-on-surface">Weekly Booking Trends</h3>
                  <p className="text-xs text-tertiary">Reservations volume over past 7 days</p>
                </div>
                <span className="text-xs font-bold text-primary bg-surface-container px-2 py-0.5 rounded">
                  Line Chart
                </span>
              </div>
              <BookingTrendsChart data={stats?.bookingTrends || []} />
            </div>

            <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline-sm text-sm font-bold text-on-surface">Earnings Summary by Sport</h3>
                  <p className="text-xs text-tertiary">Revenue contribution per sport category</p>
                </div>
                <span className="text-xs font-bold text-secondary-container bg-surface-container px-2 py-0.5 rounded">
                  Bar Chart
                </span>
              </div>
              <RevenueBarChart data={stats?.earningsSummary || []} />
            </div>
          </div>

          {/* Peak Booking Hours */}
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline-sm text-sm font-bold text-on-surface">Peak Booking Hours Intensity</h3>
                <p className="text-xs text-tertiary">Hourly reservation density from 06:00 AM to 11:00 PM</p>
              </div>
              <span className="text-xs font-bold text-on-surface bg-surface-container px-2.5 py-0.5 rounded">
                Area Density
              </span>
            </div>
            <PeakHoursAreaChart data={stats?.peakHours || []} />
          </div>

          {/* Today's Bookings Live Feed */}
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/40">
              <div>
                <h3 className="font-headline-sm text-sm font-bold text-on-surface">Today's Live Match Manifest</h3>
                <p className="text-xs text-tertiary">Real-time gate arrivals and turnstile passes</p>
              </div>
              <span className="text-xs font-bold text-on-surface bg-surface-container px-2.5 py-1 rounded-md">
                {stats?.todaysBookings?.length || 4} match(es) active
              </span>
            </div>

            <div className="divide-y divide-surface-container-high/40">
              {(stats?.todaysBookings && stats.todaysBookings.length > 0
                ? stats.todaysBookings
                : [
                    { id: '1', courtName: 'Court 1', sportType: 'Badminton', userName: 'Arjun Mehta', userPhone: '+91 98450 12345', time: '07:00 PM - 08:00 PM', amount: 550 },
                    { id: '2', courtName: 'Court 2', sportType: 'Badminton', userName: 'Sneha Patel', userPhone: '+91 97312 67890', time: '08:00 PM - 09:00 PM', amount: 550 },
                    { id: '3', courtName: 'Court 6', sportType: 'Badminton VIP', userName: 'Karan Sharma', userPhone: '+91 94481 22334', time: '08:00 PM - 09:00 PM', amount: 750 },
                  ]
              ).map((b: any) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-container text-primary flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                    </div>
                    <div>
                      <div className="font-bold text-xs text-on-surface">
                        {b.courtName} ({b.sportType})
                      </div>
                      <div className="text-[11px] text-tertiary">
                        Player: <span className="font-semibold text-on-surface">{b.userName}</span> • {b.userPhone || 'Verified Athlete'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-on-surface tnum">{b.time}</div>
                    <span className="inline-block text-[10px] font-bold text-on-primary-container bg-primary-container px-2 py-0.5 rounded">
                      ₹{b.amount} (Confirmed)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Offline Walk-in Modal */}
      {walkinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container-high/60 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-container text-2xl">person_add</span>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">Quick Offline Walk-in</h3>
              </div>
              <button
                type="button"
                onClick={() => setWalkinModalOpen(false)}
                className="text-tertiary hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {walkinSuccess ? (
              <div className="py-8 text-center space-y-2">
                <span className="material-symbols-outlined text-5xl text-primary animate-bounce">check_circle</span>
                <h4 className="font-bold text-base text-on-surface">Walk-in Booked Successfully!</h4>
                <p className="text-xs text-tertiary">Court locked and receipt recorded.</p>
              </div>
            ) : (
              <form onSubmit={handleWalkinSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-tertiary mb-1">Player Name</label>
                  <input
                    type="text"
                    required
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    placeholder="Enter athlete name"
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-tertiary mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                    placeholder="+91 98450 00000"
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold uppercase text-tertiary mb-1">Select Court</label>
                    <select
                      value={walkinCourt}
                      onChange={(e) => setWalkinCourt(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high text-xs font-medium focus:outline-none"
                    >
                      <option>Court 1 (BWF Pro)</option>
                      <option>Court 2 (Wood)</option>
                      <option>Court 3 (Mat)</option>
                      <option>Court 4 (Mat)</option>
                      <option>Court 5 (Train)</option>
                      <option>Court 6 (VIP)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-tertiary mb-1">Time Slot</label>
                    <select
                      value={walkinSlot}
                      onChange={(e) => setWalkinSlot(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high text-xs font-medium focus:outline-none"
                    >
                      <option>06:00 PM - 07:00 PM</option>
                      <option>07:00 PM - 08:00 PM</option>
                      <option>08:00 PM - 09:00 PM</option>
                      <option>09:00 PM - 10:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-tertiary mb-1">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['UPI', 'Cash', 'Card'].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setWalkinPayment(mode)}
                        className={`py-2 rounded-lg text-xs font-bold transition ${
                          walkinPayment === mode
                            ? 'bg-primary-container text-on-primary-container'
                            : 'bg-surface-container-low text-on-surface border border-surface-container-high'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setWalkinModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-tertiary hover:text-on-surface"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-secondary-container text-on-secondary font-label-lg text-xs font-bold shadow-md hover:opacity-95"
                  >
                    Confirm Walk-in &amp; Lock Slot
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
