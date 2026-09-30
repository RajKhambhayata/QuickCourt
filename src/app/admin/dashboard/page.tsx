'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  BookingTrendsChart,
  RevenueBarChart,
  DoughnutChart,
  PeakHoursAreaChart,
} from '@/components/Charts';
import {
  Users,
  Building2,
  CalendarCheck,
  Trophy,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Sparkles,
  DollarSign,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-8">
        <AdminSidebar />
        <div className="flex-1 space-y-6 animate-pulse">
          <div className="h-32 bg-slate-200 rounded-3xl" />
          <div className="grid grid-cols-4 gap-4">
            <div className="h-28 bg-slate-200 rounded-2xl" />
            <div className="h-28 bg-slate-200 rounded-2xl" />
            <div className="h-28 bg-slate-200 rounded-2xl" />
            <div className="h-28 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {
    totalUsers: 0,
    totalOwners: 0,
    totalBookings: 0,
    totalActiveCourts: 0,
    totalGMV: 0,
    pendingApprovals: 0,
    openReports: 0,
  };

  const charts = data?.charts || {};

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        <AdminSidebar />

        <div className="flex-1 space-y-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-white/10 text-purple-200 border border-white/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Super Admin Global Platform Overview</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">Platform Control Center</h1>
              <p className="text-xs text-purple-200">
                Live metrics across all sports facilities, user registrations, and platform earnings.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              {kpis.pendingApprovals > 0 && (
                <div className="px-3 py-2 bg-amber-500/20 border border-amber-400/40 rounded-xl text-xs font-bold text-amber-200 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-300" />
                  <span>{kpis.pendingApprovals} Pending Approvals</span>
                </div>
              )}
            </div>
          </div>

          {/* 1. Global KPIs Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Players</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">{kpis.totalUsers}</div>
              <p className="text-[11px] text-purple-600 font-semibold">+24 this month</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Facility Owners</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">{kpis.totalOwners}</div>
              <p className="text-[11px] text-emerald-600 font-semibold">{kpis.pendingApprovals} pending review</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Bookings</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <CalendarCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">{kpis.totalBookings}</div>
              <p className="text-[11px] text-blue-600 font-semibold">Across {kpis.totalActiveCourts} courts</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform GMV</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">₹{kpis.totalGMV.toLocaleString()}</div>
              <p className="text-[11px] text-emerald-600 font-semibold">Simulated platform gross</p>
            </div>
          </div>

          {/* 2. Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Booking Activity Over Time */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Booking Activity Over Time</h3>
                  <p className="text-xs text-slate-500">Daily reservation frequency across all clubs</p>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">
                  Line Chart
                </span>
              </div>
              <BookingTrendsChart data={charts.bookingTrends || []} />
            </div>

            {/* Most Active Sports Distribution */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Most Active Sports</h3>
                  <p className="text-xs text-slate-500">Distribution of player bookings by sport category</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  Doughnut Chart
                </span>
              </div>
              <DoughnutChart data={charts.mostActiveSports || []} />
            </div>
          </div>

          {/* 3. User Registration Trends & Earnings Simulation */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">User Growth & Facility Onboarding Trends</h3>
                <p className="text-xs text-slate-500">Monthly new registered players vs facility owners</p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                Growth Matrix
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              {charts.regTrends?.map((item: any) => (
                <div key={item.month} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <div className="text-xs font-black text-slate-500 uppercase">{item.month}</div>
                  <div className="text-lg font-black text-slate-900">{item.players} <span className="text-xs font-normal text-slate-400">players</span></div>
                  <div className="text-xs font-bold text-emerald-600">{item.owners} owners</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
