'use client';

import React, { useState, useEffect } from 'react';
import OwnerSidebar from '@/components/OwnerSidebar';
import {
  CalendarDays,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Phone,
  Mail,
  Trophy,
} from 'lucide-react';
import { BookingItem } from '@/lib/types';

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchBookings = () => {
    setLoading(true);
    const params = new URLSearchParams({ forOwner: 'true' });
    if (filterStatus !== 'ALL') params.set('status', filterStatus);

    fetch(`/api/bookings?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.bookings) setBookings(data.bookings);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const filteredBookings = bookings.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      b.bookingNumber.toLowerCase().includes(q) ||
      b.court?.name?.toLowerCase().includes(q) ||
      b.user?.name?.toLowerCase().includes(q) ||
      b.user?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        <OwnerSidebar />

        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Customer Bookings & Live Schedule</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                Booking Overview
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Real-time stream of all customer reservations across your sports facilities.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                Total: {filteredBookings.length}
              </span>
            </div>
          </div>

          {/* Search & Status Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search player or court..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    filterStatus === st
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st === 'ALL' ? 'All Records' : st.charAt(0) + st.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs animate-pulse">
                Loading bookings...
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No matching booking records found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Booking ID</th>
                      <th className="py-3.5 px-4">Player Details</th>
                      <th className="py-3.5 px-4">Court & Sport</th>
                      <th className="py-3.5 px-4">Date & Time</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {b.bookingNumber}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{b.user?.name || 'Player'}</div>
                          <div className="text-[11px] text-slate-400">{b.user?.email}</div>
                          {b.user?.phone && (
                            <div className="text-[11px] text-slate-500 font-mono">{b.user.phone}</div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{b.court?.name}</div>
                          <span className="inline-block mt-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {b.court?.sportType}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{b.date}</div>
                          <div className="text-[11px] text-slate-500">
                            {b.startTime} - {b.endTime}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-black text-slate-900">
                          ₹{b.totalAmount}
                        </td>

                        <td className="py-3.5 px-4">
                          {b.status === 'CONFIRMED' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Booked
                            </span>
                          )}
                          {b.status === 'CANCELLED' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                              <XCircle className="w-3 h-3" /> Cancelled
                            </span>
                          )}
                          {b.status === 'COMPLETED' && (
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              Completed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
