'use client';

import Link from 'next/link';
import { Trophy, Building2, Shield, ArrowRight, UserPlus } from 'lucide-react';

const portals = [
  {
    href: '/player/signup',
    title: 'Player Account',
    subtitle: 'Sign up to discover venues, reserve courts & play',
    icon: Trophy,
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badge: 'Free Account',
  },
  {
    href: '/owner/signup',
    title: 'Facility Owner Application',
    subtitle: 'Register your arena or turf, manage courts & accept bookings',
    icon: Building2,
    gradient: 'from-teal-500 to-cyan-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-700',
    badge: 'Requires Admin Approval',
  },
  {
    href: '/admin/signup',
    title: 'Platform Administrator',
    subtitle: 'Provision administrative account with security master key',
    icon: Shield,
    gradient: 'from-purple-600 to-indigo-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    badge: 'Security Key Protected',
  },
];

export default function SignupChoosePage() {
  return (
    <div className="min-h-[92vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 px-4 py-12">
      <div className="max-w-lg w-full space-y-8 text-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-sm mb-2">
            <UserPlus className="w-4 h-4 text-emerald-500" />
            QuickCourt Registration
          </div>
          <h1 className="text-3xl font-black text-slate-900">Create Your Account</h1>
          <p className="text-sm text-slate-500">Choose the type of account you want to create on QuickCourt.</p>
        </div>

        <div className="space-y-3">
          {portals.map(({ href, title, subtitle, icon: Icon, gradient, bg, border, text, badge }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-4 p-4 ${bg} border ${border} rounded-2xl hover:shadow-md transition group text-left`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${gradient} flex items-center justify-center shadow-md shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-black text-slate-900 text-sm">{title}</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-600">
                    {badge}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>
              </div>
              <ArrowRight className={`w-4 h-4 ${text} group-hover:translate-x-1 transition`} />
            </Link>
          ))}
        </div>

        <p className="text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-600 font-bold hover:underline">
            Choose your login portal
          </Link>
          {' · '}
          <Link href="/player/login" className="text-slate-600 hover:text-slate-900 font-semibold">
            Player Login
          </Link>
          {' · '}
          <Link href="/owner/login" className="text-slate-600 hover:text-slate-900 font-semibold">
            Owner Login
          </Link>
        </p>
      </div>
    </div>
  );
}
