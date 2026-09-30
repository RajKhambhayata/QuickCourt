'use client';

import React, { useState, useEffect } from 'react';
import OwnerSidebar from '@/components/OwnerSidebar';
import {
  Clock,
  Ban,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Lock,
  Unlock,
  Sparkles,
} from 'lucide-react';
import { CourtItem, SlotStatus } from '@/lib/types';

export default function TimeSlotManagementPage() {
  const [courts, setCourts] = useState<CourtItem[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<SlotStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockingSlot, setBlockingSlot] = useState<SlotStatus | null>(null);
  const [blockReason, setBlockReason] = useState('Routine Maintenance & Cleaning');
  const [processing, setProcessing] = useState(false);

  // Next 7 days
  const availableDates = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date();
    d.setDate(d.getDate() + index);
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });

  const fetchCourts = async () => {
    try {
      const res = await fetch('/api/owner/courts');
      const data = await res.json();
      if (data.courts && data.courts.length > 0) {
        setCourts(data.courts);
        setSelectedCourtId(data.courts[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSlots = () => {
    if (!selectedCourtId) return;
    setLoading(true);
    fetch(`/api/courts/${selectedCourtId}/slots?date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.slots) setSlots(data.slots);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourts();
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [selectedCourtId, selectedDate]);

  const handleBlockSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockingSlot) return;

    setProcessing(true);
    try {
      const res = await fetch('/api/owner/slots/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId: selectedCourtId,
          date: selectedDate,
          startTime: blockingSlot.startTime,
          endTime: blockingSlot.endTime,
          reason: blockReason,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setBlockingSlot(null);
        fetchSlots();
      } else {
        alert(data.error || 'Failed to block slot');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        <OwnerSidebar />

        <div className="flex-1 space-y-6">
          {/* Header */}
          <div>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Court Availability & Maintenance</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              Time Slot Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Block specific time slots for court polishing, repairs, coaching sessions, or private events.
            </p>
          </div>

          {/* Court Selector & Date Tabs */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            {/* Court Tabs */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                1. Select Court
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {courts.map((court) => (
                  <button
                    key={court.id}
                    onClick={() => setSelectedCourtId(court.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                      court.id === selectedCourtId
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {court.name} ({court.sportType})
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                2. Select Date
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {availableDates.map((item) => (
                  <button
                    key={item.dateStr}
                    onClick={() => setSelectedDate(item.dateStr)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                      item.dateStr === selectedDate
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {item.dayName} ({item.formattedDate})
                  </button>
                ))}
              </div>
            </div>

            {/* Slot Matrix Controls */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  3. Slot Schedule (Click to Block for Maintenance)
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    🟢 Open to Players
                  </span>
                  <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    🔒 Player Booked
                  </span>
                  <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    ⚠️ Maintenance Blocked
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-400 text-xs animate-pulse">
                  Loading slot matrix...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {slots.map((slot) => {
                    if (slot.isBooked) {
                      return (
                        <div
                          key={slot.startTime}
                          className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-xs">{slot.time}</div>
                            <div className="text-[10px] font-semibold text-slate-400 uppercase">
                              Reserved by Player
                            </div>
                          </div>
                          <Lock className="w-4 h-4 text-slate-400" />
                        </div>
                      );
                    }

                    if (slot.isBlocked) {
                      return (
                        <div
                          key={slot.startTime}
                          className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-xs">{slot.time}</div>
                            <div className="text-[10px] font-bold text-amber-700">
                              {slot.blockedReason || 'Blocked for Maintenance'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            {slot.blockedSlotId && (
                              <button
                                onClick={async () => {
                                  if (!confirm('Unblock this slot to allow player bookings?')) return;
                                  const res = await fetch(`/api/owner/slots/block?id=${slot.blockedSlotId}`, {
                                    method: 'DELETE',
                                  });
                                  if (res.ok) fetchSlots();
                                }}
                                className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-800 text-[11px] font-bold hover:bg-amber-100 transition"
                              >
                                Unblock
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={slot.startTime}
                        className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 transition flex items-center justify-between shadow-sm"
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-900">{slot.time}</div>
                          <div className="text-[10px] font-bold text-emerald-600 uppercase">
                            Available (₹{slot.price})
                          </div>
                        </div>

                        <button
                          onClick={() => setBlockingSlot(slot)}
                          className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition flex items-center gap-1"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Block</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Block Slot Modal */}
      {blockingSlot && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-black text-slate-900">
              Block Slot ({blockingSlot.time})
            </h3>
            <p className="text-xs text-slate-500">
              This will disable reservations for players during this specific hour on {selectedDate}.
            </p>

            <form onSubmit={handleBlockSlot} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Reason for Block
                </label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="Routine Maintenance & Cleaning">Routine Maintenance & Cleaning</option>
                  <option value="Floor Polishing & Re-gripping">Floor Polishing & Re-gripping</option>
                  <option value="Floodlight Electrical Repair">Floodlight Electrical Repair</option>
                  <option value="Private Academy Coaching">Private Academy Coaching</option>
                  <option value="Reserved for Tournament">Reserved for Tournament</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBlockingSlot(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  {processing ? 'Blocking...' : 'Confirm Block'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
