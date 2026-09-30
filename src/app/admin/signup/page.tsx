'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, User, Phone, KeyRound, ArrowRight, AlertCircle, Loader2, Building2, Trophy } from 'lucide-react';

export default function AdminSignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [adminSecretKey, setAdminSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          role: 'ADMIN',
          adminSecretKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create admin account');

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[92vh] flex items-center justify-center bg-slate-950 px-4">
        <div className="max-w-md w-full bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-10 text-center space-y-5 animate-in fade-in">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto shadow-lg shadow-purple-600/10">
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-2xl font-black text-white">Admin Account Created!</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your administrative credentials for <strong className="text-purple-300">{email}</strong> have been configured. Please log in to access the control center.
          </p>
          <Link href="/admin/login" className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 bg-purple-700 hover:bg-purple-600 text-white font-black rounded-xl text-xs transition shadow-lg shadow-purple-700/30">
            <span>Proceed to Admin Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

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
            <span>Admin Provisioning Portal</span>
          </div>
          <h1 className="text-4xl font-black leading-tight text-white">Register Administrative Account</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Create an administrator account with platform-level moderation, facility approval authorities, and user management capabilities.
          </p>
          <div className="p-4 rounded-2xl bg-purple-900/30 border border-purple-700/40 text-xs text-purple-200 space-y-2">
            <div className="font-bold flex items-center gap-2 text-purple-300">
              <KeyRound className="w-4 h-4 text-purple-400" />
              <span>Security Key Protected</span>
            </div>
            <p className="text-purple-300/80">
              Administrative registration requires the secret master key provided by your system administrator.
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-600">© 2026 QuickCourt · Administrative Access Only</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-slate-950">
        <div className="max-w-md w-full space-y-6 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-600/10 mx-auto">
              <Shield className="w-7 h-7 text-purple-400" />
            </div>
            <h2 className="text-2xl font-black text-white">Create Admin Account</h2>
            <p className="text-xs text-slate-500">Enter your credentials and admin secret authorization key.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-400 text-xs rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Admin Name"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Admin Email</label>
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Phone Number (with country code)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Admin Security Key</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={adminSecretKey}
                  onChange={(e) => setAdminSecretKey(e.target.value)}
                  placeholder="Master Admin Key"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white font-extrabold text-xs transition shadow-lg shadow-purple-700/30 flex items-center justify-center gap-1.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Shield className="w-4 h-4" /><span>Create Admin Account</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="text-center pt-2 space-y-3">
            <p className="text-xs text-slate-500">
              Already have an admin account?{' '}
              <Link href="/admin/login" className="text-purple-400 hover:text-purple-300 font-bold underline">
                Log in here
              </Link>
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <Link href="/player/login" className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600 font-semibold transition flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Player Portal
              </Link>
              <Link href="/owner/signup" className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600 font-semibold transition flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Owner Signup
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
