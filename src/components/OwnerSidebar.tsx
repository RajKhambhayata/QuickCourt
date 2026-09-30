'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Trophy,
  CalendarDays,
  Clock,
  UserCheck,
  ArrowLeft,
} from 'lucide-react';

export default function OwnerSidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/owner/dashboard', label: 'Dashboard & KPIs', icon: LayoutDashboard },
    { href: '/owner/facility', label: 'Facilities & Turfs', icon: Building2 },
    { href: '/owner/courts', label: 'Courts & Pricing', icon: Trophy },
    { href: '/owner/slots', label: 'Slot Maintenance', icon: Clock },
    { href: '/owner/bookings', label: 'Bookings Overview', icon: CalendarDays },
    { href: '/profile', label: 'Owner Profile', icon: UserCheck },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-300 p-4 shrink-0 rounded-2xl flex flex-col justify-between">
      <div className="space-y-6">
        <div className="px-3 py-2 border-b border-slate-800">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Owner Portal</div>
          <h2 className="text-lg font-black text-white">Facility Hub</h2>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-6 border-t border-slate-800">
        <Link
          href="/venues"
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Player View</span>
        </Link>
      </div>
    </aside>
  );
}
