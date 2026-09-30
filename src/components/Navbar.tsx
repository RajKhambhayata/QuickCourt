'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Calendar,
  Building2,
  Shield,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Compass,
  PlusCircle,
  Trophy,
  ChevronDown,
  Coins,
  Zap,
  ShoppingBag,
  Gamepad2,
} from 'lucide-react';
import { UserSession } from '@/lib/types';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [signupDropdownOpen, setSignupDropdownOpen] = useState(false);

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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1 font-display">
                Quick<span className="text-gradient">Court</span>
              </span>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest -mt-1">
                Sports Booking
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/venues"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                isActive('/venues')
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              Explore Venues
            </Link>

            {user?.role === 'USER' && (
              <>
                <Link
                  href="/my-bookings"
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                    isActive('/my-bookings')
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  My Bookings
                </Link>
                <Link
                  href="/rewards"
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                    isActive('/rewards')
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Coins className="w-4 h-4 text-amber-500" />
                  Rewards
                </Link>
                <Link
                  href="/karting"
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                    isActive('/karting')
                      ? 'bg-rose-50 text-rose-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Zap className="w-4 h-4 text-rose-500" />
                  Karting
                </Link>
                <Link
                  href="/games"
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                    isActive('/games')
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Gamepad2 className="w-4 h-4 text-violet-500" />
                  Games
                </Link>
                <Link
                  href="/food-court"
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                    isActive('/food-court')
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-orange-500" />
                  Food Court
                </Link>
              </>
            )}

            {user?.role === 'OWNER' && (
              <Link
                href="/owner/dashboard"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                  isActive('/owner')
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-4 h-4 text-emerald-600" />
                Owner Portal
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin/dashboard"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                  isActive('/admin')
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-600" />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Right Action / Profile */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition border border-slate-200"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-emerald-500"
                  />
                  <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate pr-2">
                    {user.name}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 uppercase">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      Profile Settings
                    </Link>

                    {user.role === 'USER' && (
                      <Link
                        href="/my-bookings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Calendar className="w-4 h-4 text-slate-400" />
                        My Bookings
                      </Link>
                    )}

                    {user.role === 'OWNER' && (
                      <Link
                        href="/owner/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Building2 className="w-4 h-4 text-emerald-500" />
                        Facility Management
                      </Link>
                    )}

                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50"
                      >
                        <Shield className="w-4 h-4 text-purple-500" />
                        Admin Control Center
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Portal Login Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition"
                  >
                    Log In <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {loginDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                      <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Your Portal</p>
                      <Link
                        href="/player/login"
                        onClick={() => setLoginDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Trophy className="w-4 h-4 text-emerald-500" />
                        <div>
                          <div>Player Login</div>
                          <div className="text-[10px] text-slate-400 font-normal">Book courts & play</div>
                        </div>
                      </Link>
                      <Link
                        href="/owner/login"
                        onClick={() => setLoginDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700"
                      >
                        <Building2 className="w-4 h-4 text-teal-500" />
                        <div>
                          <div>Facility Owner</div>
                          <div className="text-[10px] text-slate-400 font-normal">Manage turfs & courts</div>
                        </div>
                      </Link>
                      <div className="border-t border-slate-100 my-1" />
                      <Link
                        href="/admin/login"
                        onClick={() => setLoginDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                      >
                        <Shield className="w-4 h-4 text-purple-500" />
                        <div>
                          <div>Super Admin</div>
                          <div className="text-[10px] text-slate-400 font-normal">Platform control</div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
                {/* Portal Sign Up Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setSignupDropdownOpen(!signupDropdownOpen);
                      setLoginDropdownOpen(false);
                    }}
                    className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-lg shadow-lg shadow-emerald-500/25 transition flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Sign Up</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                  </button>
                  {signupDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                      <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Create An Account</p>
                      <Link
                        href="/player/signup"
                        onClick={() => setSignupDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Trophy className="w-4 h-4 text-emerald-500" />
                        <div>
                          <div>Player Account</div>
                          <div className="text-[10px] text-slate-400 font-normal">Free player registration</div>
                        </div>
                      </Link>
                      <Link
                        href="/owner/signup"
                        onClick={() => setSignupDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700"
                      >
                        <Building2 className="w-4 h-4 text-teal-500" />
                        <div>
                          <div>Facility Owner</div>
                          <div className="text-[10px] text-slate-400 font-normal">Apply to list arena & turfs</div>
                        </div>
                      </Link>
                      <div className="border-t border-slate-100 my-1" />
                      <Link
                        href="/admin/signup"
                        onClick={() => setSignupDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                      >
                        <Shield className="w-4 h-4 text-purple-500" />
                        <div>
                          <div>Administrator</div>
                          <div className="text-[10px] text-slate-400 font-normal">Security key registration</div>
                        </div>
                      </Link>
                      <div className="border-t border-slate-100 my-1" />
                      <Link
                        href="/signup"
                        onClick={() => setSignupDropdownOpen(false)}
                        className="block px-4 py-1.5 text-center text-xs font-bold text-emerald-600 hover:underline"
                      >
                        View Portal Chooser →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-2">
          <Link
            href="/venues"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Explore Venues
          </Link>
          {user?.role === 'USER' && (
            <>
              <Link
                href="/my-bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                My Bookings
              </Link>
              <Link
                href="/rewards"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Rewards
              </Link>
              <Link
                href="/karting"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Karting
              </Link>
              <Link
                href="/games"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Games
              </Link>
              <Link
                href="/food-court"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Food Court
              </Link>
            </>
          )}
          {user?.role === 'OWNER' && (
            <Link
              href="/owner/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Owner Portal
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-purple-700 hover:bg-purple-50"
            >
              Admin Panel
            </Link>
          )}
          {user ? (
            <>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Profile Settings
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-1/2 text-center py-2 px-3 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-1/2 text-center py-2 px-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-sm font-semibold"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
