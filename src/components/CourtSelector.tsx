'use client';

import React, { useState, useEffect } from 'react';
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
  const [countdown, setCountdown] = useState<number>(540); // 9 mins

  // 10-minute hold timer simulation
  useEffect(() => {
    if (!selectedSlot) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 600));
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedSlot]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Generate next 7 days for the date selector
  const availableDates = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date();
    d.setDate(d.getDate() + index);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isWeekend,
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

  // Segment slots into Morning, Afternoon, Evening
  const morningSlots = slots.filter((s) => {
    const hour = parseInt(s.startTime.split(':')[0], 10);
    return hour >= 6 && hour < 12;
  });

  const afternoonSlots = slots.filter((s) => {
    const hour = parseInt(s.startTime.split(':')[0], 10);
    return hour >= 12 && hour < 16;
  });

  const eveningSlots = slots.filter((s) => {
    const hour = parseInt(s.startTime.split(':')[0], 10);
    return hour >= 16;
  });

  const renderSlotCard = (slot: SlotStatus) => {
    const isSelected = selectedSlot?.startTime === slot.startTime;

    if (slot.isBooked) {
      return (
        <div
          key={slot.startTime}
          className="p-2.5 rounded-lg bg-surface-container-highest text-on-surface-variant opacity-60 flex flex-col justify-between h-[64px] cursor-not-allowed select-none border border-outline-variant/30"
        >
          <div className="flex items-center justify-between">
            <span className="font-data-mono text-data-mono">{slot.time}</span>
            <span className="material-symbols-outlined text-[15px]">lock</span>
          </div>
          <span className="font-label-md text-[10px] uppercase font-bold text-on-surface-variant/80">Booked</span>
        </div>
      );
    }

    if (slot.isBlocked) {
      return (
        <div
          key={slot.startTime}
          title={slot.blockedReason || 'Maintenance'}
          className="p-2.5 rounded-lg bg-secondary-fixed/50 text-on-secondary-fixed opacity-75 flex flex-col justify-between h-[64px] cursor-not-allowed select-none border border-secondary-fixed"
        >
          <div className="flex items-center justify-between">
            <span className="font-data-mono text-data-mono">{slot.time}</span>
            <span className="material-symbols-outlined text-[15px]">construction</span>
          </div>
          <span className="font-label-md text-[10px] uppercase font-bold truncate">
            {slot.blockedReason || 'Blocked'}
          </span>
        </div>
      );
    }

    if (isSelected) {
      return (
        <button
          key={slot.startTime}
          onClick={() => setSelectedSlot(null)}
          type="button"
          className="p-2.5 rounded-lg bg-primary-container text-on-primary-container ring-2 ring-primary-container shadow-md flex flex-col justify-between h-[64px] transition-transform scale-[1.02] text-left cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="font-data-mono text-data-mono font-bold">{slot.time}</span>
            <span className="material-symbols-outlined text-[16px] font-bold">check</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-data-mono text-data-mono font-extrabold">₹{slot.price}</span>
            <span className="font-label-md text-[10px] uppercase font-extrabold tracking-wider">Held</span>
          </div>
        </button>
      );
    }

    return (
      <button
        key={slot.startTime}
        onClick={() => setSelectedSlot(slot)}
        type="button"
        className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/60 hover:border-primary cursor-pointer hover:bg-surface-container-low transition-all flex flex-col justify-between h-[64px] text-left group"
      >
        <div className="flex items-center justify-between">
          <span className="font-data-mono text-data-mono font-semibold text-on-surface group-hover:text-primary">
            {slot.time}
          </span>
          <span className="w-2 h-2 rounded-full bg-primary" />
        </div>
        <div className="flex items-center justify-between">
          <span className="font-data-mono text-data-mono text-on-surface-variant font-medium">₹{slot.price}</span>
          <span className="font-label-md text-[10px] uppercase font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Select
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-4 md:p-6 shadow-md border border-surface-container-high/60" id="booking-section">
      {/* Section Title & Live Countdown Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 mb-6 bg-surface-container-low p-4 rounded-xl border border-surface-container-high/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-inverse-surface text-primary-container flex items-center justify-center font-bold shadow-sm">
            <span className="material-symbols-outlined text-[24px]">electric_bolt</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-extrabold">Live Slot Matrix</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Real-time sync with arena sensors &amp; court access gates
            </p>
          </div>
        </div>

        {/* Lock Timer Indicator Banner */}
        {selectedSlot ? (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-inverse-surface text-inverse-on-surface shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-container" />
            </span>
            <span className="font-data-mono text-data-mono text-primary-fixed">⚡ 1 slot held for</span>
            <span className="font-data-mono text-data-mono font-bold text-on-primary bg-primary/40 px-2 py-0.5 rounded">
              {formatTimer(countdown)}
            </span>
            <span className="font-body-sm text-body-sm text-tertiary-fixed hidden sm:inline">to avoid double-booking</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
            <span className="font-label-md text-label-md font-semibold">Zero Double-Booking Guarantee</span>
          </div>
        )}
      </div>

      {/* Step 1: Select Court Surface */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-bold">
            Step 1: Select Court Surface
          </span>
          <span className="font-body-sm text-body-sm text-primary font-semibold flex items-center gap-0.5">
            Compare Specs <span className="material-symbols-outlined text-[14px]">info</span>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {courts.map((court, idx) => {
            const isSelected = court.id === selectedCourtId;
            const badgeLabel = idx === 0 ? 'BWF PRO' : idx === 1 ? 'WOOD' : idx === 2 ? 'MAT' : 'STANDARD';

            return (
              <button
                key={court.id}
                onClick={() => setSelectedCourtId(court.id)}
                type="button"
                className={`flex flex-col text-left p-3 rounded-lg shadow-sm transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'bg-inverse-surface text-inverse-on-surface shadow-md'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                {isSelected && <div className="absolute top-0 right-0 w-2 h-full bg-primary-container" />}
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-headline-sm text-headline-sm font-bold truncate ${isSelected ? 'text-surface' : ''}`}>
                    {court.name}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded font-label-md text-[10px] font-bold ${
                      isSelected
                        ? 'bg-primary-container text-on-primary-container'
                        : 'bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    {badgeLabel}
                  </span>
                </div>
                <span className={`font-body-sm text-body-sm mb-2 truncate ${isSelected ? 'text-tertiary-fixed' : 'text-on-surface-variant'}`}>
                  {court.sportType}
                </span>
                <span className={`font-data-mono text-data-mono font-bold ${isSelected ? 'text-primary-fixed' : 'text-on-surface'}`}>
                  ₹{court.pricePerHour}
                  <span className={`font-normal text-body-sm ${isSelected ? 'text-tertiary-fixed' : 'text-on-surface-variant'}`}>
                    /hr
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Choose Date */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-bold">
            Step 2: Choose Date
          </span>
          <div className="flex items-center gap-1 text-on-surface-variant font-label-md text-label-md">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            <span>Live Schedule</span>
          </div>
        </div>

        <div className="flex md:grid md:grid-cols-7 gap-2 overflow-x-auto pb-2 no-scrollbar">
          {availableDates.map((item) => {
            const isSelected = item.dateStr === selectedDate;
            return (
              <button
                key={item.dateStr}
                onClick={() => setSelectedDate(item.dateStr)}
                type="button"
                className={`flex flex-col items-center py-2 px-2 rounded-xl transition-all relative shrink-0 min-w-[76px] sm:min-w-[84px] md:min-w-0 md:shrink ${
                  isSelected
                    ? 'bg-primary text-on-primary shadow-md'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                <span
                  className={`font-label-md text-xs uppercase tracking-wider font-semibold ${
                    isSelected
                      ? 'text-primary-fixed'
                      : item.isWeekend
                      ? 'text-secondary font-bold'
                      : 'text-on-surface-variant'
                  }`}
                >
                  {item.dayName}
                </span>
                <span className="font-headline-sm text-sm sm:text-headline-sm font-bold">{item.formattedDate}</span>
                <span
                  className={`font-body-sm text-[10px] sm:text-[11px] ${
                    isSelected
                      ? 'text-on-primary/80'
                      : item.isWeekend
                      ? 'text-secondary font-semibold'
                      : 'text-on-surface-variant'
                  }`}
                >
                  {item.isWeekend ? 'Peak' : 'Regular'}
                </span>
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                    isSelected
                      ? 'bg-primary-container'
                      : item.isWeekend
                      ? 'bg-secondary'
                      : 'bg-transparent'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-surface-container-low mb-6 font-label-md text-label-md border border-surface-container-high/40">
        <span className="font-semibold text-on-surface text-xs">Slot Status:</span>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-surface-container-lowest shadow-sm flex items-center justify-center border border-outline-variant/40">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            </span>
            <span className="text-on-surface-variant">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-primary-container flex items-center justify-center text-on-primary-container">
              <span className="material-symbols-outlined text-[10px] font-bold">check</span>
            </span>
            <span className="text-on-surface font-bold">Selected (Held)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[10px]">lock</span>
            </span>
            <span className="text-on-surface-variant">Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
              <span className="material-symbols-outlined text-[10px]">construction</span>
            </span>
            <span className="text-on-surface-variant">Blocked / Academy</span>
          </div>
        </div>
      </div>

      {/* Slot Matrix Segments */}
      {loading ? (
        <div className="py-16 text-center text-tertiary text-sm animate-pulse space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="font-semibold">Syncing real-time court availability matrix...</p>
        </div>
      ) : slots.length === 0 ? (
        <div className="py-12 text-center text-on-surface-variant bg-surface-container-low rounded-xl border border-surface-container-high">
          No operating slots scheduled for this court on the selected date.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Morning */}
          {morningSlots.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary text-[18px]">wb_sunny</span>
                <h3 className="font-headline-sm text-headline-sm font-bold">Morning Slots</h3>
                <span className="font-body-sm text-xs text-on-surface-variant">(06:00 AM – 12:00 PM)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {morningSlots.map(renderSlotCard)}
              </div>
            </div>
          )}

          {/* Afternoon */}
          {afternoonSlots.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-secondary text-[18px]">wb_twilight</span>
                <h3 className="font-headline-sm text-headline-sm font-bold">Afternoon Slots</h3>
                <span className="font-body-sm text-xs text-on-surface-variant">(12:00 PM – 04:00 PM)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {afternoonSlots.map(renderSlotCard)}
              </div>
            </div>
          )}

          {/* Evening Peak */}
          {eveningSlots.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-secondary-container text-[18px]">nightlight</span>
                <h3 className="font-headline-sm text-headline-sm font-bold">Evening Peak Slots</h3>
                <span className="font-body-sm text-xs text-secondary font-semibold">
                  (04:00 PM – 11:30 PM • Floodlit)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {eveningSlots.map(renderSlotCard)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sticky Bottom Booking Bar */}
      {selectedSlot && selectedCourt && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-surface-container-high shadow-2xl p-3 sm:p-4 pb-[max(env(safe-area-inset-bottom,0.75rem),0.75rem)] transition-all animate-in slide-in-from-bottom-4">
          <div className="max-w-[1280px] mx-auto flex flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold shrink-0">
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">check</span>
              </div>
              <div className="min-w-0">
                <div className="font-headline-sm text-xs sm:text-headline-sm text-on-surface font-extrabold truncate">
                  {selectedCourt.name} • {selectedSlot.time}
                </div>
                <div className="flex items-center gap-1.5 font-body-sm text-[11px] sm:text-body-sm text-tertiary">
                  <span className="text-primary font-semibold truncate">⚡ 10-min Lock</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">Date: {selectedDate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <div className="text-right">
                <span className="font-label-md text-[9px] sm:text-[11px] uppercase font-bold text-tertiary tracking-wider block leading-tight">
                  Total
                </span>
                <div className="font-display text-lg sm:text-2xl font-black text-on-surface tnum">
                  ₹{selectedSlot.price}
                </div>
              </div>

              <button
                onClick={() => onProceedToBooking(selectedCourt, selectedSlot, selectedDate)}
                type="button"
                className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-secondary-container hover:bg-secondary-container/90 active:scale-[0.98] text-on-secondary font-label-lg text-xs sm:text-label-lg font-bold shadow-lg transition-all flex items-center gap-1 sm:gap-2 cursor-pointer shrink-0"
              >
                <span>Book Slot</span>
                <span className="material-symbols-outlined text-[16px] sm:text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
