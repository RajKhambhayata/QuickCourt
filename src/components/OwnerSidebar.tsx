'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';

export default function OwnerSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: '/owner/dashboard', label: 'Overview Matrix', icon: 'speed' },
    { href: '/owner/slots', label: 'Slot Schedules', icon: 'calendar_view_week' },
    { href: '/owner/courts', label: 'Court Inventory', icon: 'stadium' },
    { href: '/owner/facility', label: 'Facility Profile', icon: 'domain' },
    { href: '/owner/bookings', label: 'Bookings & Logs', icon: 'payments' },
    { href: '/profile', label: 'Account Settings', icon: 'manage_accounts' },
  ];

  return (
    <aside className="w-full md:w-60 lg:w-72 bg-inverse-surface text-inverse-on-surface p-4 shrink-0 rounded-2xl flex flex-col justify-between border border-surface-container-high/40 shadow-xl transition-all">
      <div className="space-y-4">
        {/* HQ Logo Header & Mobile Toggle */}
        <div className="px-1 sm:px-3 py-1 flex items-center justify-between border-b border-surface-variant/20 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[18px]">bolt</span>
            </div>
            <span className="font-headline-sm text-headline-sm text-surface font-extrabold">QuickCourt</span>
            <span className="px-2 py-0.5 rounded bg-surface-variant/20 text-primary-fixed font-data-mono text-[11px] font-bold">
              HQ
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg bg-surface-variant/20 text-surface hover:bg-surface-variant/30 transition"
            aria-label="Toggle owner navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Active Facility Card */}
        <div className="px-1">
          <div className="px-3 py-2 rounded-xl bg-surface-variant/10 border border-white/10 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-md text-[10px] text-tertiary-fixed uppercase font-semibold">Active Arena</span>
              <span className="font-label-lg text-sm font-bold text-surface truncate">Smash Pro Arena</span>
            </div>
            <span className="material-symbols-outlined text-tertiary-fixed text-[18px]">unfold_more</span>
          </div>
        </div>

        {/* Horizontal Navigation Pills (Visible on Mobile when collapsed) */}
        <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-variant/15 text-tertiary-fixed hover:text-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Full Navigation (Desktop or Expanded Mobile) */}
        <nav className={`space-y-1 pt-1 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-label-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-extrabold shadow-sm'
                    : 'text-tertiary-fixed hover:bg-surface-variant/15 hover:text-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Switch to Player View Button */}
      <div className={`pt-4 border-t border-surface-variant/20 mt-4 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
        <Link
          href="/venues"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-surface-variant/10 hover:bg-surface-variant/20 text-surface transition-colors font-label-md text-xs font-semibold border border-white/10"
        >
          <span className="material-symbols-outlined text-[18px]">storefront</span>
          <span>Switch to Player View</span>
        </Link>
      </div>
    </aside>
  );
}
