'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Coins,
  Sparkles,
  Trophy,
  ArrowRight,
  Gift,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';

interface PrizeItem {
  id: string;
  name: string;
  emoji: string;
  type: string;
  value: number;
  description: string;
  segmentIndex: number;
}

const SEGMENTS = [
  { name: '25 Coins', emoji: '🪙', color: '#8B5CF6', text: '#FFFFFF' },
  { name: '50 Coins', emoji: '⚡', color: '#EC4899', text: '#FFFFFF' },
  { name: 'Free Drink', emoji: '🥤', color: '#3B82F6', text: '#FFFFFF' },
  { name: '₹50 Off', emoji: '💰', color: '#10B981', text: '#FFFFFF' },
  { name: '100 Coins', emoji: '💎', color: '#F59E0B', text: '#000000' },
  { name: 'Grand Prize', emoji: '🏆', color: '#EF4444', text: '#FFFFFF' },
];

export default function SpinPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [canSpin, setCanSpin] = useState(true);
  const [nextSpinAt, setNextSpinAt] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<PrizeItem | null>(null);
  const [wonCoupon, setWonCoupon] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/games/spin')
      .then((r) => {
        if (r.status === 401) {
          router.push('/login');
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) {
          setCanSpin(data.canSpin);
          setNextSpinAt(data.nextSpinAt);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSpin = async () => {
    if (!canSpin || isSpinning) return;
    setIsSpinning(true);
    setError(null);

    try {
      const res = await fetch('/api/games/spin', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to spin');
        setIsSpinning(false);
        return;
      }

      const segmentCount = SEGMENTS.length;
      const segmentAngle = 360 / segmentCount;
      const targetIndex = data.selectedIndex;

      // Calculate target rotation: 5 full rotations + offset so the pointer (at top, 270 deg / 0 deg) lands on selected segment
      // Top pointer aligns with 270° or 0° depending on orientation.
      // Standard wheel: 0° is right (3 o'clock). Top is 270°.
      const extraSpins = 360 * 6; // 6 full revolutions
      // Center of segment i is at (i * segmentAngle + segmentAngle / 2)
      // To bring that center to the top (270° or 90° opposite), adjust:
      const targetAngle = 360 - (targetIndex * segmentAngle + segmentAngle / 2);
      const totalRotation = rotation + extraSpins + targetAngle;

      setRotation(totalRotation);

      // Wait for spin animation (4.5 seconds)
      setTimeout(() => {
        setIsSpinning(false);
        setWonPrize(data.prize);
        setWonCoupon(data.coupon);
        setCanSpin(false);
        setNextSpinAt(data.nextSpinAt);
      }, 4800);
    } catch (e: any) {
      setError(e.message || 'Spin error');
      setIsSpinning(false);
    }
  };

  const formattedNext = nextSpinAt
    ? new Date(nextSpinAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '24 hours';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 text-white flex flex-col">
      {/* Top Header */}
      <div className="border-b border-slate-800 bg-slate-950/70 backdrop-blur-md px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/games"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-base font-black text-white flex items-center gap-1.5">
                <span>🎡</span> Daily Spin Wheel
              </h1>
              <p className="text-[11px] text-slate-400">Spin once every 24 hours for guaranteed rewards</p>
            </div>
          </div>

          <Link
            href="/rewards"
            className="text-xs font-bold text-violet-400 hover:text-violet-300 transition flex items-center gap-1"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            Wallet
          </Link>
        </div>
      </div>

      {/* Main Wheel Arena */}
      <div className="max-w-xl mx-auto px-4 py-8 w-full flex-1 flex flex-col items-center justify-center space-y-8">
        {/* Wheel Display Area */}
        <div className="relative flex items-center justify-center">
          {/* Wheel Ticker / Pointer at top */}
          <div className="absolute -top-4 z-30 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-400 filter drop-shadow-[0_4px_8px_rgba(245,158,11,0.6)]" />
          </div>

          {/* Glowing Outer Rim */}
          <div className="w-80 h-80 sm:w-96 sm:h-96 rounded-full p-3 bg-gradient-to-tr from-amber-500 via-violet-600 to-pink-500 shadow-2xl shadow-violet-950/80 flex items-center justify-center relative">
            <div className="w-full h-full rounded-full bg-slate-950 p-2 overflow-hidden relative">
              {/* Rotating Wheel Container */}
              <div
                className="w-full h-full rounded-full relative transition-transform"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transitionDuration: isSpinning ? '4500ms' : '0ms',
                  transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.25, 1)',
                }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full rounded-full transform -rotate-90">
                  {SEGMENTS.map((seg, i) => {
                    const angle = 360 / SEGMENTS.length;
                    const startAngle = (i * angle * Math.PI) / 180;
                    const endAngle = ((i + 1) * angle * Math.PI) / 180;

                    const x1 = 50 + 50 * Math.cos(startAngle);
                    const y1 = 50 + 50 * Math.sin(startAngle);
                    const x2 = 50 + 50 * Math.cos(endAngle);
                    const y2 = 50 + 50 * Math.sin(endAngle);

                    const path = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                    // Midpoint for text
                    const midAngle = ((i + 0.5) * angle * Math.PI) / 180;
                    const textX = 50 + 32 * Math.cos(midAngle);
                    const textY = 50 + 32 * Math.sin(midAngle);
                    const textRot = (i + 0.5) * angle;

                    return (
                      <g key={i}>
                        <path d={path} fill={seg.color} stroke="#0f172a" strokeWidth="0.8" />
                        <text
                          x={textX}
                          y={textY}
                          fill={seg.text}
                          fontSize="4.2"
                          fontWeight="900"
                          textAnchor="middle"
                          dominantBaseline="central"
                          transform={`rotate(${textRot + 90}, ${textX}, ${textY})`}
                        >
                          {seg.emoji} {seg.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Center Hub Button */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-slate-950 border-4 border-amber-400 flex items-center justify-center shadow-xl shadow-amber-500/20">
                  <span className="text-xl">⭐</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spin Action / Cooldown */}
        <div className="w-full max-w-sm space-y-4 text-center">
          {error && (
            <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
              {error}
            </p>
          )}

          {canSpin ? (
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className={`w-full py-4 rounded-2xl font-black text-base transition-all shadow-xl flex items-center justify-center gap-2 ${
                isSpinning
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 hover:from-amber-300 hover:to-pink-400 text-slate-950 shadow-amber-500/25 hover:scale-[1.02]'
              }`}
            >
              {isSpinning ? (
                <>
                  <span className="animate-spin text-lg">🎡</span>
                  <span>Spinning... Good Luck!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-slate-950" />
                  <span>SPIN FREE NOW</span>
                </>
              )}
            </button>
          ) : (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400">
                <Clock className="w-4 h-4" />
                <span>Next Free Spin Available Around {formattedNext}</span>
              </div>
              <p className="text-xs text-slate-400">
                You get 1 free spin every 24 hours. Play Smash Rally in the meantime!
              </p>
            </div>
          )}

          <div className="flex justify-center gap-4 text-xs font-semibold text-slate-400 pt-2">
            <Link href="/games/smash-rally" className="hover:text-white transition flex items-center gap-1">
              🏸 Smash Rally
            </Link>
            <span>•</span>
            <Link href="/games/trivia" className="hover:text-white transition flex items-center gap-1">
              🧠 Sports Trivia
            </Link>
            <span>•</span>
            <Link href="/games/scratch" className="hover:text-white transition flex items-center gap-1">
              🎴 Scratch Cards
            </Link>
          </div>
        </div>
      </div>

      {/* Won Prize Celebration Modal */}
      {wonPrize && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-4xl shadow-xl shadow-amber-500/20 animate-bounce">
              {wonPrize.emoji}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">Congratulations!</p>
              <h2 className="text-3xl font-black text-white">{wonPrize.name}</h2>
              <p className="text-slate-300 text-xs max-w-xs mx-auto leading-relaxed">
                {wonPrize.description}
              </p>
            </div>

            {wonCoupon && (
              <div className="bg-slate-950 rounded-2xl p-4 border border-dashed border-amber-500/40 space-y-1">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Your Coupon Code</p>
                <p className="text-xl font-mono font-black text-amber-300 tracking-wider">{wonCoupon.code}</p>
                <p className="text-[10px] text-slate-500">Apply at checkout or present at food court counter</p>
              </div>
            )}

            <div className="flex gap-3 justify-center pt-2">
              <Link
                href="/rewards"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs hover:opacity-90 transition shadow-lg shadow-amber-500/20"
              >
                Check Rewards Wallet
              </Link>
              <button
                onClick={() => setWonPrize(null)}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
