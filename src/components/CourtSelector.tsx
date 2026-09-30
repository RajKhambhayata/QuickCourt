'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2, ChevronRight, Ban } from 'lucide-react';
import { CourtItem, SlotStatus } from '@/lib/types';

interface CourtSelectorProps {
  courts: CourtItem[];
  facilityName: string;
  onProceedToBooking: (court: CourtItem, slot: SlotStatus, date: string) => void;
}

export default function CourtSelector({ courts, facilityName, onProceedToBooking }: CourtSelectorProps) {
  const [selectedCourtId, setSelectedCourtId] = useState<string>(courts[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<SlotStatus[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Generate next 7 days for the date selector
  const availableDates = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date();
    d.setDate(d.getDate() + index);
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });

  const selectedCourt = courts.find((c) => c.id === selectedCourtId) || courts[0];

  useEffect(() => {
    if (!selectedCourtId) return;

    setLoading(true);
    setSelectedSlot(null);
    fetch(`/api/courts/${selectedCourtId}/slots?date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.slots) {
          setSlots(data.slots);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedCourtId, selectedDate]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm" id="booking-section">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900">Select Court & Time Slot</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time court availability and instant reservation</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
          </span>
          <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
            <span className="w-2 h-2 rounded-full bg-slate-400" /> Booked
          </span>
          <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Blocked
          </span>
        </div>
      </div>

      {/* 1. Court Selector Tabs */}
      <div className="mb-6">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          1. Choose Court / Arena
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {courts.map((court) => {
            const isSelected = court.id === selectedCourtId;
            return (
              <button
                key={court.id}
                onClick={() => setSelectedCourtId(court.id)}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between card-hover ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-bold text-sm text-slate-900">{court.name}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 animate-scale-in" />}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                    {court.sportType}
                  </span>
                  <span className="font-bold text-slate-900">₹{court.pricePerHour}/hr</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Date Picker */}
      <div className="mb-6">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          2. Choose Date
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {availableDates.map((item) => {
            const isSelected = item.dateStr === selectedDate;
            return (
              <button
                key={item.dateStr}
                onClick={() => setSelectedDate(item.dateStr)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-center transition min-w-[90px] card-hover ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`text-[11px] font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {item.dayName}
                </div>
                <div className="text-sm font-extrabold">{item.formattedDate}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Slot Grid */}
      <div className="mb-6">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          3. Select 1-Hour Time Slot
        </label>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm animate-pulse">
            Checking real-time slot availability...
          </div>
        ) : slots.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm bg-slate-50 rounded-xl">
            No operating slots available for this court today.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {slots.map((slot) => {
              const isSelected = selectedSlot?.startTime === slot.startTime;

              if (slot.isBooked) {
                return (
                  <div
                    key={slot.startTime}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold line-through">{slot.time}</span>
                      <Ban className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase mt-1">Booked</span>
                  </div>
                );
              }

              if (slot.isBlocked) {
                return (
                  <div
                    key={slot.startTime}
                    title={slot.blockedReason || 'Maintenance'}
                    className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 cursor-not-allowed opacity-75 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{slot.time}</span>
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <span className="text-[10px] font-semibold text-amber-700 truncate mt-1">
                      {slot.blockedReason || 'Blocked'}
                    </span>
                  </div>
                );
              }

              return (
                <button
                  key={slot.startTime}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between group card-hover ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                      : 'bg-white hover:border-emerald-500 border-slate-200 text-slate-800 hover:bg-emerald-50/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{slot.time}</span>
                    <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600'}`} />
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className={`text-xs font-extrabold ${isSelected ? 'text-emerald-100' : 'text-emerald-700'}`}>
                      ₹{slot.price}
                    </span>
                    <span className={`text-[10px] font-semibold uppercase ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                      Available
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Action / Price Confirmation Box */}
      {selectedSlot && selectedCourt && (
        <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
          <div>
            <div className="text-xs text-slate-400">Booking Summary</div>
            <div className="font-bold text-sm text-white">
              {selectedCourt.name} • {selectedDate} ({selectedSlot.time})
            </div>
            <div className="text-xs text-emerald-400 font-medium mt-0.5">
              Instant Confirmation • Free cancellation up to 2 hrs before
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Amount</span>
              <span className="text-xl font-black text-white">₹{selectedSlot.price}</span>
            </div>

            <button
              onClick={() => onProceedToBooking(selectedCourt, selectedSlot, selectedDate)}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 shrink-0"
            >
              <span>Proceed to Pay</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
