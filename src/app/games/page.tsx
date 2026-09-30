'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Gamepad2,
  Trophy,
  Coins,
  Sparkles,
  Zap,
  Flame,
  ArrowRight,
  Gift,
  HelpCircle,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  Star,
} from 'lucide-react';

interface UserRewardState {
  wallet: { coins: number };
  gameTokensAvailable: number;
}

export default function GamesHubPage() {
  const [rewardData, setRewardData] = useState<UserRewardState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rewards/summary')
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d?.success) {
          setRewardData({
            wallet: d.wallet,
            gameTokensAvailable: d.gameTokensAvailable,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const games = [
    {
      id: 'smash-rally',
      title: 'Smash Rally',
      badge: 'POPULAR',
      badgeColor: 'bg-violet-500 text-white',
      icon: '🏸',
      desc: '30-second rapid racket timing challenge! Hit shuttlecocks in the sweet spot to win free cold drinks and combo meals.',
      rewardText: 'Win up to 50 Coins + Free Meals',
      href: '/games/smash-rally',
      accent: 'from-violet-600 to-purple-600',
      borderGlow: 'hover:border-violet-500/50 hover:shadow-violet-900/30',
      actionText: 'Play Smash Rally',
      tokenRequired: true,
    },
    {
      id: 'spin',
      title: 'Daily Spin Wheel',
      badge: 'DAILY FREE',
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
      icon: '🎡',
      desc: 'Spin the wheel every 24 hours to win free Court Coins, ₹50-₹100 booking discounts, and partner refreshments.',
      rewardText: 'Up to 200 Coins & Vouchers',
      href: '/games/spin',
      accent: 'from-amber-500 to-orange-500',
      borderGlow: 'hover:border-amber-500/50 hover:shadow-amber-900/30',
      actionText: 'Spin the Wheel',
      tokenRequired: false,
    },
    {
      id: 'scratch',
      title: 'Scratch & Win',
      badge: 'POST-BOOKING',
      badgeColor: 'bg-emerald-500 text-slate-950 font-bold',
      icon: '🎴',
      desc: 'Unlocked with every confirmed court booking! Scratch away holographic silver foil to reveal mystery cash & coin prizes.',
      rewardText: 'Win ₹75 Off & 150 Coins',
      href: '/games/scratch',
      accent: 'from-emerald-500 to-teal-600',
      borderGlow: 'hover:border-emerald-500/50 hover:shadow-emerald-900/30',
      actionText: 'Reveal Cards',
      tokenRequired: true,
    },
    {
      id: 'trivia',
      title: 'Sports Trivia Blitz',
      badge: 'DAILY BRAIN BOOST',
      badgeColor: 'bg-blue-500 text-white',
      icon: '🧠',
      desc: '5 rapid-fire sports questions spanning Badminton, Cricket, Tennis & F1. Earn 10 Court Coins for every correct answer!',
      rewardText: 'Earn up to 50 Court Coins',
      href: '/games/trivia',
      accent: 'from-blue-600 to-cyan-500',
      borderGlow: 'hover:border-blue-500/50 hover:shadow-blue-900/30',
      actionText: 'Start Trivia Blitz',
      tokenRequired: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 text-white pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-slate-800 bg-slate-950/60 backdrop-blur-md">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-semibold uppercase tracking-wider">
                <Gamepad2 className="w-3.5 h-3.5" />
                QuickCourt Mini-Games Arcade
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-display">
                Play, Score & <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-amber-300">Win Real Rewards</span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
                Test your skills in interactive mini-games! Turn your high scores into free refreshments at our Food Court, booking discounts, and Court Coins.
              </p>
            </div>

            {/* User Game Stats Pill */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-6 shadow-xl backdrop-blur-sm self-stretch md:self-auto">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Court Coins</p>
                  <p className="text-2xl font-black text-white">{rewardData?.wallet?.coins ?? '—'}</p>
                </div>
              </div>

              <div className="h-10 w-[1px] bg-slate-800" />

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Game Tokens</p>
                  <p className="text-2xl font-black text-violet-300">{rewardData?.gameTokensAvailable ?? 1}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {/* Featured Banner: Smash Rally */}
        <div className="relative rounded-3xl overflow-hidden border border-violet-800/40 bg-gradient-to-r from-violet-950/80 via-purple-900/60 to-slate-900 p-6 sm:p-10 shadow-2xl shadow-violet-950/50">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white tracking-wider uppercase animate-pulse">
                  Featured Game
                </span>
                <span className="text-xs text-violet-300 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 30-Second Round
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                Smash Rally: Racket Timing Challenge
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Hit moving shuttlecocks and balls inside the target sweet-spot! Build continuous combos to multiply your score up to 1,000. Verified scores over 400 immediately unlock free food vouchers at the food counter.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Score 400+: Free French Fries / Sandwich</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
                  <Gift className="w-4 h-4 text-emerald-400" />
                  <span>Score 900+: Deluxe Combo Meal Voucher</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Link
                href="/games/smash-rally"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white font-black text-base shadow-xl shadow-violet-600/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                Play Smash Rally Now
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Games Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-amber-400" />
                Arcade Mini-Games
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Play daily or redeem booking tokens for instant rewards
              </p>
            </div>
            <Link
              href="/rewards"
              className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition"
            >
              View Rewards Wallet <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((g) => (
              <div
                key={g.id}
                className={`group relative bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${g.borderGlow}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                      {g.icon}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${g.badgeColor}`}>
                      {g.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white group-hover:text-violet-300 transition-colors">
                      {g.title}
                    </h3>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                      {g.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-6 space-y-4">
                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="text-[11px] font-bold text-slate-300">{g.rewardText}</span>
                  </div>

                  <Link
                    href={g.href}
                    className={`w-full py-3 px-4 rounded-xl font-black text-xs text-center flex items-center justify-center gap-2 text-white bg-gradient-to-r ${g.accent} hover:opacity-95 transition-all shadow-lg group-hover:shadow-violet-600/20`}
                  >
                    {g.actionText}
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How Rewards Work Section */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-black text-white">How Game Rewards Work</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="w-8 h-8 rounded-full bg-violet-600/20 text-violet-400 font-black text-sm flex items-center justify-center mb-3">
                1
              </div>
              <h4 className="text-sm font-bold text-white">Book & Earn Tokens</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every court booking unlocks tokens for Smash Rally and Scratch Cards. Daily Spin and Trivia Blitz can be played free every 24 hours.
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 font-black text-sm flex items-center justify-center mb-3">
                2
              </div>
              <h4 className="text-sm font-bold text-white">Score High with Skill</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mini-games are anti-cheat server-verified. Tap with accuracy and build combos to land inside high-tier reward brackets.
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600/20 text-emerald-400 font-black text-sm flex items-center justify-center mb-3">
                3
              </div>
              <h4 className="text-sm font-bold text-white">Instant QR Voucher</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Won prizes generate QR coupons in your Rewards tab. Show the QR at the Food Court counter to collect your free snacks and drinks!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Certified Anti-Cheat Engine & Secure Instant Crediting</span>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <Link href="/food-court" className="text-orange-400 hover:text-orange-300 transition">
                Explore Food Court →
              </Link>
              <Link href="/rewards" className="text-violet-400 hover:text-violet-300 transition">
                Active Coupons & Wallet →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
