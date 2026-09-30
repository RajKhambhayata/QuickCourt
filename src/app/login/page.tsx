'use client';

import Link from 'next/link';
import { Trophy, Building2, Shield, ArrowRight } from 'lucide-react';

const portals = [
  {
    href: '/player/login',
    title: 'Player Portal',
    subtitle: 'Book courts & play sports',
    icon: Trophy,
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
  },
  {
    href: '/owner/login',
    title: 'Facility Owner Portal',
    subtitle: 'Manage your turfs & courts',
    icon: Building2,
    gradient: 'from-teal-500 to-cyan-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-700',
  },
  {
    href: '/admin/login',
    title: 'Admin Control Center',
    subtitle: 'Platform administration',
    icon: Shield,
    gradient: 'from-purple-600 to-indigo-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
  },
];

export default function LoginChoosePage() {
  return (
    <div className="min-h-[92vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 px-4 py-12">
      <div className="max-w-lg w-full space-y-8 text-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-sm mb-2">
            <Trophy className="w-4 h-4 text-emerald-500" />
            QuickCourt
          </div>
          <h1 className="text-3xl font-black text-slate-900">Choose Your Portal</h1>
          <p className="text-sm text-slate-500">Select the right login portal for your account type.</p>
        </div>

        <div className="space-y-3">
          {portals.map(({ href, title, subtitle, icon: Icon, gradient, bg, border, text }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-4 p-4 ${bg} border ${border} rounded-2xl hover:shadow-md transition group text-left`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${gradient} flex items-center justify-center shadow-md shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className={`font-black text-slate-900 text-sm`}>{title}</div>
                <div className="text-xs text-slate-500">{subtitle}</div>
              </div>
              <ArrowRight className={`w-4 h-4 ${text} group-hover:translate-x-1 transition`} />
            </Link>
          ))}
        </div>

        <p className="text-xs text-slate-400">
          New player?{' '}
          <Link href="/player/signup" className="text-emerald-600 font-bold hover:underline">
            Create a free player account
          </Link>
          {' · '}
          <Link href="/owner/signup" className="text-teal-600 font-semibold hover:underline">
            Register your facility
          </Link>
        </p>
      </div>
    </div>
  );
}
