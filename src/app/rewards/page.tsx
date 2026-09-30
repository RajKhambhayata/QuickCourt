'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Coins,
  Trophy,
  Zap,
  Gift,
  Star,
  Flame,
  Target,
  ChevronRight,
  Gamepad2,
  ShoppingBag,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Medal,
  TrendingUp,
} from 'lucide-react';

interface CouponItem {
  id: string;
  code: string;
  title: string;
  description: string;
  type: string;
  value: number;
  expiresAt: string;
  partnerOutlet?: { name: string; category: string } | null;
  gameSessionId?: string | null;
}

interface LedgerItem {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

interface RewardsData {
  wallet: { coins: number; credit: number };
  streak: {
    count: number;
    target: number;
    daysRemaining: number;
    rewardIssued: boolean;
    windowStart: string;
  };
  playerTier: {
    tier: string;
    label: string;
    perk: string;
    nextTierBookings: number;
    color: string;
  };
  completedBookingsCount: number;
  gameTokensAvailable: number;
  activeCoupons: CouponItem[];
  coinLedger: LedgerItem[];
}

export default function RewardsPage() {
  const router = useRouter();
  const [data, setData] = useState<RewardsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rewards/summary')
      .then((r) => {
        if (r.status === 401) { router.push('/login'); return null; }
        return r.json();
      })
      .then((d) => { if (d?.success) setData(d); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 mx-auto flex items-center justify-center animate-pulse">
            <Coins className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-400 font-semibold">Loading your rewards...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { wallet, streak, playerTier, completedBookingsCount, gameTokensAvailable, activeCoupons, coinLedger } = data;
  const streakPercent = Math.min(100, Math.round((streak.count / streak.target) * 100));

  const TIER_STYLES: Record<string, { bg: string; ring: string; badge: string; icon: React.ReactNode }> = {
    BRONZE: {
      bg: 'from-amber-900/80 to-amber-800/60',
      ring: 'ring-amber-700',
      badge: 'bg-amber-700 text-amber-100',
      icon: <Medal className="w-5 h-5 text-amber-400" />,
    },
    SILVER: {
      bg: 'from-slate-700/80 to-slate-600/60',
      ring: 'ring-slate-400',
      badge: 'bg-slate-500 text-slate-100',
      icon: <Medal className="w-5 h-5 text-slate-200" />,
    },
    GOLD: {
      bg: 'from-yellow-800/80 to-amber-700/60',
      ring: 'ring-yellow-500',
      badge: 'bg-yellow-600 text-yellow-50',
      icon: <Medal className="w-5 h-5 text-yellow-300" />,
    },
    PLATINUM: {
      bg: 'from-teal-800/80 to-emerald-700/60',
      ring: 'ring-teal-400',
      badge: 'bg-teal-600 text-teal-50',
      icon: <Trophy className="w-5 h-5 text-teal-300" />,
    },
  };

  const ts = TIER_STYLES[playerTier.tier] || TIER_STYLES.BRONZE;

  const LEDGER_TYPE_STYLES: Record<string, string> = {
    EARN: 'text-emerald-400',
    BONUS: 'text-amber-400',
    SPEND: 'text-rose-400',
    EXPIRE: 'text-slate-500',
  };

  function daysUntilExpiry(dateStr: string) {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/10 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Court Rewards</h1>
              <p className="text-xs text-slate-400">Earn coins, unlock perks, play mini-games</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">

        {/* Top Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Wallet Coins */}
          <div className="col-span-2 md:col-span-2 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 relative overflow-hidden shadow-xl shadow-emerald-900/40">
            <div className="absolute right-4 top-4 opacity-10">
              <Coins className="w-20 h-20" />
            </div>
            <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Court Coins Balance</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-5xl font-black text-white">{wallet.coins.toLocaleString()}</span>
              <span className="text-emerald-200 text-sm font-semibold mb-1">coins</span>
            </div>
            <p className="text-emerald-100 text-xs mt-2">
              100 coins = <strong>₹50 off</strong> your next booking
            </p>
            <div className="flex gap-2 mt-4">
              <Link
                href="/venues"
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg transition backdrop-blur-sm"
              >
                Earn More
              </Link>
              <Link
                href="/venues"
                className="px-3 py-1.5 bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold rounded-lg transition shadow"
              >
                Redeem
              </Link>
            </div>
          </div>

          {/* Player Tier */}
          <div className={`bg-gradient-to-br ${ts.bg} ring-1 ${ts.ring} rounded-2xl p-4 space-y-2 shadow-lg`}>
            <div className="flex items-center gap-2">
              {ts.icon}
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${ts.badge}`}>
                {playerTier.tier}
              </span>
            </div>
            <p className="text-white font-black text-sm leading-tight">{playerTier.label}</p>
            <p className="text-slate-300 text-[11px] leading-snug">{playerTier.perk}</p>
            {playerTier.nextTierBookings > 0 && (
              <p className="text-xs text-slate-400">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                {playerTier.nextTierBookings} more booking{playerTier.nextTierBookings > 1 ? 's' : ''} to next tier
              </p>
            )}
          </div>

          {/* Game Tokens */}
          <div className="bg-gradient-to-br from-violet-900/80 to-purple-800/60 ring-1 ring-violet-600 rounded-2xl p-4 space-y-2 shadow-lg">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-violet-300" />
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-700 text-violet-100">
                Mini Games
              </span>
            </div>
            <p className="text-5xl font-black text-white">{gameTokensAvailable}</p>
            <p className="text-violet-200 text-[11px]">game tokens available</p>
            {gameTokensAvailable > 0 ? (
              <Link
                href="/games/smash-rally"
                className="inline-flex items-center gap-1 text-xs font-bold text-violet-200 hover:text-white transition"
              >
                Play Now <ArrowRight className="w-3 h-3" />
              </Link>
            ) : (
              <p className="text-xs text-violet-400">Book a court to unlock a token</p>
            )}
          </div>
        </div>

        {/* Streak Progress */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <h2 className="text-white font-black text-base">Booking Streak</h2>
            </div>
            <span className="text-xs text-slate-400">
              {streak.daysRemaining}d remaining in window
            </span>
          </div>
          <p className="text-slate-400 text-xs">
            Book <strong className="text-white">5 courts in 60 days</strong> → unlock a <strong className="text-emerald-400">20% off coupon</strong> (max ₹200)
          </p>

          <div className="flex gap-2">
            {Array.from({ length: streak.target }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-3 rounded-full transition-all ${
                  i < streak.count
                    ? streak.rewardIssued
                      ? 'bg-emerald-500 shadow-md shadow-emerald-500/40'
                      : 'bg-orange-500 shadow-md shadow-orange-500/40'
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              {streak.count}/{streak.target} bookings
            </span>
            {streak.rewardIssued ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Coupon issued — check Active Coupons!
              </span>
            ) : streak.count >= streak.target ? (
              <span className="text-amber-400 font-semibold">Streak complete! 🎉</span>
            ) : (
              <span className="text-slate-500">
                {streak.target - streak.count} more to unlock reward
              </span>
            )}
          </div>
        </div>

        {/* Mini Games Panel */}
        <div className="bg-gradient-to-br from-slate-900 to-violet-950/40 border border-violet-900/40 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-violet-400" />
            <h2 className="text-white font-black text-base">Mini Games & Spin</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'Smash Rally', desc: '30s tap game → win food!', icon: '🏸', href: '/games/smash-rally', locked: false, token: gameTokensAvailable },
              { name: 'Daily Spin', desc: 'Spin every 24 hours!', icon: '🎡', href: '/games/spin', locked: false },
              { name: 'Scratch Card', desc: 'Post-booking surprise!', icon: '🎴', href: '/games/scratch', locked: gameTokensAvailable === 0 },
              { name: 'Sports Trivia', desc: '5 questions → 50 coins!', icon: '🧠', href: '/games/trivia', locked: false },
            ].map((g) => (
              <Link
                key={g.name}
                href={g.locked ? '#' : g.href}
                className={`group relative rounded-xl p-4 border text-center space-y-2 transition ${
                  g.locked
                    ? 'bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed'
                    : 'bg-slate-800/80 border-slate-700 hover:border-violet-600 hover:bg-violet-950/40'
                }`}
              >
                {g.locked && (
                  <Lock className="w-3 h-3 absolute top-2 right-2 text-slate-600" />
                )}
                <div className="text-2xl">{g.icon}</div>
                <p className="text-white font-bold text-xs">{g.name}</p>
                <p className="text-slate-400 text-[11px]">{g.desc}</p>
                {g.token !== undefined && g.token > 0 && (
                  <span className="absolute top-2 left-2 bg-violet-600 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                    {g.token}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Food Court Partners', desc: 'Redeem food coupons', icon: ShoppingBag, href: '/food-court', color: 'from-orange-600 to-amber-600' },
            { label: 'Karting Heats', desc: 'Book a racing seat', icon: Zap, href: '/karting', color: 'from-rose-600 to-pink-700' },
            { label: 'F1 Championship', desc: 'Season standings', icon: Trophy, href: '/karting/championship', color: 'from-slate-700 to-slate-600' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`bg-gradient-to-br ${item.color} rounded-2xl p-4 flex items-center gap-3 hover:opacity-90 transition shadow-lg group`}
            >
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-black text-sm">{item.label}</p>
                <p className="text-white/70 text-xs">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Active Coupons */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-black text-base flex items-center gap-2">
              <Gift className="w-4 h-4 text-pink-400" />
              Active Coupons
              {activeCoupons.length > 0 && (
                <span className="bg-pink-600 text-white text-[10px] font-black rounded-full px-2 py-0.5">
                  {activeCoupons.length}
                </span>
              )}
            </h2>
          </div>

          {activeCoupons.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
              <Gift className="w-10 h-10 text-slate-700 mx-auto" />
              <p className="text-slate-400 text-sm">No active coupons yet</p>
              <p className="text-slate-600 text-xs">Play Smash Rally or complete 5 bookings to win vouchers!</p>
              <Link
                href="/venues"
                className="inline-block mt-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
              >
                Book a Court
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeCoupons.map((coupon) => {
                const expiresIn = daysUntilExpiry(coupon.expiresAt);
                const isFood = coupon.type === 'FOOD_ITEM';
                return (
                  <div
                    key={coupon.id}
                    className={`relative rounded-2xl border overflow-hidden shadow-lg ${
                      isFood
                        ? 'bg-gradient-to-br from-orange-950/60 to-amber-950/40 border-orange-800/50'
                        : 'bg-gradient-to-br from-emerald-950/60 to-teal-950/40 border-emerald-800/50'
                    }`}
                  >
                    {/* Dotted divider (ticket style) */}
                    <div className="flex">
                      <div className="flex-1 p-4 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{isFood ? '🍔' : '💰'}</span>
                          <div>
                            <p className="text-white font-black text-sm leading-tight">{coupon.title}</p>
                            {coupon.partnerOutlet && (
                              <p className="text-[11px] text-orange-300">{coupon.partnerOutlet.name}</p>
                            )}
                          </div>
                        </div>
                        {coupon.description && (
                          <p className="text-slate-400 text-[11px] leading-snug">{coupon.description}</p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>Expires in {expiresIn}d</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center px-3 border-l border-dashed border-slate-700 min-w-[72px]">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Code</p>
                        <p className="text-white font-black text-xs tracking-widest text-center">{coupon.code}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Coin History */}
        {coinLedger.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-800 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <h2 className="text-white font-black text-sm">Coin History</h2>
            </div>
            <div className="divide-y divide-slate-800/60">
              {coinLedger.map((item) => (
                <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-slate-300 text-xs font-medium">{item.description}</p>
                    <p className="text-slate-600 text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`font-black text-sm ${LEDGER_TYPE_STYLES[item.type] || 'text-slate-400'}`}>
                    {item.type === 'EARN' || item.type === 'BONUS' ? '+' : '-'}{item.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
