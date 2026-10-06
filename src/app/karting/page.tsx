'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap,
  ChevronLeft,
  Clock,
  Users,
  Trophy,
  Shield,
  Coins,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Calendar,
} from 'lucide-react';

interface LapRecord {
  lapNo: number;
  timeMs: number;
  user?: { name: string };
}

interface KartHeat {
  id: string;
  trackName: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  seatsTaken: number;
  seatsRemaining: number;
  isFull: boolean;
  kartClass: string;
  pricePerSeat: number;
  status: string;
  lapRecords: LapRecord[];
}

type BookingState = 'IDLE' | 'WAIVER' | 'BOOKING' | 'SUCCESS' | 'ERROR';

function msToTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = ms % 1000;
  return `${s}.${m.toString().padStart(3, '0')}s`;
}

const CLASS_STYLES: Record<string, { label: string; color: string; bg: string; ring: string }> = {
  JUNIOR: { label: 'Junior', color: 'text-sky-300', bg: 'bg-sky-900/50', ring: 'ring-sky-700' },
  ADULT: { label: 'Adult', color: 'text-emerald-300', bg: 'bg-emerald-900/50', ring: 'ring-emerald-700' },
  PRO: { label: 'Pro', color: 'text-rose-300', bg: 'bg-rose-900/50', ring: 'ring-rose-700' },
};

export default function KartingPage() {
  const router = useRouter();
  const [today] = useState(new Date().toISOString().slice(0, 10));
  const [heats, setHeats] = useState<KartHeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHeat, setSelectedHeat] = useState<KartHeat | null>(null);
  const [seats, setSeats] = useState(1);
  const [bookState, setBookState] = useState<BookingState>('IDLE');
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [bookingMsg, setBookingMsg] = useState('');
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/karting/heats?date=${today}`)
      .then((r) => r.json())
      .then((d) => { if (d.heats) setHeats(d.heats); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [today]);

  const openBooking = (heat: KartHeat) => {
    if (heat.isFull) return;
    setSelectedHeat(heat);
    setSeats(1);
    setWaiverAccepted(false);
    setBookState('WAIVER');
    setError('');
  };

  const confirmBooking = async () => {
    if (!selectedHeat) return;
    if (!waiverAccepted) { setError('Please accept the safety waiver to continue.'); return; }
    setBookState('BOOKING');
    setError('');

    try {
      const res = await fetch('/api/karting/heats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heatId: selectedHeat.id, seats, waiverAccepted }),
      });
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Booking failed'); setBookState('ERROR'); return; }
      setBookingMsg(data.message);
      setCoinsEarned(data.coinsEarned || 0);
      setBookState('SUCCESS');
      // Refresh heats
      const refresh = await fetch(`/api/karting/heats?date=${today}`);
      const rd = await refresh.json();
      if (rd.heats) setHeats(rd.heats);
    } catch {
      setError('Network error, please try again');
      setBookState('ERROR');
    }
  };

  const totalCost = selectedHeat ? selectedHeat.pricePerSeat * seats : 0;
  const coinsForBooking = selectedHeat ? Math.floor(totalCost / 10) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/rewards" className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition shrink-0">
              <ChevronLeft className="w-4 h-4 text-slate-300" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400" />
                Karting Heats
              </h1>
              <p className="text-xs text-slate-400">Multi-seat speed sessions — book your race slot!</p>
            </div>
          </div>
          <Link
            href="/karting/championship"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/20 border border-amber-700 hover:bg-amber-600/30 text-amber-300 text-xs font-bold rounded-xl transition shrink-0"
          >
            <Trophy className="w-3.5 h-3.5" /> F1 Championship
          </Link>
        </div>

        {/* Kart Class Legend */}
        <div className="flex gap-2 flex-wrap items-center justify-between">
          <div className="flex gap-1.5 sm:gap-2 flex-wrap items-center">
            {Object.values(CLASS_STYLES).map((c) => (
              <span key={c.label} className={`px-2.5 sm:px-3 py-1 text-xs font-bold rounded-full ring-1 ${c.bg} ${c.ring} ${c.color}`}>
                {c.label}
              </span>
            ))}
          </div>
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-800 text-slate-400 ring-1 ring-slate-700 flex items-center gap-1 shrink-0">
            <Calendar className="w-3 h-3" /> {today}
          </span>
        </div>

        {/* Heats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 bg-slate-900/60 rounded-2xl border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : heats.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
            <Zap className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400">No heats scheduled for today.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {heats.map((heat) => {
              const cs = CLASS_STYLES[heat.kartClass] || CLASS_STYLES.ADULT;
              return (
                <div
                  key={heat.id}
                  className={`bg-slate-900/80 border rounded-2xl overflow-hidden shadow-lg transition-all ${
                    heat.isFull
                      ? 'border-slate-800 opacity-60'
                      : 'border-slate-700 hover:border-rose-700 hover:shadow-rose-900/30'
                  }`}
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-black text-sm leading-tight">{heat.trackName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ring-1 ${cs.bg} ${cs.ring} ${cs.color}`}>
                            {cs.label}
                          </span>
                          <span className="text-slate-500 text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {heat.startTime} – {heat.endTime}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-black text-base">₹{heat.pricePerSeat}</p>
                        <p className="text-slate-500 text-[11px]">per seat</p>
                      </div>
                    </div>

                    {/* Seat capacity bar */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {heat.seatsTaken}/{heat.capacity} seats</span>
                        {heat.isFull ? (
                          <span className="text-rose-400 font-bold">FULL</span>
                        ) : (
                          <span className="text-emerald-400">{heat.seatsRemaining} left</span>
                        )}
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            heat.isFull ? 'bg-rose-600' : heat.seatsTaken / heat.capacity > 0.7 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${(heat.seatsTaken / heat.capacity) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Top lap times */}
                    {heat.lapRecords.length > 0 && (
                      <div className="border-t border-slate-800 pt-2 space-y-1">
                        <p className="text-slate-500 text-[11px] font-bold uppercase">Top Laps</p>
                        {heat.lapRecords.slice(0, 2).map((lap, i) => (
                          <div key={lap.lapNo} className="flex justify-between text-xs">
                            <span className="text-slate-400">{i === 0 ? '🥇' : '🥈'} {lap.user?.name || 'Anonymous'}</span>
                            <span className="text-white font-bold">{msToTime(lap.timeMs)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      disabled={heat.isFull}
                      onClick={() => openBooking(heat)}
                      className={`w-full py-2.5 rounded-xl text-sm font-black transition flex items-center justify-center gap-2 ${
                        heat.isFull
                          ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-500 hover:to-pink-600 text-white shadow-lg shadow-rose-900/30'
                      }`}
                    >
                      {heat.isFull ? 'Heat Full' : (
                        <><Zap className="w-4 h-4" /> Book Seat</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Booking Modal / Waiver */}
        {selectedHeat && (bookState === 'WAIVER' || bookState === 'BOOKING' || bookState === 'ERROR' || bookState === 'SUCCESS') && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl space-y-5 overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-rose-700 to-pink-800 p-5">
                <p className="text-white font-black text-lg">{selectedHeat.trackName}</p>
                <p className="text-rose-200 text-sm">{selectedHeat.startTime} – {selectedHeat.endTime} · {CLASS_STYLES[selectedHeat.kartClass]?.label} Class</p>
              </div>

              {bookState === 'SUCCESS' ? (
                <div className="px-6 pb-6 text-center space-y-4">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
                  <p className="text-white font-black text-lg">{bookingMsg}</p>
                  {coinsEarned > 0 && (
                    <div className="flex items-center justify-center gap-2 bg-amber-900/30 border border-amber-800 rounded-xl py-2">
                      <Coins className="w-5 h-5 text-amber-400" />
                      <span className="text-amber-300 font-bold">+{coinsEarned} Court Coins earned!</span>
                    </div>
                  )}
                  <button
                    onClick={() => { setSelectedHeat(null); setBookState('IDLE'); }}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black rounded-xl"
                  >
                    Done! 🏁
                  </button>
                </div>
              ) : (
                <div className="px-6 pb-6 space-y-4">
                  {/* Seat selector */}
                  <div className="flex items-center justify-between">
                    <p className="text-slate-300 text-sm font-semibold">Number of Seats</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSeats((s) => Math.max(1, s - 1))}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
                      >
                        −
                      </button>
                      <span className="text-white font-black text-lg w-4 text-center">{seats}</span>
                      <button
                        onClick={() => setSeats((s) => Math.min(selectedHeat.seatsRemaining, s + 1))}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">{seats} × ₹{selectedHeat.pricePerSeat}</span>
                    <span className="text-white font-black">₹{totalCost}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <Coins className="w-3 h-3" />
                    <span>You'll earn +{coinsForBooking} Court Coins!</span>
                  </div>

                  {/* Safety Waiver */}
                  <div className="bg-slate-800 rounded-xl p-3 space-y-2 border border-slate-700">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-rose-400" />
                      <p className="text-white font-bold text-xs">Racing Safety Waiver</p>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      By checking below, I confirm that I am in good health, free from medical conditions that may affect my ability to race safely. I understand the risks of motorsport activity and agree to follow all track safety instructions. I release QuickCourt and venue operators from liability for any injury sustained during the karting session.
                    </p>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={waiverAccepted}
                        onChange={(e) => setWaiverAccepted(e.target.checked)}
                        className="w-4 h-4 rounded accent-rose-500"
                      />
                      <span className="text-slate-300 text-xs font-semibold">I have read and accept the safety waiver</span>
                    </label>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl px-3 py-2">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => { setSelectedHeat(null); setBookState('IDLE'); }}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={bookState === 'BOOKING'}
                      onClick={confirmBooking}
                      className="flex-1 py-2.5 bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-500 hover:to-pink-600 disabled:opacity-50 text-white text-sm font-black rounded-xl transition shadow-lg"
                    >
                      {bookState === 'BOOKING' ? 'Processing...' : `Pay ₹${totalCost}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
