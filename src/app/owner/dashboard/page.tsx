'use client';

import React, { useState, useEffect } from 'react';
import OwnerSidebar from '@/components/OwnerSidebar';
import {
  BookingTrendsChart,
  RevenueBarChart,
  PeakHoursAreaChart,
} from '@/components/Charts';
import {
  CalendarDays,
  DollarSign,
  Trophy,
  Activity,
  Clock,
  Sparkles,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  Building2,
} from 'lucide-react';

export default function OwnerDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ownerStatus, setOwnerStatus] = useState<string | null>(null);

  useEffect(() => {
    // Fetch owner status
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => { if (d.user) setOwnerStatus(d.user.status); })
      .catch(() => {});

    fetch('/api/owner/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-8">
        <OwnerSidebar />
        <div className="flex-1 space-y-6 animate-pulse">
          <div className="h-32 bg-slate-200 rounded-3xl" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-28 bg-slate-200 rounded-2xl" />
            <div className="h-28 bg-slate-200 rounded-2xl" />
            <div className="h-28 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const kpis = stats?.kpis || {
    totalBookings: 0,
    activeCourts: 0,
    totalEarnings: 0,
    facilitiesCount: 0,
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <OwnerSidebar />

        {/* Main Content Area */}
        <div className="flex-1 space-y-8">
          {/* Pending Approval Banner */}
          {ownerStatus === 'PENDING_APPROVAL' && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-amber-900 text-sm">Account Under Admin Review</h3>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Your Facility Owner application is currently being reviewed by the admin team. You will be able to add facilities and courts once your account is approved — usually within 24 hours.
                </p>
                <p className="text-xs text-amber-600 mt-2 font-semibold">Need help? Contact: support@quickcourt.com</p>
              </div>
            </div>
          )}
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Facility Owner Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">Welcome Back, Manager!</h1>
              <p className="text-xs text-emerald-100">
                Here is your real-time arena utilization, revenue overview, and live court schedule.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
              <a
                href="/owner/facility"
                className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Register Facility / Turf</span>
              </a>
              <a
                href="/owner/courts"
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition border border-white/20 flex items-center gap-1.5"
              >
                <Trophy className="w-4 h-4 text-emerald-300" />
                <span>+ Add Court</span>
              </a>
            </div>
          </div>

          {kpis.facilitiesCount === 0 && ownerStatus !== 'PENDING_APPROVAL' && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 border-dashed rounded-3xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">You haven't registered a sports facility yet</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Start by registering your turf, badminton academy, or sports complex. Once created, you can add multiple courts, set slot prices, and accept player bookings!
              </p>
              <a
                href="/owner/facility"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Register Your First Facility / Turf</span>
              </a>
            </div>
          )}

          {/* 1. KPIs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Bookings</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CalendarDays className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">{kpis.totalBookings}</div>
              <p className="text-[11px] text-emerald-600 font-semibold">+12% vs last week</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Courts</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Trophy className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">{kpis.activeCourts}</div>
              <p className="text-[11px] text-slate-500 font-medium">Across {kpis.facilitiesCount} arenas</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Simulated Earnings</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">₹{kpis.totalEarnings.toLocaleString()}</div>
              <p className="text-[11px] text-emerald-600 font-semibold">100% payout rate</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Occupancy</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">84%</div>
              <p className="text-[11px] text-slate-500 font-medium">Peak hours 6PM - 10PM</p>
            </div>
          </div>

          {/* 2. Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily/Weekly Booking Trends */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Weekly Booking Trends</h3>
                  <p className="text-xs text-slate-500">Reservations volume over past 7 days</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  Line Chart
                </span>
              </div>
              <BookingTrendsChart data={stats?.bookingTrends || []} />
            </div>

            {/* Earnings Summary by Sport */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Earnings Summary by Sport</h3>
                  <p className="text-xs text-slate-500">Revenue contribution per sport category</p>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                  Bar Chart
                </span>
              </div>
              <RevenueBarChart data={stats?.earningsSummary || []} />
            </div>
          </div>

          {/* 3. Peak Booking Hours Heatmap / Area Chart */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Peak Booking Hours</h3>
                <p className="text-xs text-slate-500">Hourly reservation intensity from 06:00 AM to 11:00 PM</p>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">
                Area Density
              </span>
            </div>
            <PeakHoursAreaChart data={stats?.peakHours || []} />
          </div>

          {/* 4. Today's Live Schedule / Booking Calendar */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Today's Live Court Calendar</h3>
                <p className="text-xs text-slate-500">Scheduled matches and reservations for today</p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                {stats?.todaysBookings?.length || 0} match(es) today
              </span>
            </div>

            {stats?.todaysBookings?.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No bookings scheduled for today yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {stats?.todaysBookings?.map((b: any) => (
                  <div key={b.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          {b.courtName} ({b.sportType})
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Player: <span className="font-medium text-slate-800">{b.userName}</span> • {b.userPhone || 'No phone'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-extrabold text-slate-900">{b.time}</div>
                      <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        ₹{b.amount} (Confirmed)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
