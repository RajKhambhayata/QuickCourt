'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, Mail, Lock, User, Phone, MapPin, ArrowRight, AlertCircle, Loader2, CheckCircle2, Clock } from 'lucide-react';

const SPORTS_OPTIONS = ['Badminton', 'Box Cricket', 'Tennis', 'Football', 'Basketball', 'Pickleball', 'Volleyball'];
const CITIES = ['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur'];

export default function OwnerSignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedSports, setSelectedSports] = useState<string[]>(['Badminton']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const toggleSport = (sport: string) => {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSports.length === 0) {
      setError('Please select at least one sport you offer.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          role: 'OWNER',
          sports: selectedSports,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Application failed');

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[92vh] flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Application Submitted!</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your Facility Owner application has been received. Our admin team will review your application and approve your account — usually within 24 hours.
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left space-y-2 text-xs text-amber-800">
            <p className="font-bold text-amber-900">What happens next?</p>
            <div className="space-y-1.5">
              {['Admin reviews your application', 'Account gets approved & activated', 'You log in and add your facility details & courts', 'Players start booking your courts'].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 font-black text-[10px] flex items-center justify-center shrink-0">{i + 1}</div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
          <Link href="/owner/login" className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition">
            Go to Owner Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[92vh] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-gradient-to-br from-teal-800 via-emerald-800 to-slate-900 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-lg">QuickCourt</span>
        </div>
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Facility Owner Application</span>
          </div>
          <h1 className="text-4xl font-black leading-tight">List Your Arena. Fill Every Slot.</h1>
          <p className="text-teal-100 text-sm">Join sports facility owners who use QuickCourt to automate bookings, manage courts, and maximize revenue.</p>
          <div className="bg-white/10 rounded-2xl p-4 text-sm space-y-2">
            <p className="font-bold text-white text-xs uppercase tracking-wider">Approval Process</p>
            {['Submit your application', 'Admin reviews (24 hrs)', 'Account activated', 'Start adding courts'].map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-teal-200 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-teal-300/60">© 2026 QuickCourt · Owner Portal</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 bg-slate-50 overflow-y-auto">
        <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900">Owner Application</h2>
            <p className="text-xs text-slate-500">Fill in your details. Admin will review and approve your account.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Owner Name', value: name, setter: setName, type: 'text', placeholder: 'Your full name', Icon: User, required: true },
              { label: 'Business Email', value: email, setter: setEmail, type: 'email', placeholder: 'owner@yourarena.com', Icon: Mail, required: true },
              { label: 'Contact Phone (Optional)', value: phone, setter: setPhone, type: 'tel', placeholder: '+919876543210', Icon: Phone, required: false },
              { label: 'Password (min 8 chars)', value: password, setter: setPassword, type: 'password', placeholder: '••••••••', Icon: Lock, required: true },
            ].map(({ label, value, setter, type, placeholder, Icon, required }) => (
              <div key={label}>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={type}
                    required={required}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Sports You Offer</label>
              <div className="flex flex-wrap gap-2">
                {SPORTS_OPTIONS.map((sport) => (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => toggleSport(sport)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                      selectedSports.includes(sport)
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-teal-400'
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-xs transition shadow-lg shadow-teal-600/25 flex items-center justify-center gap-1.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Submit Owner Application</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link href="/owner/login" className="text-teal-600 font-bold hover:underline">Sign In as Owner</Link>
            {' · '}
            <Link href="/player/signup" className="text-slate-600 font-semibold hover:underline">Player Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
