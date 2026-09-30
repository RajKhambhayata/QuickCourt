'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  RotateCcw,
  Sparkles,
  Trophy,
  ArrowRight,
} from 'lucide-react';
import { BookingItem } from '@/lib/types';

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus !== 'ALL') params.set('status', filterStatus);

    fetch(`/api/bookings?${params.toString()}`)
      .then((res) => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.bookings) {
          setBookings(data.bookings);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? A full refund will be processed.')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Player requested cancellation' }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchBookings();
      } else {
        alert(data.error || 'Failed to cancel');
      }
    } catch (err) {
      console.error(err);
      alert('Error cancelling booking');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> Confirmed
          </span>
        );
      case 'PENDING_PAYMENT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
            <AlertCircle className="w-3 h-3" /> Pending Payment
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3 h-3" /> Cancelled (Refunded)
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              <span>Player Reservations</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              My Court Bookings
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your upcoming sports matches, download booking passes, and view payment receipts.
            </p>
          </div>

          <Link
            href="/venues"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
          >
            <span>Book Another Court</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
          {['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {st === 'ALL' ? 'All Bookings' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-white rounded-2xl border border-slate-200 animate-pulse p-6" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No bookings found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You don't have any bookings matching this status. Explore our top sports venues to schedule a game!
            </p>
            <Link
              href="/venues"
              className="inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Explore Venues
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const isFuture =
                new Date(`${booking.date}T${booking.startTime}`) > new Date() ||
                booking.status === 'CONFIRMED';
              const canCancel = booking.status === 'CONFIRMED' && isFuture;

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  {/* Left info */}
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        booking.court?.facility?.images?.[0] ||
                        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=300'
                      }
                      alt={booking.court?.facility?.name || 'Venue'}
                      className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0 hidden sm:block"
                    />

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(booking.status)}
                        <span className="text-[11px] font-mono text-slate-400 font-semibold">
                          #{booking.bookingNumber}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {booking.court?.sportType}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">
                        {booking.court?.facility?.name}
                      </h3>

                      <div className="text-xs font-semibold text-slate-700">
                        {booking.court?.name}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          {booking.date}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          {booking.startTime} - {booking.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {booking.court?.facility?.city}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Price & Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Paid</span>
                      <span className="text-xl font-black text-slate-900">₹{booking.totalAmount}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {canCancel && (
                        <button
                          disabled={cancellingId === booking.id}
                          onClick={() => handleCancel(booking.id)}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition disabled:opacity-50"
                        >
                          {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                      )}

                      <Link
                        href={`/venues/${booking.court?.facility?.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                      >
                        Venue Page
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
