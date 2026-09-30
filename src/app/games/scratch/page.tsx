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
  Lock,
  RotateCcw,
  Zap,
} from 'lucide-react';

interface ScratchPrize {
  id: string;
  name: string;
  emoji: string;
  type: string;
  value: number;
  description: string;
}

export default function ScratchCardPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [availableCards, setAvailableCards] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [scratchedCount, setScratchedCount] = useState(0);
  const [currentPrize, setCurrentPrize] = useState<ScratchPrize | null>(null);
  const [currentCoupon, setCurrentCoupon] = useState<any | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cards count
  const loadCards = async () => {
    try {
      const res = await fetch('/api/games/scratch');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setAvailableCards(data.availableCards);
        setTotalEarned(data.totalEarned);
        setScratchedCount(data.scratchedCount);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  // Initialize Canvas foil
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.globalCompositeOperation = 'source-over';

    // Metallic silver/gold foil gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#94a3b8');
    grad.addColorStop(0.2, '#cbd5e1');
    grad.addColorStop(0.5, '#f8fafc');
    grad.addColorStop(0.8, '#cbd5e1');
    grad.addColorStop(1, '#64748b');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative holographic pattern
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ SCRATCH HERE ✨', width / 2, height / 2 - 10);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Swipe or drag to reveal prize', width / 2, height / 2 + 15);
  };

  // When prize is fetched for new card, initialize foil canvas
  const startNewCard = async () => {
    if (availableCards <= 0) return;
    setIsProcessing(true);
    setError(null);
    setIsRevealed(false);

    try {
      const res = await fetch('/api/games/scratch', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to draw scratch card');
        setIsProcessing(false);
        return;
      }

      setCurrentPrize(data.prize);
      setCurrentCoupon(data.coupon);
      setAvailableCards(data.remainingCards);

      setTimeout(() => {
        initCanvas();
        setIsProcessing(false);
      }, 50);
    } catch (e: any) {
      setError(e.message || 'Error unlocking card');
      setIsProcessing(false);
    }
  };

  // Scratch handler
  const scratch = (clientX: number, clientY: number) => {
    if (isRevealed || !currentPrize) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2, false);
    ctx.fill();

    checkPercentScratched();
  };

  const checkPercentScratched = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imgData.data;
      let transparentPixels = 0;
      const totalPixels = pixels.length / 4;

      // Sample every 16th pixel for speed
      for (let i = 3; i < pixels.length; i += 16) {
        if (pixels[i] === 0) {
          transparentPixels += 4;
        }
      }

      const percent = (transparentPixels / totalPixels) * 100;
      if (percent > 40 && !isRevealed) {
        setIsRevealed(true);
        // Clear remaining canvas with fade
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    } catch {}
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsScratching(true);
    scratch(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isScratching) return;
    scratch(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    setIsScratching(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white flex flex-col">
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
                <span>🎴</span> Scratch & Win
              </h1>
              <p className="text-[11px] text-slate-400">Post-booking surprise reward cards</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {availableCards} Card{availableCards !== 1 ? 's' : ''} Ready
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8 w-full flex-1 flex flex-col items-center justify-center space-y-6">
        {error && (
          <p className="w-full text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 text-center">
            {error}
          </p>
        )}

        {/* Card Stage */}
        <div className="w-full bg-slate-900/90 border border-emerald-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Lucky Scratch Card
            </span>
            <span className="text-xs text-slate-400">QuickCourt Rewards</span>
          </div>

          {/* Interactive Scratch Area or Start Button */}
          {currentPrize ? (
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-emerald-500/40 flex items-center justify-center select-none touch-none">
              {/* Prize Revealed Underneath */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-3 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-teal-950">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-4xl shadow-lg">
                  {currentPrize.emoji}
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">You Won!</p>
                  <p className="text-2xl font-black text-white">{currentPrize.name}</p>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto mt-1 leading-relaxed">
                    {currentPrize.description}
                  </p>
                </div>
                {currentCoupon && (
                  <div className="bg-slate-950/90 px-4 py-1.5 rounded-xl border border-dashed border-emerald-500/50">
                    <span className="font-mono text-xs font-black text-emerald-300 tracking-wider">
                      {currentCoupon.code}
                    </span>
                  </div>
                )}
              </div>

              {/* Canvas Foil Overlay */}
              <canvas
                ref={canvasRef}
                width={320}
                height={240}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className={`absolute inset-0 w-full h-full cursor-pointer transition-opacity duration-500 ${
                  isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
              />
            </div>
          ) : (
            <div className="aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/60 flex flex-col items-center justify-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-3xl">
                🎴
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">
                  {availableCards > 0 ? 'Ready to Scratch!' : 'No Cards Remaining'}
                </h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  {availableCards > 0
                    ? `You have ${availableCards} scratch card${availableCards > 1 ? 's' : ''} available. Click below to begin!`
                    : 'Book a court at any venue to unlock bonus scratch cards and win cash discounts!'}
                </p>
              </div>

              {availableCards > 0 ? (
                <button
                  onClick={startNewCard}
                  disabled={isProcessing}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition hover:scale-105"
                >
                  {isProcessing ? 'Drawing Card...' : 'Draw & Scratch Now'}
                </button>
              ) : (
                <Link
                  href="/venues"
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
                >
                  Book a Court Now
                </Link>
              )}
            </div>
          )}

          {/* Action Footer */}
          {currentPrize && isRevealed && (
            <div className="pt-2 flex flex-col gap-3">
              <div className="flex gap-2 justify-center">
                <Link
                  href="/rewards"
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
                >
                  View in Rewards
                </Link>
                {availableCards > 0 && (
                  <button
                    onClick={startNewCard}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs hover:opacity-90 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Scratch Next ({availableCards})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* How to Earn More */}
        <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> How to Unlock More Cards
          </p>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-800 flex items-center justify-center text-[10px] font-bold">1</span>
              <span>Every court booking automatically unlocks 1 scratch card</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-800 flex items-center justify-center text-[10px] font-bold">2</span>
              <span>All registered players get 1 free starter scratch card</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-800 flex items-center justify-center text-[10px] font-bold">3</span>
              <span>Prizes include up to 150 Court Coins and ₹75 discounts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
