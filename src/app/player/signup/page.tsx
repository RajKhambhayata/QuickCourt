'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trophy, Mail, Lock, User, Phone, ArrowRight, AlertCircle, Loader2, Zap, CheckCircle2 } from 'lucide-react';

export default function PlayerSignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
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
        body: JSON.stringify({ name, email, password, phone, role: 'USER' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[92vh] flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-10 text-center space-y-5 animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Account Created Successfully!</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your player account for <strong className="text-slate-800">{email}</strong> is ready. Please log in with your email and password to start booking courts.
          </p>
          <Link href="/player/login" className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition shadow-lg shadow-emerald-600/20">
            <span>Proceed to Player Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[92vh] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-gradient-to-br from-emerald-700 via-teal-700 to-slate-900 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-lg">QuickCourt</span>
        </div>
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>Free Player Account</span>
          </div>
          <h1 className="text-4xl font-black leading-tight">Join Thousands of Sports Players</h1>
          <p className="text-emerald-100 text-sm">Book courts in seconds, find your local community, and play more.</p>
        </div>
        <p className="text-xs text-emerald-300/60">© 2026 QuickCourt · Player Portal</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-slate-50">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900">Create Player Account</h2>
            <p className="text-xs text-slate-500">Free account — no credit card required.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name', value: name, setter: setName, type: 'text', placeholder: 'Your full name', Icon: User },
              { label: 'Email Address', value: email, setter: setEmail, type: 'email', placeholder: 'you@example.com', Icon: Mail },
              { label: 'Phone (International Format)', value: phone, setter: setPhone, type: 'tel', placeholder: '+919876543210', Icon: Phone },
              { label: 'Password (min 8 chars)', value: password, setter: setPassword, type: 'password', placeholder: '••••••••', Icon: Lock },
            ].map(({ label, value, setter, type, placeholder, Icon }) => (
              <div key={label}>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={type}
                    required
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-1.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Create Free Account</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link href="/player/login" className="text-emerald-600 font-bold hover:underline">Sign In</Link>
            {' · '}
            <Link href="/owner/signup" className="text-slate-600 font-semibold hover:underline">Register as Facility Owner</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
