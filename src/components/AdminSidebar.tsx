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
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [pendingOwners, setPendingOwners] = useState(0);

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
    <aside className="w-full md:w-64 bg-slate-900 text-slate-300 p-4 shrink-0 rounded-2xl flex flex-col justify-between">
      <div className="space-y-6">
        <div className="px-3 py-2 border-b border-slate-800">
          <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Super Admin</div>
          <h2 className="text-lg font-black text-white">Platform Control</h2>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
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
