'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserSession } from '@/lib/types';
import { SPORTS_LIST, CITIES_LIST } from '@/lib/constants';
import QuickSearchModal from './QuickSearchModal';
import { MapPin, Search, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [signupDropdownOpen, setSignupDropdownOpen] = useState(false);

  // Phase 2B & 2C: Sports menu, City sync, Quick Search modal
  const [sportsDropdownOpen, setSportsDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Bangalore');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0);
    const saved = localStorage.getItem('quickcourt_city');
    if (saved && CITIES_LIST.includes(saved)) {
      setSelectedCity(saved);
    }

    const handleCityChange = (e: any) => {
      if (e.detail && CITIES_LIST.includes(e.detail)) {
        setSelectedCity(e.detail);
      }
    };
    window.addEventListener('quickcourt_city_changed', handleCityChange);
    return () => window.removeEventListener('quickcourt_city_changed', handleCityChange);
  }, []);

  const handleSelectCity = (newCity: string) => {
    setSelectedCity(newCity);
    setCityDropdownOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('quickcourt_city', newCity);
      window.dispatchEvent(new CustomEvent('quickcourt_city_changed', { detail: newCity }));
    }
    router.push(`/venues?city=${encodeURIComponent(newCity)}`);
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => setUser(data.user))
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setUserDropdownOpen(false);
    router.push('/');
    router.refresh();
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <header className="sticky top-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-container-high/60 shadow-[0_1px_8px_rgba(11,28,48,0.06)] transition-all">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-inverse-surface flex items-center justify-center text-primary-container shadow-[0_2px_8px_rgba(0,230,118,0.25)] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">bolt</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold tracking-tight">
                  QuickCourt
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-md text-[11px] font-bold uppercase tracking-wider">
                  LIVE
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            <Link
              href="/venues"
              className={`px-3.5 py-2 rounded-lg font-label-lg text-label-lg transition-colors ${
                isActive('/venues') && !pathname.includes('?')
                  ? 'bg-surface-container text-on-surface font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              Find Courts
            </Link>

            {/* Sports Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setSportsDropdownOpen(true)}
              onMouseLeave={() => setSportsDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setSportsDropdownOpen(!sportsDropdownOpen)}
                className={`px-3.5 py-2 rounded-lg font-label-lg text-label-lg transition-colors flex items-center gap-1 ${
                  pathname.includes('sport=')
                    ? 'bg-surface-container text-on-surface font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span>Sports</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {sportsDropdownOpen && (
                <div className="absolute left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    All Disciplines
                  </div>
                  {SPORTS_LIST.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/venues?sport=${encodeURIComponent(s.slug)}`}
                      onClick={() => setSportsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition"
                    >
                      <span className="text-sm">{s.icon}</span>
                      <span>{s.name}</span>
                    </Link>
                  ))}
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <Link
                      href="/venues"
                      onClick={() => setSportsDropdownOpen(false)}
                      className="block px-3 py-1.5 text-[11px] font-bold text-emerald-600 hover:bg-emerald-50"
                    >
                      View All Venues →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/rewards"
              className={`px-3.5 py-2 rounded-lg font-label-lg text-label-lg transition-colors ${
                isActive('/rewards')
                  ? 'bg-surface-container text-on-surface font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              Rewards
            </Link>

            <Link
              href="/karting"
              className={`px-3.5 py-2 rounded-lg font-label-lg text-label-lg transition-colors ${
                isActive('/karting')
                  ? 'bg-surface-container text-on-surface font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              Go-Karting
            </Link>

            <Link
              href="/games"
              className={`px-3.5 py-2 rounded-lg font-label-lg text-label-lg transition-colors ${
                isActive('/games')
                  ? 'bg-surface-container text-on-surface font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              Games
            </Link>

            <Link
              href="/food-court"
              className={`px-3.5 py-2 rounded-lg font-label-lg text-label-lg transition-colors ${
                isActive('/food-court')
                  ? 'bg-surface-container text-on-surface font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              Cafeteria
            </Link>

            {user?.role === 'USER' && (
              <Link
                href="/my-bookings"
                className={`px-3.5 py-2 rounded-lg font-label-lg text-label-lg transition-colors ${
                  isActive('/my-bookings')
                    ? 'bg-surface-container text-on-surface font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                My Bookings
              </Link>
            )}

            {user?.role === 'OWNER' && (
              <Link
                href="/owner/dashboard"
                className={`px-3.5 py-2 rounded-lg font-label-lg text-label-lg transition-colors ${
                  isActive('/owner')
                    ? 'bg-surface-container text-on-surface font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                Owner Portal
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin/dashboard"
                className={`px-3.5 py-2 rounded-lg font-label-lg text-label-lg transition-colors ${
                  isActive('/admin')
                    ? 'bg-surface-container text-on-surface font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Right Action Group */}
          <div className="flex items-center gap-3">
            {/* Location selector dropdown */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  {selectedCity}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {cityDropdownOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Select City
                  </div>
                  {CITIES_LIST.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleSelectCity(city)}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold transition ${
                        selectedCity === city
                          ? 'text-emerald-700 bg-emerald-50 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick search shortcut modal trigger */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span className="font-label-md text-label-md">Quick Search</span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant font-data-mono text-body-sm shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
                {isMac ? '⌘K' : 'Ctrl+K'}
              </kbd>
            </button>

            {/* List Your Facility (Owner CTA) */}
            <Link
              href="/owner/signup"
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-secondary-container text-on-secondary font-label-lg text-label-lg hover:opacity-95 transition-opacity shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add_business</span>
              <span>List Your Facility</span>
            </Link>

            {/* Notifications Button */}
            <button
              aria-label="Notifications"
              type="button"
              className="relative w-10 h-10 rounded-lg flex items-center justify-center bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-secondary-container ring-2 ring-surface-container-lowest" />
            </button>

            {/* User Profile or Login/Signup */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:bg-surface-container transition cursor-pointer"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-primary-container"
                  />
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px] hidden sm:block">
                    expand_more
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container-high py-1 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-surface-container-high">
                      <p className="font-label-md text-[10px] text-tertiary uppercase font-bold tracking-wider">Signed in as</p>
                      <p className="font-label-lg text-sm font-bold text-on-surface truncate">{user.name}</p>
                      <p className="font-body-sm text-xs text-tertiary truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary-container text-on-primary-container uppercase">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px] text-tertiary">person</span>
                      <span>Profile Settings</span>
                    </Link>

                    {user.role === 'USER' && (
                      <Link
                        href="/my-bookings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px] text-tertiary">calendar_month</span>
                        <span>My Bookings</span>
                      </Link>
                    )}

                    {user.role === 'OWNER' && (
                      <Link
                        href="/owner/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px] text-primary">domain</span>
                        <span>Facility Management</span>
                      </Link>
                    )}

                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px] text-secondary">admin_panel_settings</span>
                        <span>Admin Control Center</span>
                      </Link>
                    )}

                    <div className="border-t border-surface-container-high my-1" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-error hover:bg-error-container/20 text-left transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Login Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginDropdownOpen(!loginDropdownOpen);
                      setSignupDropdownOpen(false);
                    }}
                    className="flex items-center gap-1 px-3 py-2 font-label-lg text-label-lg font-semibold text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                  >
                    <span>Log In</span>
                    <span className="material-symbols-outlined text-[16px]">expand_more</span>
                  </button>

                  {loginDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container-high py-2 z-50">
                      <p className="px-4 py-1 text-[10px] font-bold text-tertiary uppercase tracking-wider">Select Portal</p>
                      <Link
                        href="/player/login"
                        onClick={() => setLoginDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px] text-primary">sports_tennis</span>
                        <div>
                          <div>Player Login</div>
                          <div className="text-[10px] text-tertiary font-normal">Book &amp; play</div>
                        </div>
                      </Link>
                      <Link
                        href="/owner/login"
                        onClick={() => setLoginDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px] text-secondary">domain</span>
                        <div>
                          <div>Facility Owner</div>
                          <div className="text-[10px] text-tertiary font-normal">Manage turfs</div>
                        </div>
                      </Link>
                      <div className="border-t border-surface-container-high my-1" />
                      <Link
                        href="/admin/login"
                        onClick={() => setLoginDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px] text-outline">admin_panel_settings</span>
                        <div>
                          <div>Super Admin</div>
                          <div className="text-[10px] text-tertiary font-normal">Platform control</div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Sign Up Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setSignupDropdownOpen(!signupDropdownOpen);
                      setLoginDropdownOpen(false);
                    }}
                    className="px-4 py-2 text-xs font-extrabold text-on-primary-container bg-primary-container hover:bg-inverse-primary rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Sign Up</span>
                    <span className="material-symbols-outlined text-[16px]">expand_more</span>
                  </button>

                  {signupDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container-high py-2 z-50">
                      <p className="px-4 py-1 text-[10px] font-bold text-tertiary uppercase tracking-wider">Create Account</p>
                      <Link
                        href="/player/signup"
                        onClick={() => setSignupDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px] text-primary">sports_tennis</span>
                        <div>
                          <div>Player Account</div>
                          <div className="text-[10px] text-tertiary font-normal">Free registration</div>
                        </div>
                      </Link>
                      <Link
                        href="/owner/signup"
                        onClick={() => setSignupDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px] text-secondary">domain</span>
                        <div>
                          <div>Facility Owner</div>
                          <div className="text-[10px] text-tertiary font-normal">List arena &amp; turfs</div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile menu hamburger */}
            <div className="flex xl:hidden items-center ml-1">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[24px]">
                  {mobileMenuOpen ? 'close' : 'menu'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-surface-container-high bg-surface-container-lowest px-4 py-4 space-y-1 animate-in slide-in-from-top-2">
          <Link
            href="/venues"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-label-lg text-label-lg font-semibold text-on-surface hover:bg-surface-container"
          >
            Find Courts
          </Link>

          {/* Mobile All Sports List */}
          <div className="py-2 border-y border-surface-container-high/60 my-1">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Browse Sports
            </div>
            <div className="grid grid-cols-2 gap-1 px-1 mt-1">
              {SPORTS_LIST.map((s) => (
                <Link
                  key={s.slug}
                  href={`/venues?sport=${encodeURIComponent(s.slug)}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-surface-container flex items-center gap-2"
                >
                  <span>{s.icon}</span>
                  <span className="truncate">{s.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <Link
            href="/rewards"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-label-lg text-label-lg font-semibold text-on-surface hover:bg-surface-container"
          >
            Rewards
          </Link>
          <Link
            href="/karting"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-label-lg text-label-lg font-semibold text-on-surface hover:bg-surface-container"
          >
            Go-Karting
          </Link>
          <Link
            href="/games"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-label-lg text-label-lg font-semibold text-on-surface hover:bg-surface-container"
          >
            Games
          </Link>
          <Link
            href="/food-court"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-label-lg text-label-lg font-semibold text-on-surface hover:bg-surface-container"
          >
            Cafeteria
          </Link>

          {user && (
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg font-label-lg text-label-lg font-semibold text-on-surface hover:bg-surface-container"
            >
              Profile Settings
            </Link>
          )}

          {!user && (
            <div className="pt-2 flex gap-2">
              <Link
                href="/player/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-1/2 text-center py-2 px-3 border border-surface-container-high rounded-lg text-xs font-bold text-on-surface"
              >
                Log In
              </Link>
              <Link
                href="/player/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-1/2 text-center py-2 px-3 bg-primary-container text-on-primary-container rounded-lg text-xs font-bold"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Quick Search Modal (Ctrl+K / ⌘K) */}
      <QuickSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
