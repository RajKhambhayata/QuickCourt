'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, ArrowRight, AlertCircle, Loader2, Building2, Trophy } from 'lucide-react';

export default function AdminLoginPage() {
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
        body: JSON.stringify({ email, password, portalRole: 'ADMIN' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      router.push('/admin/dashboard');
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
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/40 border border-purple-500/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-300" />
          </div>
          <span className="font-black text-lg text-white">QuickCourt</span>
        </div>
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>Super Admin Control Center</span>
          </div>
          <h1 className="text-4xl font-black leading-tight text-white">Platform Administration & Moderation</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Manage owner applications, approve facilities, moderate user reports, and oversee the entire QuickCourt platform from a single control center.
          </p>
          <div className="space-y-3 text-sm text-purple-200">
            {['Approve / reject owner applications', 'Publish or reject venue listings', 'Manage & ban platform users', 'View platform-wide analytics'].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-600">© 2026 QuickCourt · Admin Only</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-slate-950">
        <div className="max-w-md w-full space-y-8 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-600/10 mx-auto">
              <Shield className="w-7 h-7 text-purple-400" />
            </div>
            <h2 className="text-2xl font-black text-white">Admin Control Center</h2>
            <p className="text-xs text-slate-500">Restricted access. Admin credentials only.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-400 text-xs rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@quickcourt.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 placeholder:text-slate-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Admin Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 placeholder:text-slate-600"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white font-extrabold text-xs transition shadow-lg shadow-purple-700/30 flex items-center justify-center gap-1.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Shield className="w-4 h-4" /><span>Access Admin Panel</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="text-center space-y-2.5">
            <p className="text-xs text-slate-500">
              Need a new admin account?{' '}
              <Link href="/admin/signup" className="text-purple-400 hover:text-purple-300 font-bold underline">
                Register Admin
              </Link>
            </p>
            <p className="text-xs text-slate-600">Not an admin? Use the correct portal:</p>
            <div className="flex justify-center gap-3">
              <Link href="/player/login" className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600 font-semibold transition flex items-center gap-1"><Trophy className="w-3 h-3" />Player</Link>
              <Link href="/owner/login" className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600 font-semibold transition flex items-center gap-1"><Building2 className="w-3 h-3" />Owner</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
