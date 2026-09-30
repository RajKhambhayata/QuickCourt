'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Gamepad2,
  Trophy,
  ChevronLeft,
  Zap,
  Timer,
  Target,
  Gift,
  Star,
  AlertCircle,
  CheckCircle2,
  Coins,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';

interface TapEvent {
  timestamp: number;
  accuracy: number;
  combo: number;
}

interface GameResult {
  verifiedScore: number;
  tier: string;
  bonusCoinsAwarded: number;
  reward: {
    tierName: string;
    couponTitle: string;
    couponType: string;
    couponValue: number;
    bonusCoins: number;
    validDays: number;
    itemDescription: string;
  };
  coupon: {
    code: string;
    title: string;
    description: string;
  } | null;
  partnerOutlet: { name: string; category: string; address: string } | null;
}

type GameState = 'IDLE' | 'COUNTDOWN' | 'PLAYING' | 'SUBMITTING' | 'RESULT' | 'ERROR';

const GAME_DURATION = 30; // seconds
const SWEET_SPOT_SIZE = 80; // px radius for perfect hit

export default function SmashRallyPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const gameStateRef = useRef<GameState>('IDLE');

  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mutable refs for animation loop
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const tapsRef = useRef<TapEvent[]>([]);
  const ballPosRef = useRef({ x: 300, y: 300 });
  const ballVelRef = useRef({ vx: 4, vy: 3.5 });
  const lastHitTimeRef = useRef(0);
  const hitFlashRef = useRef(0); // countdown for hit flash animation
  const comboFlashRef = useRef('');
  const gameStartTimeRef = useRef(0);

  const setGS = (s: GameState) => {
    gameStateRef.current = s;
    setGameState(s);
  };

  // Start game session
  const initSession = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/games/start', { method: 'POST' });
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Could not start game'); setGS('ERROR'); return; }
      setSessionId(data.sessionId);
      setGS('COUNTDOWN');
      setCountdown(3);
    } catch {
      setError('Network error, please try again');
      setGS('ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (gameState !== 'COUNTDOWN') return;
    if (countdown <= 0) {
      startPlaying();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [gameState, countdown]);

  const startPlaying = () => {
    scoreRef.current = 0;
    comboRef.current = 0;
    tapsRef.current = [];
    setScore(0);
    setCombo(0);
    setTapCount(0);
    setTimeLeft(GAME_DURATION);
    gameStartTimeRef.current = Date.now();
    setGS('PLAYING');
  };

  // Game timer
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    if (timeLeft <= 0) {
      endGame();
      return;
    }
    const t = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [gameState, timeLeft]);

  const endGame = () => {
    setGS('SUBMITTING');
    cancelAnimationFrame(animFrameRef.current);
    submitScore();
  };

  const submitScore = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch('/api/games/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          score: scoreRef.current,
          tapLog: tapsRef.current,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to submit score'); setGS('ERROR'); return; }
      setResult(data);
      setScore(data.verifiedScore);
      setGS('RESULT');
    } catch {
      setError('Network error while submitting score');
      setGS('ERROR');
    }
  };

  // Canvas game loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Init ball at center
    ballPosRef.current = { x: W / 2, y: H / 2 };
    ballVelRef.current = { vx: 4.5 + Math.random() * 2, vy: 3.5 + Math.random() * 2 };

    let lastTime = performance.now();

    const loop = (now: number) => {
      if (gameStateRef.current !== 'PLAYING') return;

      const dt = Math.min((now - lastTime) / 16.67, 3); // cap delta
      lastTime = now;

      // Update ball position
      const { x, y } = ballPosRef.current;
      const { vx, vy } = ballVelRef.current;
      let nx = x + vx * dt;
      let ny = y + vy * dt;
      let nvx = vx;
      let nvy = vy;

      const R = 18;
      if (nx - R < 0 || nx + R > W) { nvx = -nvx; nx = Math.max(R, Math.min(W - R, nx)); }
      if (ny - R < 0 || ny + R > H) { nvy = -nvy; ny = Math.max(R, Math.min(H - R, ny)); }

      ballPosRef.current = { x: nx, y: ny };
      ballVelRef.current = { vx: nvx, vy: nvy };

      // Draw
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);

      // Court lines
      ctx.strokeStyle = 'rgba(52,211,153,0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < W; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
      }
      for (let j = 0; j < H; j += 40) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(W, j); ctx.stroke();
      }

      // Hit flash effect (radial glow around hit point)
      if (hitFlashRef.current > 0) {
        const alpha = hitFlashRef.current / 20;
        const gradient = ctx.createRadialGradient(nx, ny, 0, nx, ny, 60);
        gradient.addColorStop(0, `rgba(52,211,153,${alpha * 0.6})`);
        gradient.addColorStop(1, 'rgba(52,211,153,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);
        hitFlashRef.current = Math.max(0, hitFlashRef.current - 1);
      }

      // Ball shadow
      const shadowGrad = ctx.createRadialGradient(nx + 3, ny + 3, 0, nx + 3, ny + 3, R * 2);
      shadowGrad.addColorStop(0, 'rgba(0,0,0,0.4)');
      shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(nx - R, ny - R, R * 4, R * 4);

      // Ball
      const ballGrad = ctx.createRadialGradient(nx - 4, ny - 4, 2, nx, ny, R);
      ballGrad.addColorStop(0, '#a7f3d0');
      ballGrad.addColorStop(0.5, '#10b981');
      ballGrad.addColorStop(1, '#047857');
      ctx.beginPath();
      ctx.arc(nx, ny, R, 0, Math.PI * 2);
      ctx.fillStyle = ballGrad;
      ctx.fill();

      // Combo text floating
      if (comboFlashRef.current) {
        ctx.font = 'bold 28px Inter, sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'center';
        ctx.globalAlpha = hitFlashRef.current / 20;
        ctx.fillText(comboFlashRef.current, nx, ny - 40);
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
        if (hitFlashRef.current <= 0) comboFlashRef.current = '';
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [gameState]);

  const handleTap = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (gameState !== 'PLAYING') return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      let tapX: number, tapY: number;

      if ('touches' in e) {
        const touch = e.touches[0] || e.changedTouches[0];
        tapX = (touch.clientX - rect.left) * (canvas.width / rect.width);
        tapY = (touch.clientY - rect.top) * (canvas.height / rect.height);
      } else {
        tapX = (e.clientX - rect.left) * (canvas.width / rect.width);
        tapY = (e.clientY - rect.top) * (canvas.height / rect.height);
      }

      const bx = ballPosRef.current.x;
      const by = ballPosRef.current.y;
      const dist = Math.sqrt((tapX - bx) ** 2 + (tapY - by) ** 2);
      const accuracy = Math.max(0, 1 - dist / SWEET_SPOT_SIZE);

      const now = Date.now();
      const timeSinceLast = now - lastHitTimeRef.current;
      lastHitTimeRef.current = now;

      // Update combo
      let newCombo = comboRef.current;
      if (accuracy > 0.2 && timeSinceLast < 3000) {
        newCombo = Math.min(20, newCombo + 1);
      } else if (accuracy < 0.1) {
        newCombo = 0;
      }
      comboRef.current = newCombo;
      setCombo(newCombo);

      const comboMult = Math.min(3, 1 + Math.floor(newCombo / 5) * 0.2);
      const tapPoints = Math.round(20 * accuracy * comboMult);
      const newScore = Math.min(1000, scoreRef.current + tapPoints);
      scoreRef.current = newScore;
      setScore(newScore);
      setTapCount((p) => p + 1);

      // Store tap for anti-cheat
      tapsRef.current.push({
        timestamp: now - gameStartTimeRef.current,
        accuracy: parseFloat(accuracy.toFixed(3)),
        combo: newCombo,
      });

      // Flash animation
      if (accuracy > 0.4) {
        hitFlashRef.current = 20;
        comboFlashRef.current = newCombo > 4 ? `COMBO x${newCombo}!` : accuracy > 0.8 ? 'PERFECT!' : 'GOOD!';
      }
    },
    [gameState]
  );

  const TIER_INFO: Record<string, { emoji: string; color: string; bg: string }> = {
    'Grand Slam Champion': { emoji: '🏆', color: 'text-amber-300', bg: 'from-amber-900 to-yellow-900' },
    'Court Feast': { emoji: '🍽️', color: 'text-orange-300', bg: 'from-orange-900 to-red-900' },
    'Snack Attack': { emoji: '🍟', color: 'text-yellow-300', bg: 'from-yellow-900 to-amber-900' },
    'Thirst Quencher': { emoji: '🥤', color: 'text-cyan-300', bg: 'from-cyan-900 to-blue-900' },
    'Try Again Tier': { emoji: '💪', color: 'text-slate-300', bg: 'from-slate-800 to-slate-900' },
  };

  const tierStyle = result ? (TIER_INFO[result.tier] || TIER_INFO['Try Again Tier']) : null;

  const timePercent = Math.round((timeLeft / GAME_DURATION) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/rewards" className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition">
            <ChevronLeft className="w-4 h-4 text-slate-300" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏸</span>
            <div>
              <h1 className="text-lg font-black text-white">Smash Rally</h1>
              <p className="text-xs text-slate-400">Hit the ball → win food vouchers!</p>
            </div>
          </div>
        </div>

        {/* Prize Table */}
        {(gameState === 'IDLE' || gameState === 'ERROR') && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <p className="text-white font-black text-sm flex items-center gap-2">
              <Gift className="w-4 h-4 text-pink-400" /> Score to Win
            </p>
            <div className="space-y-2">
              {[
                { range: '900 – 1000', prize: 'Free Grand Combo Meal + 50 Coins 🏆', color: 'text-amber-300 bg-amber-950/50 border-amber-800' },
                { range: '700 – 899', prize: '₹100 Off Meals > ₹300 🍽️', color: 'text-orange-300 bg-orange-950/50 border-orange-800' },
                { range: '400 – 699', prize: 'Free Fries or Sandwich 🍟', color: 'text-yellow-300 bg-yellow-950/50 border-yellow-800' },
                { range: '200 – 399', prize: 'Free Cold Drink / Lime Soda 🥤', color: 'text-cyan-300 bg-cyan-950/50 border-cyan-800' },
                { range: '0 – 199', prize: '+5 Bonus Court Coins 💪', color: 'text-slate-300 bg-slate-800/50 border-slate-700' },
              ].map((p) => (
                <div key={p.range} className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs ${p.color}`}>
                  <span className="font-black">{p.range}</span>
                  <span className="font-semibold">{p.prize}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Game canvas area */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-violet-900/20">
          {/* HUD */}
          {gameState === 'PLAYING' && (
            <div className="px-4 py-2 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-white font-black text-sm">{score}</span>
                  <span className="text-slate-500 text-xs">pts</span>
                </div>
                {combo > 2 && (
                  <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-0.5 rounded-full animate-pulse">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span className="text-amber-300 font-black text-xs">x{combo} COMBO</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${timePercent > 50 ? 'bg-emerald-500' : timePercent > 20 ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'}`}
                    style={{ width: `${timePercent}%` }}
                  />
                </div>
                <span className={`font-black text-sm ${timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>
          )}

          {/* Canvas */}
          <div className="relative" style={{ height: gameState === 'PLAYING' ? 340 : 240 }}>
            <canvas
              ref={canvasRef}
              width={560}
              height={340}
              className="w-full h-full cursor-crosshair"
              style={{ display: gameState === 'PLAYING' ? 'block' : 'none' }}
              onClick={handleTap}
              onTouchStart={handleTap}
            />

            {gameState === 'IDLE' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
                <div className="text-7xl animate-bounce">🏸</div>
                <div className="text-center space-y-1">
                  <p className="text-white font-black text-xl">Ready to Smash?</p>
                  <p className="text-slate-400 text-sm">Tap the bouncing ball to score points!</p>
                </div>
                <button
                  onClick={initSession}
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black rounded-2xl shadow-lg shadow-emerald-600/30 transition text-base"
                >
                  {isLoading ? 'Loading...' : '🚀 Start Game'}
                </button>
              </div>
            )}

            {gameState === 'COUNTDOWN' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80">
                <div key={countdown} className="text-8xl font-black text-white animate-ping-once">
                  {countdown === 0 ? 'GO!' : countdown}
                </div>
                <p className="text-slate-400 text-sm mt-4">Get ready to smash!</p>
              </div>
            )}

            {gameState === 'SUBMITTING' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
                <div className="w-10 h-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                <p className="text-slate-300 font-semibold text-sm">Verifying your score...</p>
              </div>
            )}

            {gameState === 'ERROR' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 p-8">
                <AlertCircle className="w-12 h-12 text-rose-400" />
                <p className="text-rose-300 font-semibold text-center text-sm">{error}</p>
                <button
                  onClick={() => { setGS('IDLE'); setError(null); }}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-xl transition"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {gameState === 'PLAYING' && (
            <div className="px-4 py-2 bg-slate-950 text-center">
              <p className="text-slate-500 text-xs">Tap / click the bouncing ball to score!</p>
            </div>
          )}
        </div>

        {/* Result Screen */}
        {gameState === 'RESULT' && result && tierStyle && (
          <div className={`bg-gradient-to-br ${tierStyle.bg} border border-slate-700 rounded-3xl p-6 space-y-5 shadow-2xl`}>
            <div className="text-center space-y-2">
              <div className="text-6xl">{tierStyle.emoji}</div>
              <h2 className={`text-2xl font-black ${tierStyle.color}`}>{result.tier}</h2>
              <p className="text-slate-300 text-sm">Final Score: <strong className="text-white text-2xl">{result.verifiedScore}</strong></p>
            </div>

            <div className="bg-black/30 rounded-2xl p-4 space-y-1 text-center">
              <p className="text-white font-black text-base">{result.reward.couponTitle}</p>
              <p className="text-slate-300 text-sm">{result.reward.itemDescription}</p>
              {result.bonusCoinsAwarded > 0 && (
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-300 font-bold text-sm">+{result.bonusCoinsAwarded} Court Coins earned!</span>
                </div>
              )}
            </div>

            {result.coupon && (
              <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center space-y-1">
                <p className="text-slate-300 text-xs">Your Food Court Voucher Code</p>
                <p className="text-white font-black tracking-[0.3em] text-xl">{result.coupon.code}</p>
                {result.partnerOutlet && (
                  <p className="text-slate-400 text-xs">Redeem at: {result.partnerOutlet.name}</p>
                )}
                <p className="text-slate-500 text-[11px]">Valid for {result.reward.validDays} days. Single use only.</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setGS('IDLE'); setResult(null); setSessionId(null); setScore(0); setCombo(0); }}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Play Again
              </button>
              <Link
                href="/rewards"
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4" /> My Rewards
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
