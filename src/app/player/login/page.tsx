'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trophy, Mail, Lock, ArrowRight, AlertCircle, Loader2, Zap, Shield } from 'lucide-react';

export default function PlayerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, portalRole: 'USER' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      router.push('/venues');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[92vh] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-gradient-to-br from-emerald-700 via-teal-700 to-slate-900 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-lg">QuickCourt</span>
        </div>
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>Player Portal</span>
          </div>
          <h1 className="text-4xl font-black leading-tight">Book Your Next Game in Seconds</h1>
          <p className="text-emerald-100 text-sm leading-relaxed">
            Find and reserve badminton courts, cricket turfs, tennis courts and more — all in one place with real-time slot availability.
          </p>
          <div className="space-y-3 text-sm text-emerald-200">
            {['Real-time slot availability', 'Instant booking confirmation', 'Easy cancellation & rescheduling', 'Verified, top-rated venues'].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-emerald-300/60">© 2026 QuickCourt · Player Portal</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-slate-50">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 lg:hidden">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Player Sign In</h2>
            <p className="text-xs text-slate-500">Sign in to browse venues and book court slots.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-1.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign In as Player</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 space-y-2">
            <div>Don't have an account?{' '}<Link href="/player/signup" className="text-emerald-600 font-bold hover:underline">Create Player Account</Link></div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-slate-200" /><span className="text-slate-400">other portals</span><div className="flex-1 h-px bg-slate-200" />
            </div>
            <div className="flex justify-center gap-3">
              <Link href="/owner/login" className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition">Facility Owner</Link>
              <Link href="/admin/login" className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition flex items-center gap-1"><Shield className="w-3 h-3" />Admin</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
