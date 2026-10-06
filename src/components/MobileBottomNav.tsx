'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Zap, Gift, Calendar } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'Courts',
      href: '/venues',
      icon: Compass,
      isActive: pathname.startsWith('/venues'),
    },
    {
      label: 'Karting',
      href: '/karting',
      icon: Zap,
      isActive: pathname.startsWith('/karting'),
    },
    {
      label: 'Rewards',
      href: '/rewards',
      icon: Gift,
      isActive: pathname.startsWith('/rewards') || pathname.startsWith('/games') || pathname.startsWith('/food-court'),
    },
    {
      label: 'Bookings',
      href: '/my-bookings',
      icon: Calendar,
      isActive: pathname.startsWith('/my-bookings'),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-1 pb-[max(env(safe-area-inset-bottom,0.5rem),0.5rem)] transition-all"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 min-w-[56px] ${
                active
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`w-9 h-7 rounded-full flex items-center justify-center transition-all ${
                  active
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 scale-105'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] tracking-tight leading-none mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
