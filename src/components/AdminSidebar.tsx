'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldAlert,
  UserCheck,
  UserCog,
  Menu,
  X,
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [pendingOwners, setPendingOwners] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/admin/owners')
      .then((r) => r.json())
      .then((d) => { if (d.pending) setPendingOwners(d.pending.length); })
      .catch(() => {});
  }, []);

  const links = [
    { href: '/admin/dashboard', label: 'Platform Analytics', icon: LayoutDashboard },
    { href: '/admin/owners', label: 'Owner Approvals', icon: UserCog, badge: pendingOwners },
    { href: '/admin/facilities', label: 'Facility Approvals', icon: Building2 },
    { href: '/admin/users', label: 'User Directory', icon: Users },
    { href: '/admin/reports', label: 'Reports & Moderation', icon: ShieldAlert },
    { href: '/profile', label: 'Admin Profile', icon: UserCheck },
  ];

  return (
    <aside className="w-full md:w-60 lg:w-64 bg-slate-900 text-slate-300 p-4 shrink-0 rounded-2xl flex flex-col justify-between border border-slate-800 shadow-xl transition-all">
      <div className="space-y-4">
        {/* Header with Mobile Toggle */}
        <div className="px-2 py-1 flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Super Admin</div>
            <h2 className="text-base sm:text-lg font-black text-white">Platform Control</h2>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
            aria-label="Toggle admin navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Horizontal Navigation Pills */}
        <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
                {link.badge != null && link.badge > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Full Navigation (Desktop or Expanded Mobile) */}
        <nav className={`space-y-1 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-400'}`} />
                <span className="flex-1">{link.label}</span>
                {link.badge != null && link.badge > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
