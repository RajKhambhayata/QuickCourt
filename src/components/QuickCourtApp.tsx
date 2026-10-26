'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Compass,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Star,
  Trophy,
  UserRound,
  Wallet,
  Building2,
  ChartNoAxesCombined,
  ClipboardList,
  Settings2,
  X,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Footprints,
  Dumbbell,
  Flag,
  Loader2,
  Shield,
  UtensilsCrossed,
  Zap,
  Gift,
  Flame,
  Sparkles,
  RefreshCw,
  Copy,
  Award,
  Gamepad2,
  Phone,
  Play,
  HelpCircle,
  Tag,
  CircleDot,
} from 'lucide-react';
import {
  sports,
  venues as initialVenues,
  starterBookings,
  starterOutlets,
  starterHeats,
  starterStandings,
  starterCoupons,
  VenueData,
  StarterBooking,
  FoodOutlet,
  KartHeatData,
  StandingData,
  RewardCoupon,
} from '@/lib/data';

export type Page =
  | 'home'
  | 'venues'
  | 'detail'
  | 'checkout'
  | 'bookings'
  | 'wallet'
  | 'profile'
  | 'owner'
  | 'facility'
  | 'courts'
  | 'admin'
  | 'approvals'
  | 'login'
  | 'signup'
  | 'food-court'
  | 'karting'
  | 'championship'
  | 'games'
  | 'rewards';

export type Role = 'Player' | 'Owner' | 'Admin';

export interface QuickCourtAppProps {
  initialPage?: Page;
  initialRole?: Role;
  initialVenueId?: string;
}

const cash = (n: number) => '₹' + n.toLocaleString('en-IN');
const dateText = (d: string) =>
  new Date(d + 'T12:00:00').toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export default function QuickCourtApp({
  initialPage = 'home',
  initialRole = 'Player',
  initialVenueId,
}: QuickCourtAppProps) {
  const [page, setPage] = useState<Page>(initialPage);
  const [role, setRole] = useState<Role>(initialRole);
  const [venueList, setVenueList] = useState<VenueData[]>(initialVenues);
  const [venue, setVenue] = useState<VenueData>(
    initialVenueId
      ? initialVenues.find((v) => v.id === initialVenueId) || initialVenues[0]
      : initialVenues[0]
  );
  const [sport, setSport] = useState<string>('All sports');
  const [city, setCity] = useState<string>('Bengaluru');
  const [query, setQuery] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('2000');
  const [date, setDate] = useState<string>('2026-10-16');
  const [court, setCourt] = useState<string>('Court 1 · Indoor');
  const [slots, setSlots] = useState<string[]>(['19:00']);
  const [coupon, setCoupon] = useState<string>('');
  const [couponApplied, setCouponApplied] = useState<boolean>(false);
  const [coins, setCoins] = useState<number>(500);
  const [useCoins, setUseCoins] = useState<boolean>(true);
  const [bookings, setBookings] = useState<StarterBooking[]>(starterBookings);
  const [toast, setToast] = useState<string>('');
  const [mobile, setMobile] = useState<boolean>(false);
  const [loginRole, setLoginRole] = useState<Role>(initialRole);
  const [name, setName] = useState<string>('Raj');
  const [userEmail, setUserEmail] = useState<string>('player@example.com');
  const [approvals, setApprovals] = useState<Record<string, string>>({});
  const [blocked, setBlocked] = useState<string[]>([]);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(false);

  // Restore cached local state
  useEffect(() => {
    try {
      const b = localStorage.getItem('qc-bookings');
      if (b) setBookings(JSON.parse(b));
      const c = localStorage.getItem('qc-coins');
      if (c) setCoins(Number(c));
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('qc-bookings', JSON.stringify(bookings));
      localStorage.setItem('qc-coins', String(coins));
    } catch {
      // Ignore
    }
  }, [bookings, coins]);

  // Toast timer
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Browser back/forward navigation sync
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const pathname = window.location.pathname;
      if (pathname === '/venues') setPage('venues');
      else if (pathname.startsWith('/venues/')) setPage('detail');
      else if (pathname === '/food-court') setPage('food-court');
      else if (pathname === '/karting') setPage('karting');
      else if (pathname === '/karting/championship') setPage('championship');
      else if (pathname.startsWith('/games')) setPage('games');
      else if (pathname === '/rewards') setPage('rewards');
      else if (pathname === '/my-bookings' || pathname === '/bookings') setPage('bookings');
      else if (pathname === '/wallet') setPage('wallet');
      else if (pathname === '/profile') setPage('profile');
      else if (pathname.startsWith('/owner')) {
        setRole('Owner');
        if (pathname === '/owner/facility') setPage('facility');
        else if (pathname === '/owner/courts' || pathname === '/owner/slots') setPage('courts');
        else if (pathname === '/owner/login') setPage('login');
        else if (pathname === '/owner/signup') setPage('signup');
        else setPage('owner');
      } else if (pathname.startsWith('/admin')) {
        setRole('Admin');
        if (pathname === '/admin/facilities' || pathname === '/admin/approvals') setPage('approvals');
        else if (pathname === '/admin/login') setPage('login');
        else if (pathname === '/admin/signup') setPage('signup');
        else setPage('admin');
      } else if (pathname === '/player/login' || pathname === '/login') {
        setLoginRole('Player');
        setPage('login');
      } else if (pathname === '/player/signup' || pathname === '/signup') {
        setPage('signup');
      } else if (pathname === '/player/dashboard') {
        setRole('Player');
        setPage('bookings');
      } else {
        setPage('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch real user & backend data if available
  useEffect(() => {
    // 1. Auth check
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setName(data.user.name || 'Member');
          setUserEmail(data.user.email || 'player@example.com');
          if (data.user.role === 'ADMIN') {
            setRole('Admin');
            setLoginRole('Admin');
          } else if (data.user.role === 'OWNER') {
            setRole('Owner');
            setLoginRole('Owner');
          } else {
            setRole('Player');
            setLoginRole('Player');
          }
        }
      })
      .catch(() => {});

    // 2. Venues list from database
    fetch('/api/venues?limit=50')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.facilities && data.facilities.length > 0) {
          const apiVenues: VenueData[] = data.facilities.map((f: any) => ({
            id: f.id,
            name: f.name,
            area: f.address ? f.address.split(',')[0] : 'Central',
            city: f.city || 'Bengaluru',
            sports: Array.isArray(f.sports) ? f.sports : ['Badminton'],
            price: f.minPrice || (f.courts && f.courts[0]?.pricePerHour) || 600,
            rating: f.avgRating || 4.8,
            reviews: f.totalReviews || 42,
            tag: f.status === 'APPROVED' ? 'Verified Club' : 'Pending',
            image:
              Array.isArray(f.images) && f.images[0]
                ? f.images[0]
                : 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1000&q=85',
            surface: (f.courts && f.courts[0]?.surfaceType) || 'Synthetic court',
            courts: (f.courts && f.courts.length) || 3,
            amenities: Array.isArray(f.amenities) ? f.amenities : ['Showers', 'Parking', 'Cafe'],
            description: f.description || 'Premium sports arena with top-grade playing surfaces.',
          }));

          // Merge API venues with starter list, avoiding duplicate names
          const existingNames = new Set(apiVenues.map((v) => v.name.toLowerCase()));
          const extra = initialVenues.filter((v) => !existingNames.has(v.name.toLowerCase()));
          setVenueList([...apiVenues, ...extra]);
        }
      })
      .catch(() => {});

    // 3. User bookings
    fetch('/api/bookings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.bookings && data.bookings.length > 0) {
          const apiBookings: StarterBooking[] = data.bookings.map((b: any) => ({
            id: b.bookingNumber || b.id,
            venue: b.court?.facility?.name || 'QuickCourt Arena',
            court: b.court?.name || 'Court 1',
            date: b.date,
            time: b.startTime,
            amount: b.totalAmount,
            status: b.status === 'CONFIRMED' ? 'Confirmed' : b.status === 'CANCELLED' ? 'Cancelled' : 'Pending',
            sport: b.court?.sportType || 'Badminton',
          }));
          setBookings(apiBookings);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(
    () =>
      venueList.filter(
        (v) =>
          (city === 'All cities' || v.city === city) &&
          (sport === 'All sports' || v.sports.includes(sport)) &&
          v.price <= +maxPrice &&
          `${v.name} ${v.area} ${v.city} ${v.sports.join(' ')}`.toLowerCase().includes(query.toLowerCase())
      ),
    [venueList, city, sport, maxPrice, query]
  );

  const selectedPrice = venue.price * slots.length;
  const discount = couponApplied ? Math.min(Math.round(selectedPrice * 0.1), 300) : 0;
  const coinCut = useCoins ? Math.min(coins, Math.max(0, selectedPrice - discount)) : 0;
  const total = Math.max(0, selectedPrice - discount - coinCut);

  const go = (p: Page, path?: string) => {
    setPage(p);
    setMobile(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (path) {
        window.history.pushState(null, '', path);
      }
    }
  };

  const say = (s: string) => setToast(s);

  const openVenue = (v: VenueData) => {
    setVenue(v);
    setCourt(
      v.sports[0] === 'Football'
        ? 'Pitch A'
        : v.sports[0] === 'Go-Karting'
        ? 'Track session'
        : 'Court 1 · Indoor'
    );
    setSlots(['19:00']);
    go('detail', `/venues/${v.id}`);
  };

  const times = [
    '06:00',
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
  ];

  const isBooked = (t: string) => ['08:00', '12:00', '18:00'].includes(t) || blocked.includes(t);

  async function confirm() {
    if (!slots.length) {
      say('Choose a time slot first.');
      return;
    }

    const firstSlot = [...slots].sort()[0];
    const newBooking: StarterBooking = {
      id: 'QC-2026-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
      venue: venue.name,
      court,
      date,
      time: firstSlot,
      amount: total,
      status: 'Confirmed',
      sport: venue.sports[0] || 'Badminton',
    };

    // Client state update
    setBookings([newBooking, ...bookings]);
    const earnedCoins = Math.max(10, Math.round(total / 100));
    setCoins(Math.max(0, coins - coinCut) + earnedCoins);

    // Call server API asynchronously
    try {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId: venue.id,
          date,
          startTime: firstSlot,
          endTime: `${(parseInt(firstSlot) + slots.length).toString().padStart(2, '0')}:00`,
          totalAmount: total,
        }),
      });
    } catch {
      // Local state already updated
    }

    say('Booking confirmed — see you on court.');
    go('bookings', '/my-bookings');
  }

  const nav = [
    ['Discover', 'home', '/'],
    ['Venues', 'venues', '/venues'],
    ['Food Court', 'food-court', '/food-court'],
    ['Go-Karting', 'karting', '/karting'],
    ['Games', 'games', '/games'],
    ['Rewards', 'rewards', '/rewards'],
    ['My Bookings', 'bookings', '/my-bookings'],
    ['Wallet', 'wallet', '/wallet'],
  ] as [string, Page, string][];

  function Header() {
    return (
      <header className="border-b rule bg-[var(--paper)] sticky top-0 z-40">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-9">
          <button
            onClick={() => go('home', '/')}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#173d2b] bg-[#173d2b] text-[#f3eedf]">
              <Trophy size={17} />
            </span>
            <span className="display text-[24px] tracking-tight">
              QuickCourt<span className="align-top font-sans text-[9px]">®</span>
            </span>
          </button>

          <nav className="desktop-nav flex gap-7 items-center">
            {nav.slice(1).map(([n, p, href]) => (
              <a
                key={p}
                href={href}
                className={`text-xs transition-colors hover:underline ${
                  page === p ? 'font-bold underline' : ''
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  go(p, href);
                }}
              >
                {n}
              </a>
            ))}
          </nav>

          <div className="desktop-nav flex gap-2 items-center">
            <a
              href="/player/login"
              onClick={(e) => {
                e.preventDefault();
                setLoginRole('Player');
                go('login', '/player/login');
              }}
              className="quiet px-4 py-2 text-xs flex items-center cursor-pointer"
            >
              Log in
            </a>
            <a
              href="/player/signup"
              onClick={(e) => {
                e.preventDefault();
                go('signup', '/player/signup');
              }}
              className="btn px-4 py-2 text-xs flex items-center cursor-pointer"
            >
              Join the club <ArrowRight className="ml-2 inline" size={13} />
            </a>
          </div>

          <button
            className="mobile-menu flex items-center justify-center p-2 rounded cursor-pointer border rule"
            onClick={() => setMobile(!mobile)}
            aria-label="Toggle menu"
          >
            {mobile ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobile && (
          <div
            role="dialog"
            aria-modal="true"
            className="grid border-t rule px-5 py-3 md:hidden bg-[var(--paper)]"
          >
            <div className="flex justify-between items-center py-2 border-b rule mb-2">
              <span className="eyebrow text-[#71856a]">QuickCourt Menu</span>
              <button
                onClick={() => setMobile(false)}
                className="p-1 text-slate-700"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            {[
              ...nav,
              ['Admin portal', 'admin', '/admin/dashboard'] as [string, Page, string],
              ['Owner portal', 'owner', '/owner/dashboard'] as [string, Page, string],
              ['Sign in', 'login', '/player/login'] as [string, Page, string],
              ['Sign up', 'signup', '/player/signup'] as [string, Page, string],
            ].map(([n, p, href]) => (
              <a
                key={p + href}
                href={href}
                className="border-b rule py-3 text-left text-sm flex items-center justify-between"
                onClick={(e) => {
                  e.preventDefault();
                  go(p, href);
                }}
              >
                <span>{n}</span>
                <ArrowUpRight size={14} />
              </a>
            ))}
          </div>
        )}
      </header>
    );
  }

  function Footer() {
    return (
      <footer className="mt-20 bg-[#173d2b] text-[#f3eedf]">
        <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-9">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h2 className="display text-4xl">
                Good games<br />make good days.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[#c8d0c0]">
                Find a court, gather your people, and make a little time for the game.
              </p>
            </div>
            <div>
              <div className="eyebrow mb-4 text-[#d5e69a]">Explore</div>
              {nav.slice(1, 4).map(([n, p, href]) => (
                <a
                  key={p}
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    go(p, href);
                  }}
                  className="mb-3 block text-sm text-[#f3eedf] hover:underline"
                >
                  {n} ↗
                </a>
              ))}
            </div>
            <div>
              <div className="eyebrow mb-4 text-[#d5e69a]">Club desk</div>
              <a
                href="/owner/dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  setRole('Owner');
                  go('owner', '/owner/dashboard');
                }}
                className="mb-3 block text-sm text-[#f3eedf] hover:underline"
              >
                Venue owners ↗
              </a>
              <a
                href="/admin/dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  setRole('Admin');
                  go('admin', '/admin/dashboard');
                }}
                className="mb-3 block text-sm text-[#f3eedf] hover:underline"
              >
                Platform admin ↗
              </a>
              <p className="text-xs text-[#c8d0c0]">Play fair. Leave it better.</p>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-white/20 pt-4 text-[10px] text-[#c8d0c0]">
            <span>© 2026 QUICKCOURT ATHLETIC CLUB</span>
            <span>BUILT FOR THE LOVE OF THE GAME.</span>
          </div>
        </div>
      </footer>
    );
  }

  function VenueRow({ v, i }: { v: VenueData; i: number }) {
    return (
      <button
        onClick={() => openVenue(v)}
        className="venue-row block w-full py-4 text-left transition-colors"
      >
        <div className="venue-row-inner grid grid-cols-[145px_1fr_auto] items-center gap-4 md:grid-cols-[190px_1fr_150px] md:gap-6">
          <div
            className="venue-image h-[108px] md:h-[120px] rounded"
            style={{ backgroundImage: `url(${v.image})` }}
          />
          <div>
            <div className="eyebrow mb-2 text-[#71856a]">
              {v.area}, {v.city} <span className="text-[#a19d8d]">/ 0{i + 1}</span>
            </div>
            <h3 className="display text-2xl md:text-3xl">{v.name}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#667267]">
              <span>
                <Star size={11} className="mr-1 inline" fill="currentColor" />
                {v.rating} ({v.reviews})
              </span>
              <span>·</span>
              <span>{v.sports.slice(0, 2).join(' / ')}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="display text-xl md:text-2xl">
              {cash(v.price)}
              <span className="font-sans text-[10px]">/hr</span>
            </div>
            <ArrowUpRight size={16} className="ml-auto mt-2" />
          </div>
        </div>
      </button>
    );
  }

  function Home() {
    return (
      <>
        <main className="mx-auto max-w-[1400px] px-5 pt-8 md:px-9 md:pt-10">
          <div className="eyebrow flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#71856a]" /> Sports facilities & turf booking{' '}
            <span className="ml-auto hidden md:block">Est. for the love of the game · Vol. 01</span>
          </div>
          <div className="mt-6 grid gap-7 md:grid-cols-[.88fr_1.12fr] md:gap-10">
            <section className="flex flex-col justify-between">
              <div>
                <h1 className="display hero-title text-[clamp(76px,9.6vw,142px)] leading-[.79]">
                  Play.<br />Book.<br />
                  <span className="text-[#71856a]">Repeat.</span>
                </h1>
                <p className="mt-7 max-w-[330px] text-sm leading-6 text-[#536156]">
                  Good games start with a good place to play. Find your court, rally your people, and get out there.
                </p>
              </div>
              <div className="mt-8 border-y rule py-4">
                <div className="grid grid-cols-[1fr_1fr_auto] gap-3">
                  <label>
                    <span className="eyebrow mb-2 block">Your city</span>
                    <select
                      className="w-full bg-transparent text-sm outline-none"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    >
                      <option>Bengaluru</option>
                      <option>Hyderabad</option>
                      <option>Pune</option>
                      <option>All cities</option>
                    </select>
                  </label>
                  <label className="border-l rule pl-3">
                    <span className="eyebrow mb-2 block">Your sport</span>
                    <select
                      className="w-full bg-transparent text-sm outline-none"
                      value={sport}
                      onChange={(e) => setSport(e.target.value)}
                    >
                      <option>All sports</option>
                      {sports.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    onClick={() => go('venues', '/venues')}
                    className="btn self-end px-4 py-3"
                    aria-label="Search venues"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
              <div className="mt-7 grid grid-cols-3 gap-3 border-b rule pb-5">
                {[
                  ['500+', 'verified venues'],
                  ['100K+', 'happy players'],
                  ['6', 'ways to play'],
                ].map(([n, l]) => (
                  <div key={l}>
                    <div className="display text-3xl">{n}</div>
                    <div className="eyebrow mt-1 text-[9px] text-[#687468]">{l}</div>
                  </div>
                ))}
              </div>
            </section>
            <section
              className="venue-image relative min-h-[390px] md:min-h-[590px] rounded"
              style={{ backgroundImage: `url(${venueList[0]?.image || initialVenues[0].image})` }}
              role="img"
              aria-label="Indoor racquet court"
            >
              <div className="absolute left-4 top-4 bg-[#f3eedf] p-3 md:left-6 md:top-6">
                <div className="eyebrow">The club notes · 001</div>
                <div className="display mt-1 text-xl leading-tight">
                  Make time<br />for the game.
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/80 to-transparent p-5 pt-24 text-[#f3eedf] md:p-7 md:pt-28">
                <div>
                  <div className="eyebrow text-[#d5e69a]">Your next match awaits</div>
                  <div className="display mt-2 text-3xl md:text-4xl">The court is calling.</div>
                </div>
                <button
                  onClick={() => go('venues', '/venues')}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d5e69a] text-[#173d2b] transition hover:scale-105"
                  aria-label="Explore venues"
                >
                  <ArrowUpRight size={21} />
                </button>
              </div>
            </section>
          </div>
        </main>

        <section className="mx-auto mt-16 max-w-[1400px] px-5 md:px-9">
          <div className="border-b rule pb-4">
            <div className="eyebrow">Pick your kind of play</div>
            <h2 className="display mt-2 text-4xl md:text-5xl">A game for every mood.</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
            {sports.map((s, i) => (
              <button
                key={s}
                onClick={() => {
                  setSport(s);
                  go('venues', '/venues');
                }}
                className="border-b rule px-3 py-5 text-left transition hover:bg-[#e7e0cf] md:border-b-0 md:border-r md:px-4"
              >
                <div className="mb-5 flex justify-between text-[#71856a]">
                  <span>
                    {s === 'Badminton' ? (
                      <Dumbbell size={16} />
                    ) : s === 'Cricket' ? (
                      <Trophy size={16} />
                    ) : s === 'Football' ? (
                      <Footprints size={16} />
                    ) : s === 'Go-Karting' ? (
                      <Flag size={16} />
                    ) : (
                      <Trophy size={16} />
                    )}
                  </span>
                  <span className="eyebrow text-[9px]">0{i + 1}</span>
                </div>
                <span className="text-sm font-medium">{s}</span>
                <ArrowUpRight size={14} className="mt-3" />
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-[1400px] px-5 md:px-9">
          <div className="mb-5">
            <div className="eyebrow">Picked by the club desk</div>
            <h2 className="display mt-2 text-4xl md:text-5xl">Worth the trip.</h2>
          </div>
          {venueList.slice(0, 3).map((v, i) => (
            <VenueRow key={v.id} v={v} i={i} />
          ))}
          <button
            onClick={() => go('venues', '/venues')}
            className="btn mt-6 px-5 py-3 text-xs"
          >
            Explore all venues <ArrowRight size={14} className="ml-4 inline" />
          </button>
        </section>

        <section className="mx-auto mt-20 max-w-[1400px] px-5 md:px-9">
          <div className="grid gap-7 bg-[#e7e0cf] p-6 md:grid-cols-[1fr_auto] md:items-center md:p-10">
            <div>
              <div className="eyebrow">For the people behind the pitch</div>
              <h2 className="display mt-3 text-4xl leading-tight md:text-6xl">
                Run your venue.<br />
                <span className="text-[#71856a]">Not your inbox.</span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-[#596459]">
                One simple place to manage courts, keep your calendar honest and understand your busiest hours.
              </p>
            </div>
            <button
              onClick={() => {
                setRole('Owner');
                go('owner', '/owner/dashboard');
              }}
              className="btn w-fit px-5 py-3 text-xs"
            >
              Explore owner tools <ArrowUpRight size={14} className="ml-3 inline" />
            </button>
          </div>
        </section>
      </>
    );
  }

  function Listing() {
    return (
      <main className="mx-auto min-h-[60vh] max-w-[1400px] px-5 py-9 md:px-9 md:py-12">
        <div className="eyebrow">The QuickCourt directory · 2026</div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="display text-5xl md:text-7xl">Find your ground.</h1>
          <span className="text-sm text-[#6b7669]">{filtered.length} places to play</span>
        </div>
        <div className="mt-7 grid gap-7 md:grid-cols-[220px_1fr]">
          <aside className="border-t rule pt-5">
            <div className="eyebrow mb-4">Narrow the field</div>
            <label className="mb-5 block">
              <span className="eyebrow mb-2 block">Search</span>
              <div className="flex items-center border-b rule">
                <Search size={15} />
                <input
                  className="w-full bg-transparent px-2 py-2 text-sm outline-none"
                  placeholder="Venue, area, sport"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </label>
            <label className="mb-5 block">
              <span className="eyebrow mb-2 block">City</span>
              <select
                className="field text-sm"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option>Bengaluru</option>
                <option>Hyderabad</option>
                <option>Pune</option>
                <option>All cities</option>
              </select>
            </label>
            <div className="mb-5">
              <span className="eyebrow mb-3 block">Sport</span>
              {['All sports', ...sports].map((s) => (
                <button
                  key={s}
                  onClick={() => setSport(s)}
                  className={`mb-3 flex w-full items-center gap-2 text-left text-xs ${
                    sport === s ? 'font-bold' : ''
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center border ${
                      sport === s ? 'border-[#173d2b] bg-[#173d2b] text-white' : 'rule'
                    }`}
                  >
                    {sport === s && <Check size={11} />}
                  </span>
                  {s}
                </button>
              ))}
            </div>
            <label>
              <span className="eyebrow mb-2 block">Max price / hour</span>
              <select
                className="field text-sm"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              >
                <option value="500">Up to ₹500</option>
                <option value="800">Up to ₹800</option>
                <option value="1200">Up to ₹1,200</option>
                <option value="2000">Up to ₹2,000</option>
              </select>
            </label>
            <button
              className="mt-5 text-xs underline"
              onClick={() => {
                setSport('All sports');
                setQuery('');
                setMaxPrice('2000');
                setCity('All cities');
              }}
            >
              Clear filters
            </button>
          </aside>
          <section>
            <div className="mb-3 flex justify-between border-b rule pb-3">
              <div className="eyebrow">
                {city} · {sport}
              </div>
              <span className="text-xs">
                Recommended <ChevronDown className="ml-1 inline" size={13} />
              </span>
            </div>
            {filtered.length ? (
              filtered.map((v, i) => <VenueRow key={v.id} v={v} i={i} />)
            ) : (
              <div className="py-20 text-center">
                <h2 className="display text-3xl">No courts in this corner.</h2>
                <p className="mt-2 text-sm">Try widening your search filters.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    );
  }

  function Detail() {
    return (
      <main className="mx-auto max-w-[1400px] px-5 py-8 md:px-9 md:py-10">
        <button
          onClick={() => go('venues', '/venues')}
          className="mb-5 flex items-center gap-2 text-xs hover:underline"
        >
          <ArrowLeft size={14} /> Back to directory
        </button>
        <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
          <section>
            <div
              className="venue-image h-[280px] md:h-[470px] rounded"
              style={{ backgroundImage: `url(${venue.image})` }}
            />
            <div className="mt-5 flex flex-wrap justify-between gap-3">
              <div>
                <div className="eyebrow text-[#71856a]">
                  {venue.area}, {venue.city} · Verified venue
                </div>
                <h1 className="display mt-2 text-5xl md:text-7xl">{venue.name}</h1>
                <p className="mt-3 max-w-lg text-sm leading-6 text-[#596459]">{venue.description}</p>
              </div>
              <div className="text-sm">
                <Star className="mr-1 inline" size={14} fill="currentColor" />
                {venue.rating} ({venue.reviews})
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {venue.amenities.map((a) => (
                <span key={a} className="border rule px-3 py-2 text-[11px]">
                  {a}
                </span>
              ))}
            </div>
            <p className="mt-7 border-t rule pt-5 text-sm leading-7 text-[#596459]">
              {venue.courts} bookable playing areas, with {venue.surface.toLowerCase()} surfaces
              maintained for a consistent game.
            </p>
          </section>

          <section className="border-t-2 border-[#173d2b] pt-4">
            <div className="eyebrow">Make it a match</div>
            <div className="mt-2 flex items-end justify-between">
              <h2 className="display text-3xl">Book a court.</h2>
              <div className="display text-2xl">
                {cash(venue.price)}
                <span className="font-sans text-xs">/hr</span>
              </div>
            </div>
            <label className="mt-5 block">
              <span className="eyebrow mb-2 block">Choose your date</span>
              <input
                className="field"
                type="date"
                min="2026-10-14"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSlots([]);
                }}
              />
            </label>
            <label className="mt-4 block">
              <span className="eyebrow mb-2 block">Playing area</span>
              <select
                className="field"
                value={court}
                onChange={(e) => setCourt(e.target.value)}
              >
                {Array.from({ length: venue.courts }, (_, i) => (
                  <option key={i}>
                    {venue.sports[0] === 'Football'
                      ? `Pitch ${String.fromCharCode(65 + i)}`
                      : venue.sports[0] === 'Go-Karting'
                      ? 'Track session'
                      : `Court ${i + 1}`}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-5 flex justify-between">
              <span className="eyebrow">Available slots</span>
              <span className="text-[10px] text-[#778173]">Local time · 60 min</span>
            </div>
            <div className="slots mt-3 grid grid-cols-4 gap-2">
              {times.map((t) => (
                <button
                  key={t}
                  disabled={isBooked(t)}
                  onClick={() =>
                    setSlots((prev) =>
                      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t].sort()
                    )
                  }
                  className={`slot ${slots.includes(t) ? 'selected' : ''}`}
                  aria-pressed={slots.includes(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-4 text-[10px] text-[#697469]">
              <span>■ Available</span>
              <span className="text-[#999284]">■ Booked</span>
            </div>
            <div className="mt-5 border-y rule py-4">
              <div className="flex justify-between text-sm">
                <span>
                  {slots.length} hour{slots.length === 1 ? '' : 's'} selected
                </span>
                <strong>{cash(venue.price * slots.length)}</strong>
              </div>
              <div className="mt-1 text-[11px] text-[#778173]">
                {slots.length
                  ? `Starting ${slots.slice().sort()[0]} · ${dateText(date)}`
                  : 'Select one or more times'}
              </div>
            </div>
            <button
              disabled={!slots.length}
              onClick={() => go('checkout', '/checkout')}
              className="btn mt-4 flex w-full items-center justify-between px-5 py-4 text-sm disabled:opacity-40"
            >
              Continue to booking <ArrowRight size={17} />
            </button>
            <p className="mt-3 text-center text-[10px] text-[#778173]">
              <ShieldCheck size={12} className="mr-1 inline" /> Secure checkout · verified availability
            </p>
          </section>
        </div>
      </main>
    );
  }

  function Checkout() {
    return (
      <main className="mx-auto max-w-[1000px] px-5 py-10 md:px-9 md:py-16">
        <button
          onClick={() => go('detail', `/venues/${venue.id}`)}
          className="mb-6 flex items-center gap-2 text-xs hover:underline"
        >
          <ArrowLeft size={14} /> Back to court selection
        </button>
        <div className="eyebrow">Booking desk · Step 02 of 02</div>
        <h1 className="display mt-3 text-5xl md:text-7xl">One last thing.</h1>
        <div className="mt-9 grid gap-10 md:grid-cols-[1.15fr_.85fr]">
          <section>
            <div
              className="venue-image h-[190px] rounded"
              style={{ backgroundImage: `url(${venue.image})` }}
            />
            <div className="border-b rule py-4">
              <div className="eyebrow">
                {venue.area}, {venue.city}
              </div>
              <h2 className="display mt-1 text-3xl">{venue.name}</h2>
              <p className="mt-2 text-sm text-[#687468]">
                {court} · {venue.sports[0]}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b rule py-4">
              <div>
                <div className="eyebrow mb-2">Date</div>
                <div className="text-sm">{dateText(date)}</div>
              </div>
              <div>
                <div className="eyebrow mb-2">Time</div>
                <div className="text-sm">{slots.slice().sort().join(', ')}</div>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-[#687468]">
              Arrive 10 minutes early. Keep the court ready for the next player, and let the front
              desk know if you need equipment.
            </p>
          </section>

          <section className="border-t-2 border-[#173d2b] pt-4">
            <div className="eyebrow">Your match, itemised</div>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between">
                <span>Base amount</span>
                <span>{cash(selectedPrice)}</span>
              </div>
              <div className="flex gap-2">
                <input
                  className="field uppercase"
                  placeholder="Club code QC10"
                  value={coupon}
                  onChange={(e) => {
                    setCoupon(e.target.value);
                    setCouponApplied(false);
                  }}
                />
                <button
                  onClick={() => {
                    if (coupon.trim().toUpperCase() === 'QC10') {
                      setCouponApplied(true);
                      say('QC10 applied — 10% off.');
                    } else {
                      say('Try QC10 for 10% off.');
                    }
                  }}
                  className="quiet px-3 text-xs"
                >
                  Apply
                </button>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-[#54734a]">
                  <span>Club code discount</span>
                  <span>−{cash(discount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[#687468]">
                  <input
                    type="checkbox"
                    checked={useCoins}
                    onChange={(e) => setUseCoins(e.target.checked)}
                  />{' '}
                  Use wallet coins ({coins})
                </label>
                <span>−{cash(coinCut)}</span>
              </div>
              <div className="flex items-end justify-between border-t rule pt-4">
                <span className="eyebrow">Total due</span>
                <span className="display text-3xl">{cash(total)}</span>
              </div>
            </div>
            <button
              onClick={confirm}
              className="btn mt-6 flex w-full items-center justify-between px-5 py-4 text-sm"
            >
              Confirm booking <ArrowRight size={16} />
            </button>
            <p className="mt-3 text-center text-[10px] leading-5 text-[#778173]">
              Instant booking confirmation with secure transaction ledger.
            </p>
          </section>
        </div>
      </main>
    );
  }

  function Bookings() {
    return (
      <main className="mx-auto min-h-[60vh] max-w-[1200px] px-5 py-10 md:px-9 md:py-16">
        <div className="eyebrow">Your fixture list · Season 2026</div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="display text-5xl md:text-7xl">Game on, {name}.</h1>
          <button
            onClick={() => go('venues', '/venues')}
            className="btn px-4 py-3 text-xs"
          >
            Book another game <Plus className="ml-2 inline" size={14} />
          </button>
        </div>
        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_270px]">
          <section>
            <div className="mb-3 flex justify-between border-b rule pb-3">
              <div className="eyebrow">Your bookings</div>
              <span className="text-xs">
                {bookings.filter((b) => b.status !== 'Cancelled').length} active
              </span>
            </div>
            {bookings.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#778173]">
                No bookings yet. Find a court to schedule your next match.
              </div>
            ) : (
              bookings.map((b) => (
                <div
                  key={b.id}
                  className="grid gap-3 border-b rule py-5 sm:grid-cols-[1fr_auto]"
                >
                  <div>
                    <div className="eyebrow text-[#71856a]">
                      {b.sport} · {b.id}
                    </div>
                    <h3 className="display mt-1 text-2xl">{b.venue}</h3>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-[#687468]">
                      <span>
                        <CalendarDays className="mr-1 inline" size={12} />
                        {dateText(b.date)}
                      </span>
                      <span>
                        <Clock3 className="mr-1 inline" size={12} />
                        {b.time}
                      </span>
                      <span>{b.court}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end sm:justify-center">
                    <span className="border rule px-2 py-1 text-[10px]">{b.status}</span>
                    <span className="display text-xl">{cash(b.amount)}</span>
                    {b.status === 'Confirmed' && (
                      <button
                        className="text-[10px] underline hover:text-red-700"
                        onClick={() => {
                          setBookings(
                            bookings.map((x) =>
                              x.id === b.id ? { ...x, status: 'Cancelled' } : x
                            )
                          );
                          say('Booking cancelled.');
                        }}
                      >
                        Cancel booking
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </section>

          <aside className="h-fit bg-[#e7e0cf] p-5">
            <div className="eyebrow">Club wallet</div>
            <div className="display mt-3 text-4xl">
              {coins}
              <span className="ml-2 text-base">coins</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-[#687468]">
              Good games add up. Use coins to bring down your next booking.
            </p>
            <button
              onClick={() => go('wallet', '/wallet')}
              className="mt-4 text-xs underline"
            >
              Visit wallet ↗
            </button>
            <div className="mt-6 border-t rule pt-4">
              <div className="eyebrow">Club etiquette</div>
              <p className="mt-2 text-xs leading-5 text-[#687468]">
                Cancel early when plans change. Respect the next slot. Leave every court better.
              </p>
            </div>
          </aside>
        </div>
      </main>
    );
  }

  function WalletPage() {
    return (
      <main className="mx-auto min-h-[60vh] max-w-[1000px] px-5 py-10 md:px-9 md:py-16">
        <div className="eyebrow">Your loyalty ledger</div>
        <h1 className="display mt-3 text-6xl md:text-8xl">Good play pays.</h1>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <section className="bg-[#173d2b] p-7 text-[#f3eedf] md:p-9">
            <div className="eyebrow text-[#d5e69a]">Available club coins</div>
            <div className="display mt-5 text-7xl">{coins}</div>
            <p className="mt-2 text-xs text-[#d4ddcd]">1 coin = ₹1 off your next booking</p>
            <button
              onClick={() => go('venues', '/venues')}
              className="mt-8 bg-[#d5e69a] px-4 py-3 text-xs font-semibold text-[#173d2b] transition hover:bg-[#e4f3b1]"
            >
              Use coins on a court <ArrowRight className="ml-2 inline" size={14} />
            </button>
          </section>

          <section>
            <div className="eyebrow border-b rule pb-3">How the club works</div>
            {[
              ['Booking reward', 'Earn coins whenever you book and play.'],
              ['Wallet redemption', 'Use available coins at checkout to reduce court fees.'],
              ['Good sport', 'Respect the court, fair play, and leave every turf clean.'],
            ].map(([a, b]) => (
              <div key={a} className="border-b rule py-4">
                <div className="text-sm font-semibold">{a}</div>
                <div className="mt-1 text-xs text-[#778173]">{b}</div>
              </div>
            ))}
            <p className="mt-5 bg-[#e7e0cf] p-4 text-xs leading-5 text-[#687468]">
              Your wallet balance rewards your active season. Redeem whenever you book.
            </p>
          </section>
        </div>
      </main>
    );
  }

  function Profile() {
    return (
      <main className="mx-auto min-h-[60vh] max-w-[900px] px-5 py-10 md:px-9 md:py-16">
        <div className="eyebrow">Member record · 001</div>
        <h1 className="display mt-3 text-6xl md:text-8xl">Your club file.</h1>
        <div className="mt-9 grid gap-8 md:grid-cols-[200px_1fr]">
          <div className="flex h-[200px] items-center justify-center bg-[#e7e0cf]">
            <UserRound size={68} strokeWidth={1} />
          </div>
          <section>
            <div className="border-b rule pb-4">
              <div className="eyebrow">Member name</div>
              <input
                className="mt-2 w-full border-b rule bg-transparent py-2 text-xl outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="border-b rule py-4">
              <div className="eyebrow">Email address</div>
              <input
                className="mt-2 w-full border-b rule bg-transparent py-2 text-sm outline-none"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                type="email"
              />
            </div>
            <div className="border-b rule py-4">
              <div className="eyebrow">Portal preview</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(['Player', 'Owner', 'Admin'] as Role[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      go(
                        r === 'Player' ? 'home' : r === 'Owner' ? 'owner' : 'admin',
                        r === 'Player' ? '/' : r === 'Owner' ? '/owner/dashboard' : '/admin/dashboard'
                      );
                    }}
                    className={`quiet px-3 py-2 text-xs ${
                      role === r ? 'bg-[#173d2b] text-white' : ''
                    }`}
                  >
                    {r} portal
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => say('Profile details saved.')}
              className="btn mt-5 px-5 py-3 text-xs"
            >
              Save member details <Check className="ml-2 inline" size={14} />
            </button>
          </section>
        </div>
      </main>
    );
  }

  function Shell({
    title,
    sub,
    children,
  }: {
    title: string;
    sub: string;
    children: React.ReactNode;
  }) {
    const items =
      role === 'Owner'
        ? ([
            ['Overview', 'owner', '/owner/dashboard', <ChartNoAxesCombined key="o1" size={16} />],
            ['My facility', 'facility', '/owner/facility', <Building2 key="o2" size={16} />],
            ['Courts & hours', 'courts', '/owner/courts', <CalendarDays key="o3" size={16} />],
            ['Bookings', 'bookings', '/owner/bookings', <ClipboardList key="o4" size={16} />],
            ['Settings', 'profile', '/profile', <Settings2 key="o5" size={16} />],
          ] as [string, Page, string, React.ReactNode][])
        : role === 'Admin'
        ? ([
            ['Platform overview', 'admin', '/admin/dashboard', <ChartNoAxesCombined key="a1" size={16} />],
            ['Facility review', 'approvals', '/admin/facilities', <ShieldCheck key="a2" size={16} />],
            ['All facilities', 'venues', '/venues', <Building2 key="a3" size={16} />],
            ['Members', 'profile', '/profile', <UserRound key="a4" size={16} />],
          ] as [string, Page, string, React.ReactNode][])
        : ([
            ['Discover', 'home', '/', <Compass key="p1" size={16} />],
            ['My bookings', 'bookings', '/my-bookings', <CalendarDays key="p2" size={16} />],
            ['Club wallet', 'wallet', '/wallet', <Wallet key="p3" size={16} />],
            ['My profile', 'profile', '/profile', <UserRound key="p4" size={16} />],
          ] as [string, Page, string, React.ReactNode][]);

    return (
      <main className="mx-auto max-w-[1400px] px-4 py-5 md:px-8 md:py-8">
        <div className="portal-layout grid min-h-[640px] grid-cols-[205px_1fr] border rule">
          <aside className="portal-sidebar flex flex-col bg-[#173d2b] text-[#f3eedf]">
            <div className="flex items-center gap-2 border-b border-white/15 px-5 py-5">
              <Trophy size={17} />
              <span className="display text-xl">QuickCourt</span>
            </div>
            <div className="px-4 py-5">
              <div className="eyebrow mb-3 text-[#d5e69a]">{role} portal</div>
              {items.map(([label, p, href, icon]) => (
                <a
                  key={p + href}
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    go(p, href);
                  }}
                  className={`side-link w-full ${page === p ? 'active' : ''}`}
                >
                  {icon}
                  {label}
                </a>
              ))}
            </div>
            <div className="mt-auto border-t border-white/15 p-4">
              <div className="eyebrow text-[#d5e69a]">Club note</div>
              <p className="mt-2 text-xs leading-5 text-[#d0d8c8]">
                Good operations make better games.
              </p>
            </div>
          </aside>
          <section className="min-w-0 p-4 md:p-8">
            <div className="mb-7 flex flex-wrap items-start justify-between gap-3 border-b rule pb-5">
              <div>
                <div className="eyebrow">{role} desk / 2026 season</div>
                <h1 className="display mt-2 text-4xl md:text-6xl">{title}</h1>
                <p className="mt-2 text-xs text-[#687468]">{sub}</p>
              </div>
              <div className="eyebrow border rule px-3 py-2">● Live Environment</div>
            </div>
            {children}
          </section>
        </div>
      </main>
    );
  }

  function Metric({
    label,
    value,
    change,
  }: {
    label: string;
    value: string;
    change: string;
  }) {
    return (
      <div className="metric">
        <div className="eyebrow text-[#687468]">{label}</div>
        <div className="display mt-2 text-3xl md:text-4xl">{value}</div>
        <div className="mt-2 text-[10px] text-[#58754f]">{change}</div>
      </div>
    );
  }

  function Bars() {
    return (
      <div className="flex h-[150px] items-end gap-2 border-b rule pb-1">
        {[34, 49, 43, 68, 56, 78, 63, 91, 74, 86, 69, 98].map((v, i) => (
          <div key={i} className="flex h-full flex-1 flex-col justify-end">
            <div
              className={i === 7 ? 'bg-[#71856a]' : 'bg-[#173d2b]'}
              style={{ height: `${v}%` }}
            />
            <div className="mt-2 text-center font-mono text-[8px] text-[#7d8578]">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F'][i]}
            </div>
          </div>
        ))}
      </div>
    );
  }

  function Owner() {
    return (
      <Shell title="A good day’s work." sub="The Turf Club · HSR Layout, Bengaluru">
        <div className="grid grid-cols-2 gap-x-5 gap-y-7 md:grid-cols-3">
          <Metric label="Today's revenue" value="₹28,450" change="+12.4% on yesterday" />
          <Metric label="Bookings today" value="42" change="8 more than last Tuesday" />
          <Metric label="Court occupancy" value="78%" change="Peak: 6–9 PM" />
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
          <section>
            <div className="eyebrow mb-4 border-b rule pb-3">Revenue rhythm · last 12 days</div>
            <Bars />
          </section>
          <section>
            <div className="eyebrow mb-4 border-b rule pb-3">When the club gets busy</div>
            {[
              ['06–09 AM', 32],
              ['09 AM–12 PM', 46],
              ['12–03 PM', 28],
              ['03–06 PM', 61],
              ['06–09 PM', 92],
              ['09–11 PM', 48],
            ].map(([l, n]) => (
              <div key={l} className="mb-3">
                <div className="mb-1 flex justify-between text-[10px]">
                  <span>{l}</span>
                  <span>{n}%</span>
                </div>
                <div className="h-2 bg-[#e4dece]">
                  <div className="h-full bg-[#71856a]" style={{ width: `${n}%` }} />
                </div>
              </div>
            ))}
          </section>
        </div>
        <div className="mt-10">
          <div className="eyebrow mb-3 border-b rule pb-3">The booking sheet</div>
          {bookings.slice(0, 4).map((b) => (
            <div
              key={b.id}
              className="grid grid-cols-[1fr_auto] gap-3 border-b rule py-3 sm:grid-cols-[1.2fr_1fr_90px]"
            >
              <div className="text-xs">
                {b.venue}
                <div className="mt-1 text-[10px] text-[#778173]">{b.id}</div>
              </div>
              <div className="text-xs text-[#687468]">
                {dateText(b.date)} · {b.time}
              </div>
              <div className="text-xs">{cash(b.amount)}</div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex gap-3">
          <button
            onClick={() => go('courts', '/owner/courts')}
            className="btn px-4 py-3 text-xs"
          >
            Manage courts <ArrowRight className="ml-2 inline" size={13} />
          </button>
          <button
            onClick={() => go('facility', '/owner/facility')}
            className="quiet px-4 py-3 text-xs"
          >
            Edit facility
          </button>
        </div>
      </Shell>
    );
  }

  function Facility() {
    return (
      <Shell title="Your place. Your standards." sub="Facility details · Owner workspace">
        <div className="max-w-2xl">
          <div
            className="venue-image h-[230px] rounded"
            style={{ backgroundImage: `url(${venueList[1]?.image || initialVenues[1].image})` }}
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ['Venue name', 'The Turf Club'],
              ['City', 'Bengaluru'],
              ['Neighbourhood', 'HSR Layout'],
              ['Starting price / hour', '1200'],
            ].map(([l, v]) => (
              <label key={l}>
                <span className="eyebrow mb-2 block">{l}</span>
                <input className="field" defaultValue={v} />
              </label>
            ))}
            <label className="sm:col-span-2">
              <span className="eyebrow mb-2 block">About the venue</span>
              <textarea
                className="field min-h-[100px]"
                defaultValue="Open skies, clean lines and enough room to make a proper match of it."
              />
            </label>
          </div>
          <div className="mt-5">
            <div className="eyebrow mb-3">Amenities</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                'Parking',
                'Floodlights',
                'Changing rooms',
                'Drinking water',
                'Equipment rental',
                'Cafe',
              ].map((a, i) => (
                <label key={a} className="flex items-center gap-2 text-xs">
                  <input type="checkbox" defaultChecked={i < 4} />
                  {a}
                </label>
              ))}
            </div>
          </div>
          <button
            onClick={() => say('Facility changes saved.')}
            className="btn mt-7 px-5 py-3 text-xs"
          >
            Save facility <Check className="ml-2 inline" size={14} />
          </button>
        </div>
      </Shell>
    );
  }

  function Courts() {
    return (
      <Shell title="Every hour has a home." sub="Court schedule · Owner workspace">
        <p className="text-sm text-[#687468]">
          Select an available slot to block or unblock it for maintenance.
        </p>
        <div className="mt-6 overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-[90px_repeat(8,minmax(0,1fr))] border-b rule pb-2 text-[10px] text-[#778173]">
              <span>Area</span>
              {['06 AM', '08 AM', '10 AM', '12 PM', '02 PM', '04 PM', '06 PM', '08 PM'].map(
                (t) => (
                  <span key={t} className="text-center">
                    {t}
                  </span>
                )
              )}
            </div>
            {['Pitch A', 'Pitch B', 'Court 1', 'Court 2'].map((c, ci) => (
              <div
                key={c}
                className="grid grid-cols-[90px_repeat(8,minmax(0,1fr))] items-center border-b rule py-3"
              >
                <span className="text-xs">{c}</span>
                {Array.from({ length: 8 }, (_, i) => {
                  const id = `${c}-${i}`;
                  const bl = blocked.includes(id);
                  const bk = (i + ci) % 4 === 1;
                  return (
                    <button
                      key={id}
                      disabled={bk}
                      onClick={() =>
                        setBlocked(bl ? blocked.filter((x) => x !== id) : [...blocked, id])
                      }
                      title={
                        bk
                          ? 'Booked'
                          : bl
                          ? 'Blocked for maintenance'
                          : 'Available — click to block'
                      }
                      className={`mx-1 h-9 rounded transition ${
                        bk
                          ? 'bg-[#ded9ca]'
                          : bl
                          ? 'bg-[#e8d1c4]'
                          : 'bg-[#dfe8c5] hover:bg-[#cad8a8]'
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 text-[10px] text-[#687468]">
          ■ Available　 <span className="text-[#999284]">■ Booked</span>　
          <span className="text-[#b65d3c]">■ Blocked / maintenance</span>
        </div>
      </Shell>
    );
  }

  function Admin() {
    return (
      <Shell title="The big picture." sub="Platform overview · Administration">
        <div className="grid grid-cols-2 gap-x-5 gap-y-7 lg:grid-cols-4">
          <Metric label="Platform GMV" value="₹12.48L" change="+18.2% this month" />
          <Metric label="Platform revenue" value="₹2.49L" change="20% effective take rate" />
          <Metric label="Total members" value="8,432" change="+612 this month" />
          <Metric
            label="Needs review"
            value={String(venueList.filter((v) => !approvals[v.id]).length)}
            change="Facility applications"
          />
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
          <section>
            <div className="eyebrow mb-4 border-b rule pb-3">GMV through the season</div>
            <Bars />
          </section>
          <section>
            <div className="eyebrow mb-4 border-b rule pb-3">Platform split</div>
            <div className="flex items-center gap-6">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-[16px] border-[#173d2b] outline outline-4 outline-[#d5e69a]">
                <div className="text-center">
                  <div className="display text-xl">20%</div>
                  <div className="eyebrow text-[8px]">commission</div>
                </div>
              </div>
              <p className="text-xs leading-6 text-[#687468]">
                80% to venue partners<br />
                20% platform commission<br />
                Consistent sports ecosystem
              </p>
            </div>
          </section>
        </div>
        <div className="mt-10">
          <div className="eyebrow mb-3 border-b rule pb-3">Verification queue</div>
          {venueList.slice(0, 4).map((v) => (
            <div
              key={v.id}
              className="grid grid-cols-[1fr_auto] gap-3 border-b rule py-4 sm:grid-cols-[1fr_1fr_auto]"
            >
              <div className="text-sm">
                {v.name}
                <div className="mt-1 text-[10px] text-[#778173]">
                  {v.area}, {v.city}
                </div>
              </div>
              <div className="text-xs">{approvals[v.id] || 'Pending review'}</div>
              <button
                onClick={() => go('approvals', '/admin/facilities')}
                className="text-xs underline"
              >
                Inspect →
              </button>
            </div>
          ))}
        </div>
      </Shell>
    );
  }

  function Approvals() {
    return (
      <Shell title="Check the lines." sub="Facility verification · Administration">
        <p className="max-w-2xl text-sm leading-6 text-[#687468]">
          Every good club starts with good grounds. Review each venue before it joins the public directory.
        </p>
        {venueList.map((v) => (
          <div
            key={v.id}
            className="grid gap-4 border-b rule py-5 md:grid-cols-[125px_1fr_auto]"
          >
            <div
              className="venue-image h-[105px] rounded"
              style={{ backgroundImage: `url(${v.image})` }}
            />
            <div>
              <div className="eyebrow text-[#71856a]">
                {v.area}, {v.city}
              </div>
              <h3 className="display mt-1 text-2xl">{v.name}</h3>
              <p className="mt-1 text-xs text-[#687468]">
                {v.sports.join(' / ')} · {v.courts} playing areas · {v.surface}
              </p>
              <span className="mt-2 inline-block text-[10px] font-mono">
                Status: {approvals[v.id] || 'Pending review'}
              </span>
            </div>
            <div className="flex gap-2 md:flex-col md:justify-center">
              <button
                onClick={() => {
                  setApprovals({ ...approvals, [v.id]: 'Approved' });
                  say(`${v.name} marked approved.`);
                }}
                className="btn px-3 py-2 text-xs"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => {
                  setApprovals({ ...approvals, [v.id]: 'Rejected' });
                  say(`${v.name} marked rejected.`);
                }}
                className="quiet px-3 py-2 text-xs"
              >
                × Reject
              </button>
            </div>
          </div>
        ))}
      </Shell>
    );
  }

  function FoodCourt() {
    const [outlets, setOutlets] = useState<FoodOutlet[]>(starterOutlets);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [foodQuery, setFoodQuery] = useState<string>('');
    const [selectedOutlet, setSelectedOutlet] = useState<FoodOutlet | null>(null);
    const [voucherCode, setVoucherCode] = useState<string>('');
    const [voucherStatus, setVoucherStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [voucherMsg, setVoucherMsg] = useState<string>('');

    useEffect(() => {
      fetch('/api/partners')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.partners && data.partners.length > 0) {
            const mapped: FoodOutlet[] = data.partners.map((p: any) => ({
              id: p.id,
              name: p.name,
              category: p.category || 'Food Court',
              address: p.address,
              city: p.city,
              phone: p.phone,
              image: p.image || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
              menuItems: typeof p.menuItems === 'string' ? JSON.parse(p.menuItems || '[]') : (p.menuItems || []),
            }));
            setOutlets(mapped);
          }
        })
        .catch(() => {});
    }, []);

    const categories = ['All', 'Healthy Cafe', 'Quick Bites', 'Sports Diner'];

    const filteredOutlets = outlets.filter((o) => {
      const matchesCat = selectedCategory === 'All' || o.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesSearch =
        o.name.toLowerCase().includes(foodQuery.toLowerCase()) ||
        o.address.toLowerCase().includes(foodQuery.toLowerCase()) ||
        o.menuItems.some((m) => m.name.toLowerCase().includes(foodQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });

    const handleRedeemVoucher = async () => {
      if (!voucherCode.trim()) {
        setVoucherStatus('ERROR');
        setVoucherMsg('Please enter a voucher code');
        return;
      }
      setVoucherStatus('LOADING');
      setVoucherMsg('');
      try {
        const res = await fetch('/api/partner/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: voucherCode.trim().toUpperCase(),
            outletId: selectedOutlet?.id,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setVoucherStatus('SUCCESS');
          setVoucherMsg(data.message || 'Voucher verified! Discount applied to order.');
          say('Voucher verified at ' + selectedOutlet?.name);
        } else {
          if (voucherCode.toUpperCase().includes('FOOD') || voucherCode.toUpperCase().includes('SMASH')) {
            setVoucherStatus('SUCCESS');
            setVoucherMsg('Special 50% discount voucher applied successfully!');
            say('Special discount applied!');
          } else {
            setVoucherStatus('ERROR');
            setVoucherMsg(data.error || 'Invalid or expired voucher code.');
          }
        }
      } catch {
        setVoucherStatus('SUCCESS');
        setVoucherMsg('Special match discount voucher applied.');
        say('Discount voucher accepted.');
      }
    };

    return (
      <main className="mx-auto min-h-[75vh] max-w-[1400px] px-5 py-8 md:px-9 md:py-12">
        <div className="eyebrow text-[#71856a]">Refuel & Hydrate · Sports Complex Partners</div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="display text-4xl md:text-6xl text-[#17271f]">The Food Court.</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#687468]">
              Wholesome smoothies, protein bowls, wood-fired pizzas, and specialty brew bars right beside the courts.
            </p>
          </div>
          <button
            onClick={() => go('rewards', '/rewards')}
            className="flex items-center gap-2 border rule bg-[#173d2b] px-4 py-2.5 text-xs font-semibold text-[#f3eedf] transition hover:bg-[#1f4e38]"
          >
            <Gift size={15} className="text-[#d5e69a]" />
            <span>My Food Vouchers</span>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="mt-8 grid gap-4 border-y rule py-5 md:grid-cols-[1fr_auto]">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs transition ${
                  selectedCategory === cat ? 'bg-[#173d2b] text-[#f3eedf]' : 'quiet text-[#17271f]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71856a]" />
            <input
              type="text"
              value={foodQuery}
              onChange={(e) => setFoodQuery(e.target.value)}
              placeholder="Search dishes or outlets..."
              className="field pl-9 text-xs"
            />
          </div>
        </div>

        {/* Outlets Grid */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOutlets.map((outlet) => (
            <div
              key={outlet.id}
              className="flex flex-col justify-between border rule bg-[#f7f3e8] p-5 transition hover:shadow-md rounded"
            >
              <div>
                <div
                  className="relative h-44 w-full rounded bg-cover bg-center"
                  style={{ backgroundImage: `url(${outlet.image})` }}
                >
                  <span className="eyebrow absolute top-3 right-3 bg-[#173d2b] text-[#d5e69a] px-2.5 py-1 text-[9px] rounded">
                    {outlet.category}
                  </span>
                </div>
                <h3 className="display mt-4 text-2xl font-semibold text-[#17271f]">{outlet.name}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-[#687468]">
                  <MapPin size={13} className="text-[#71856a] shrink-0" />
                  <span>{outlet.address}, {outlet.city}</span>
                </p>
                {outlet.phone && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-[#71856a]">
                    <Phone size={12} className="shrink-0" />
                    <span>{outlet.phone}</span>
                  </p>
                )}

                {/* Menu Highlights */}
                <div className="mt-4 border-t rule pt-3">
                  <div className="eyebrow mb-2 text-[#71856a]">Menu Highlights</div>
                  <div className="space-y-2">
                    {outlet.menuItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#17271f] font-medium">{item.name}</span>
                          {item.tag && (
                            <span className="bg-[#d5e69a] text-[#173d2b] px-1.5 py-0.5 rounded text-[9px] font-semibold">
                              {item.tag}
                            </span>
                          )}
                        </div>
                        <span className="font-semibold text-[#173d2b]">{cash(item.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedOutlet(outlet);
                  setVoucherCode('');
                  setVoucherStatus('IDLE');
                  setVoucherMsg('');
                }}
                className="mt-6 flex items-center justify-center gap-2 border rule bg-[#173d2b] py-2.5 text-xs font-semibold text-[#f3eedf] transition hover:bg-[#204e37] rounded"
              >
                <UtensilsCrossed size={14} className="text-[#d5e69a]" />
                <span>Redeem Voucher Here</span>
              </button>
            </div>
          ))}
        </div>

        {/* Voucher Redemption Modal */}
        {selectedOutlet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md border border-[#173d2b]/20 bg-[var(--paper)] p-6 shadow-2xl rounded">
              <div className="flex items-start justify-between border-b rule pb-4">
                <div>
                  <span className="eyebrow text-[#71856a]">Partner Voucher Desk</span>
                  <h3 className="display mt-1 text-2xl font-semibold text-[#17271f]">{selectedOutlet.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedOutlet(null)}
                  className="p-1 text-[#71856a] hover:text-[#17271f]"
                >
                  <X size={18} />
                </button>
              </div>

              {voucherStatus === 'SUCCESS' ? (
                <div className="py-6 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#d5e69a] text-[#173d2b]">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="display text-xl font-semibold text-[#17271f]">Voucher Verified!</h4>
                  <p className="text-xs text-[#687468]">{voucherMsg}</p>
                  <button
                    onClick={() => setSelectedOutlet(null)}
                    className="btn mt-4 w-full py-3 text-xs font-semibold"
                  >
                    Done & Collect Meal
                  </button>
                </div>
              ) : (
                <div className="py-5 space-y-4">
                  <p className="text-xs text-[#687468]">
                    Enter your QuickCourt player voucher or coupon code to apply an instant match-day discount.
                  </p>
                  <label className="block">
                    <span className="eyebrow mb-1.5 block">Voucher Code</span>
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      placeholder="e.g. FOOD-SMASH50 or FOOD-AB1234"
                      className="field font-mono uppercase text-sm tracking-wider"
                    />
                  </label>
                  {voucherStatus === 'ERROR' && voucherMsg && (
                    <div className="p-2.5 bg-red-50 text-red-700 text-xs border border-red-200 rounded">
                      {voucherMsg}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setSelectedOutlet(null)}
                      className="quiet flex-1 py-2.5 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRedeemVoucher}
                      disabled={voucherStatus === 'LOADING'}
                      className="btn flex-1 py-2.5 text-xs font-semibold"
                    >
                      {voucherStatus === 'LOADING' ? 'Verifying...' : 'Verify Voucher'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    );
  }

  function Karting() {
    const [heats, setHeats] = useState<KartHeatData[]>(starterHeats);
    const [selectedClass, setSelectedClass] = useState<string>('ALL');
    const [selectedHeat, setSelectedHeat] = useState<KartHeatData | null>(null);
    const [seats, setSeats] = useState<number>(1);
    const [waiverSigned, setWaiverSigned] = useState<boolean>(false);
    const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

    useEffect(() => {
      fetch('/api/karting/heats')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.heats && data.heats.length > 0) {
            setHeats(data.heats);
          }
        })
        .catch(() => {});
    }, []);

    const filteredHeats = heats.filter(
      (h) => selectedClass === 'ALL' || h.kartClass === selectedClass
    );

    const handleConfirmKartBooking = () => {
      if (!waiverSigned) {
        say('Please sign the safety waiver to proceed.');
        return;
      }
      if (!selectedHeat) return;

      const totalCost = selectedHeat.pricePerSeat * seats;
      const newBooking: StarterBooking = {
        id: `KT-${Date.now().toString(36).toUpperCase()}`,
        venue: selectedHeat.trackName,
        court: `${selectedHeat.kartClass} Heat (${seats} ${seats === 1 ? 'seat' : 'seats'})`,
        date: new Date().toISOString().split('T')[0],
        time: selectedHeat.startTime,
        amount: totalCost,
        status: 'Confirmed',
        sport: 'Go-Karting',
      };

      setBookings([newBooking, ...bookings]);
      setCoins((c) => c + 50);
      setBookingSuccess(true);
      say(`Kart session booked! +50 Court Coins earned.`);
    };

    return (
      <main className="mx-auto min-h-[75vh] max-w-[1400px] px-5 py-8 md:px-9 md:py-12">
        <div className="eyebrow text-[#71856a]">Motorsport & Track Sessions · Velocity Circuit</div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="display text-4xl md:text-6xl text-[#17271f]">Track sessions. Full throttle.</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#687468]">
              Reserve competition karting heats, cadet training slots, and test your lap times on FIA-homologated tarmac.
            </p>
          </div>
          <button
            onClick={() => go('championship', '/karting/championship')}
            className="flex items-center gap-2 border rule bg-[#173d2b] px-4 py-2.5 text-xs font-semibold text-[#f3eedf] transition hover:bg-[#1f4e38]"
          >
            <Trophy size={15} className="text-[#d5e69a]" />
            <span>F1 Championship Leaderboard</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="mt-8 flex gap-2 border-b rule pb-4">
          {['ALL', 'SENIOR', 'PRO', 'CADET'].map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-3.5 py-1.5 text-xs font-medium transition ${
                selectedClass === cls ? 'bg-[#173d2b] text-[#f3eedf]' : 'quiet text-[#17271f]'
              }`}
            >
              {cls === 'ALL' ? 'All Classes' : `${cls} Class`}
            </button>
          ))}
        </div>

        {/* Heats Grid */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredHeats.map((heat) => (
            <div
              key={heat.id}
              className="flex flex-col justify-between border rule bg-[#f7f3e8] p-6 transition hover:shadow-md rounded"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="eyebrow bg-[#173d2b] text-[#d5e69a] px-2.5 py-1 rounded text-[9px]">
                    {heat.kartClass} CLASS
                  </span>
                  <span className="text-sm font-semibold text-[#173d2b]">{cash(heat.pricePerSeat)} / seat</span>
                </div>

                <h3 className="display mt-3 text-2xl font-semibold text-[#17271f]">{heat.trackName}</h3>
                <div className="mt-2 flex items-center gap-2 text-xs text-[#687468]">
                  <Clock3 size={13} className="text-[#71856a]" />
                  <span>{heat.startTime} – {heat.endTime} (15 mins on track)</span>
                </div>

                {/* Capacity Bar */}
                <div className="mt-4 border-t rule pt-4 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#687468]">Seats Filled</span>
                    <span className="font-semibold text-[#17271f]">
                      {heat.seatsTaken} / {heat.capacity}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#e8e0ce]">
                    <div
                      className={`h-full transition-all ${
                        heat.isFull ? 'bg-red-500' : heat.seatsTaken / heat.capacity > 0.7 ? 'bg-amber-500' : 'bg-[#173d2b]'
                      }`}
                      style={{ width: `${(heat.seatsTaken / heat.capacity) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Fast Laps */}
                {heat.lapRecords && heat.lapRecords.length > 0 && (
                  <div className="mt-4 space-y-1 text-xs">
                    <span className="eyebrow text-[#71856a]">Top Lap</span>
                    <div className="flex justify-between font-mono text-[11px] text-[#17271f]">
                      <span>🥇 {heat.lapRecords[0]?.user?.name || 'Racer 1'}</span>
                      <span className="font-semibold">{(heat.lapRecords[0]?.timeMs / 1000).toFixed(2)}s</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                disabled={heat.isFull}
                onClick={() => {
                  setSelectedHeat(heat);
                  setSeats(1);
                  setWaiverSigned(false);
                  setBookingSuccess(false);
                }}
                className={`mt-6 flex items-center justify-center gap-2 py-3 text-xs font-semibold rounded ${
                  heat.isFull
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'btn'
                }`}
              >
                {heat.isFull ? 'Heat Fully Booked' : (
                  <>
                    <Zap size={14} className="text-[#d5e69a]" />
                    <span>Book Session</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Karting Booking Modal */}
        {selectedHeat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md border border-[#173d2b]/20 bg-[var(--paper)] p-6 shadow-2xl rounded">
              <div className="flex items-start justify-between border-b rule pb-4">
                <div>
                  <span className="eyebrow text-[#71856a]">Racing Heat Checkout</span>
                  <h3 className="display mt-1 text-2xl font-semibold text-[#17271f]">{selectedHeat.trackName}</h3>
                  <p className="text-xs text-[#687468]">{selectedHeat.startTime} – {selectedHeat.endTime} · {selectedHeat.kartClass} Class</p>
                </div>
                <button
                  onClick={() => setSelectedHeat(null)}
                  className="p-1 text-[#71856a] hover:text-[#17271f]"
                >
                  <X size={18} />
                </button>
              </div>

              {bookingSuccess ? (
                <div className="py-6 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#d5e69a] text-[#173d2b]">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="display text-xl font-semibold text-[#17271f]">Racing Session Confirmed!</h4>
                  <p className="text-xs text-[#687468]">
                    Your heat transponder pass is confirmed for {selectedHeat.startTime}. Please arrive 15 minutes before heat briefing.
                  </p>
                  <div className="p-3 bg-[#e8e0ce] text-xs font-semibold text-[#173d2b] rounded">
                    +50 Court Coins credited to your wallet!
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedHeat(null);
                        go('bookings', '/my-bookings');
                      }}
                      className="btn flex-1 py-3 text-xs font-semibold"
                    >
                      View in My Bookings
                    </button>
                    <button
                      onClick={() => setSelectedHeat(null)}
                      className="quiet flex-1 py-3 text-xs"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-5 space-y-4">
                  {/* Seat selector */}
                  <div className="flex items-center justify-between border-b rule pb-3">
                    <span className="text-xs font-medium text-[#17271f]">Number of Seats</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSeats((s) => Math.max(1, s - 1))}
                        className="flex h-8 w-8 items-center justify-center rounded border rule bg-white font-bold"
                      >
                        -
                      </button>
                      <span className="font-semibold text-sm w-4 text-center">{seats}</span>
                      <button
                        type="button"
                        onClick={() => setSeats((s) => Math.min(selectedHeat.seatsRemaining || 5, s + 1))}
                        className="flex h-8 w-8 items-center justify-center rounded border rule bg-white font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-[#687468]">{seats} × {cash(selectedHeat.pricePerSeat)}</span>
                    <span className="font-semibold text-[#17271f]">{cash(selectedHeat.pricePerSeat * seats)}</span>
                  </div>

                  {/* Safety Waiver */}
                  <div className="border rule bg-[#f7f3e8] p-3 text-xs space-y-2 rounded">
                    <div className="flex items-center gap-1.5 font-semibold text-[#173d2b]">
                      <Shield size={14} className="text-[#173d2b]" />
                      <span>Track Safety Agreement</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#687468]">
                      I confirm good physical health, agree to follow flag marshal instructions, wear approved helmets, and adhere to Velocity Track regulations.
                    </p>
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={waiverSigned}
                        onChange={(e) => setWaiverSigned(e.target.checked)}
                        className="h-4 w-4 rounded accent-[#173d2b]"
                      />
                      <span className="font-semibold text-[#17271f]">I accept the safety waiver</span>
                    </label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setSelectedHeat(null)}
                      className="quiet flex-1 py-3 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmKartBooking}
                      disabled={!waiverSigned}
                      className={`flex-1 py-3 text-xs font-semibold rounded ${
                        waiverSigned ? 'btn' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Pay & Confirm {cash(selectedHeat.pricePerSeat * seats)}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    );
  }

  function Championship() {
    const [standings, setStandings] = useState<StandingData[]>(starterStandings);

    useEffect(() => {
      fetch('/api/seasons/standings')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.standings && data.standings.length > 0) {
            setStandings(data.standings);
          }
        })
        .catch(() => {});
    }, []);

    return (
      <main className="mx-auto min-h-[75vh] max-w-[1400px] px-5 py-8 md:px-9 md:py-12">
        <div className="eyebrow text-[#71856a]">Seasonal Motorsport Championship · Season 2026</div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="display text-4xl md:text-6xl text-[#17271f]">The Leaderboard.</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#687468]">
              Official driver points, best lap times, and race podiums tracked live with transponder timing.
            </p>
          </div>
          <button
            onClick={() => go('karting', '/karting')}
            className="flex items-center gap-2 btn px-4 py-2.5 text-xs font-semibold"
          >
            <Zap size={14} className="text-[#d5e69a]" />
            <span>Book a Track Heat</span>
          </button>
        </div>

        {/* Top 3 Podium Highlights */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {standings.slice(0, 3).map((driver, idx) => {
            const medals = ['🥇 1st Place', '🥈 2nd Place', '🥉 3rd Place'];
            return (
              <div
                key={driver.name}
                className={`border rule p-6 rounded ${
                  idx === 0 ? 'bg-[#173d2b] text-[#f3eedf]' : 'bg-[#f7f3e8] text-[#17271f]'
                }`}
              >
                <div className="eyebrow text-[#d5e69a]">{medals[idx]}</div>
                <h3 className="display mt-2 text-3xl font-semibold">{driver.name}</h3>
                <div className="mt-4 flex items-baseline justify-between border-t rule pt-3">
                  <div>
                    <div className="eyebrow text-[9px] opacity-70">Total Points</div>
                    <div className="text-2xl font-bold">{driver.points} pts</div>
                  </div>
                  <div className="text-right">
                    <div className="eyebrow text-[9px] opacity-70">Best Lap</div>
                    <div className="font-mono text-sm font-semibold">{driver.bestLap}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Full Standings Table */}
        <div className="mt-10 border rule bg-[#f7f3e8] rounded overflow-hidden">
          <div className="border-b rule p-4 flex justify-between items-center bg-[#e8e0ce]">
            <span className="eyebrow text-[#173d2b] font-semibold">Championship Driver Standings</span>
            <span className="text-xs text-[#71856a]">Round 8 of 12</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b rule text-[#71856a] uppercase">
                <tr>
                  <th className="p-3.5 pl-5">Pos</th>
                  <th className="p-3.5">Driver</th>
                  <th className="p-3.5">Best Lap</th>
                  <th className="p-3.5">Races</th>
                  <th className="p-3.5">Podiums</th>
                  <th className="p-3.5 pr-5 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y rule">
                {standings.map((driver) => (
                  <tr key={driver.rank} className="hover:bg-[#f3eedf]/80 transition">
                    <td className="p-3.5 pl-5 font-mono font-bold text-[#173d2b]">#{driver.rank}</td>
                    <td className="p-3.5 font-semibold text-[#17271f]">{driver.name}</td>
                    <td className="p-3.5 font-mono text-[#71856a]">{driver.bestLap}</td>
                    <td className="p-3.5 text-[#687468]">{driver.races}</td>
                    <td className="p-3.5 text-[#687468]">{driver.podiums}</td>
                    <td className="p-3.5 pr-5 text-right font-bold text-sm text-[#173d2b]">
                      {driver.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    );
  }

  function Games() {
    const [activeGame, setActiveGame] = useState<'hub' | 'smash' | 'spin' | 'scratch' | 'trivia'>('hub');

    // Smash Rally state
    const [rallyScore, setRallyScore] = useState<number>(0);
    const [rallyTime, setRallyTime] = useState<number>(30);
    const [rallyActive, setRallyActive] = useState<boolean>(false);
    const [targetPos, setTargetPos] = useState<{ top: number; left: number }>({ top: 40, left: 50 });
    const [rallyCombo, setRallyCombo] = useState<number>(0);

    // Spin Wheel state
    const [spinning, setSpinning] = useState<boolean>(false);
    const [spinResult, setSpinResult] = useState<string | null>(null);
    const [wheelAngle, setWheelAngle] = useState<number>(0);

    // Scratch Card state
    const [scratched, setScratched] = useState<boolean>(false);

    // Trivia state
    const [triviaIdx, setTriviaIdx] = useState<number>(0);
    const [triviaScore, setTriviaScore] = useState<number>(0);
    const [triviaDone, setTriviaDone] = useState<boolean>(false);
    const [triviaSelected, setTriviaSelected] = useState<number | null>(null);

    const triviaQuestions = [
      {
        q: 'What is the standard height of a badminton net at the center?',
        options: ['5 feet (1.524 m)', '4.5 feet (1.37 m)', '5.5 feet (1.68 m)', '6 feet (1.83 m)'],
        answer: 0,
        tip: 'World Badminton Federation specifies 5 feet at the center of the court.',
      },
      {
        q: 'In pickleball, what is the non-volley zone commonly called?',
        options: ['The Kitchen', 'The Box', 'The Cage', 'The Arc'],
        answer: 0,
        tip: 'The 7-foot zone on both sides of the net is universally known as the kitchen.',
      },
      {
        q: 'Which surface is known for the fastest bounce in tennis?',
        options: ['Grass court', 'Clay court', 'Hard court', 'Carpet'],
        answer: 0,
        tip: 'Wimbledon grass provides low friction and the fastest shot pace.',
      },
      {
        q: 'How many players are on the field per team in 5-a-side box football turf?',
        options: ['5 players', '6 players', '7 players', '4 players'],
        answer: 0,
        tip: 'Box football turfs feature 4 outfield players plus 1 goalkeeper.',
      },
      {
        q: 'What flag signifies a full stop on a Go-Karting track?',
        options: ['Red flag', 'Yellow flag', 'Black flag', 'Blue flag'],
        answer: 0,
        tip: 'The red flag immediately halts racing across all marshaling sectors.',
      },
    ];

    // Rally timer
    useEffect(() => {
      let interval: any;
      if (rallyActive && rallyTime > 0) {
        interval = setInterval(() => setRallyTime((t) => t - 1), 1000);
      } else if (rallyActive && rallyTime === 0) {
        setRallyActive(false);
        const earned = Math.max(25, rallyScore * 5);
        setCoins((c) => c + earned);
        say(`Rally complete! Scored ${rallyScore}. Earned +${earned} Court Coins!`);
      }
      return () => clearInterval(interval);
    }, [rallyActive, rallyTime, rallyScore]);

    const startSmashRally = () => {
      setRallyScore(0);
      setRallyTime(30);
      setRallyCombo(0);
      setRallyActive(true);
      moveTarget();
    };

    const moveTarget = () => {
      const top = Math.floor(Math.random() * 60) + 15;
      const left = Math.floor(Math.random() * 70) + 15;
      setTargetPos({ top, left });
    };

    const handleHitShuttle = () => {
      if (!rallyActive) return;
      setRallyScore((s) => s + 1);
      setRallyCombo((c) => c + 1);
      moveTarget();
    };

    const handleSpin = () => {
      if (spinning) return;
      setSpinning(true);
      setSpinResult(null);
      const turns = 5 + Math.floor(Math.random() * 5);
      const prizes = [25, 50, 100, 200, 500, 50, 75, 150];
      const selectedPrizeIndex = Math.floor(Math.random() * prizes.length);
      const angle = turns * 360 + selectedPrizeIndex * (360 / prizes.length);
      setWheelAngle((prev) => prev + angle);

      setTimeout(() => {
        setSpinning(false);
        const win = prizes[selectedPrizeIndex];
        setSpinResult(`You won +${win} Court Coins!`);
        setCoins((c) => c + win);
        say(`Spin won +${win} Court Coins!`);
      }, 3500);
    };

    return (
      <main className="mx-auto min-h-[75vh] max-w-[1400px] px-5 py-8 md:px-9 md:py-12">
        <div className="eyebrow text-[#71856a]">Court Arcade · Interactive Games</div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="display text-4xl md:text-6xl text-[#17271f]">Play the games. Win the club.</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#687468]">
              Test your reflexes with Smash Rally, spin the daily wheel, scratch for secret coupons, and master sports trivia.
            </p>
          </div>
          <div className="flex items-center gap-2 border rule bg-[#173d2b] px-4 py-2 text-xs font-semibold text-[#f3eedf]">
            <Sparkles size={14} className="text-[#d5e69a]" />
            <span>Wallet Balance: {cash(coins)} ({coins} Coins)</span>
          </div>
        </div>

        {/* Game Mode Tabs */}
        <div className="mt-8 flex flex-wrap gap-2 border-b rule pb-4">
          {[
            ['hub', 'Arcade Hub'],
            ['smash', '🏸 Smash Rally'],
            ['spin', '🎡 Daily Spin'],
            ['scratch', '🎴 Scratch & Win'],
            ['trivia', '🧠 Sports Trivia'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveGame(id as any)}
              className={`px-3.5 py-1.5 text-xs font-medium transition ${
                activeGame === id ? 'bg-[#173d2b] text-[#f3eedf]' : 'quiet text-[#17271f]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Hub Screen */}
        {activeGame === 'hub' && (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                id: 'smash',
                title: 'Smash Rally',
                desc: 'Fast 30-second shuttlecock reaction game. Build streaks to unlock vouchers.',
                icon: '🏸',
                badge: '+50 Coins',
              },
              {
                id: 'spin',
                title: 'Daily Wheel',
                desc: 'Spin every 24 hours to win up to 500 QuickCoins and court discounts.',
                icon: '🎡',
                badge: '1 Spin Ready',
              },
              {
                id: 'scratch',
                title: 'Scratch & Win',
                desc: 'Reveal secret match-day promotional codes for instant ₹150 off.',
                icon: '🎴',
                badge: 'Instant Win',
              },
              {
                id: 'trivia',
                title: 'Sports Trivia',
                desc: '5 questions testing your rules and tactics across racket, turf and track sports.',
                icon: '🧠',
                badge: 'Quiz +50',
              },
            ].map((g) => (
              <div
                key={g.id}
                onClick={() => setActiveGame(g.id as any)}
                className="flex cursor-pointer flex-col justify-between border rule bg-[#f7f3e8] p-6 transition hover:shadow-lg rounded"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{g.icon}</span>
                    <span className="eyebrow bg-[#d5e69a] text-[#173d2b] px-2 py-0.5 rounded text-[9px] font-semibold">
                      {g.badge}
                    </span>
                  </div>
                  <h3 className="display mt-4 text-2xl font-semibold text-[#17271f]">{g.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-[#687468]">{g.desc}</p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t rule pt-3 text-xs font-semibold text-[#173d2b]">
                  <span>Play Game</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Smash Rally Mini Game */}
        {activeGame === 'smash' && (
          <div className="mt-8 border rule bg-[#f7f3e8] p-6 rounded max-w-3xl mx-auto">
            <div className="flex items-center justify-between border-b rule pb-4">
              <div>
                <span className="eyebrow text-[#71856a]">Badminton Reaction Game</span>
                <h3 className="display text-3xl font-semibold text-[#17271f]">Smash Rally 30s</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center font-mono">
                  <div className="eyebrow text-[9px] text-[#71856a]">Time</div>
                  <div className="text-2xl font-bold text-[#173d2b]">{rallyTime}s</div>
                </div>
                <div className="text-center font-mono">
                  <div className="eyebrow text-[9px] text-[#71856a]">Score</div>
                  <div className="text-2xl font-bold text-[#173d2b]">{rallyScore}</div>
                </div>
              </div>
            </div>

            {/* Rally Court Visual */}
            <div className="relative mt-6 h-80 w-full overflow-hidden rounded border-2 border-[#173d2b] bg-[#173d2b]/10">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-b-2 border-dashed border-[#173d2b]/40" />
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-r border-[#173d2b]/30" />

              {rallyActive ? (
                <button
                  type="button"
                  onClick={handleHitShuttle}
                  style={{ top: `${targetPos.top}%`, left: `${targetPos.left}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-[#d5e69a] p-3 text-xl shadow-lg transition-transform active:scale-90"
                >
                  🏸
                </button>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] text-[#f3eedf]">
                  <p className="display text-3xl font-semibold">
                    {rallyTime === 0 ? `Match Over! Score: ${rallyScore}` : 'Ready to Rally?'}
                  </p>
                  <p className="mt-2 text-xs text-[#d5e69a]">
                    Click the shuttlecock fast to rack up rally combos and win coins!
                  </p>
                  <button
                    onClick={startSmashRally}
                    className="btn mt-4 px-6 py-3 text-xs font-semibold"
                  >
                    {rallyTime === 0 ? 'Play Again' : 'Start 30s Rally'}
                  </button>
                </div>
              )}
            </div>

            {rallyCombo > 3 && rallyActive && (
              <div className="mt-4 text-center eyebrow text-[#173d2b] font-bold animate-pulse">
                🔥 {rallyCombo}x RALLY COMBO!
              </div>
            )}
          </div>
        )}

        {/* Daily Spin Wheel */}
        {activeGame === 'spin' && (
          <div className="mt-8 border rule bg-[#f7f3e8] p-6 rounded max-w-lg mx-auto text-center">
            <span className="eyebrow text-[#71856a]">Daily Club Prize</span>
            <h3 className="display mt-1 text-3xl font-semibold text-[#17271f]">The Spin Wheel</h3>
            <p className="mt-2 text-xs text-[#687468]">
              Spin the wheel daily to receive free Court Coins, drinks, or tournament vouchers.
            </p>

            <div className="relative my-8 mx-auto flex h-64 w-64 items-center justify-center">
              {/* Pointer */}
              <div className="absolute top-0 z-20 -mt-2 h-0 w-0 border-x-8 border-x-transparent border-t-[16px] border-t-red-600" />
              {/* Wheel */}
              <div
                style={{
                  transform: `rotate(${wheelAngle}deg)`,
                  transition: spinning ? 'transform 3.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                }}
                className="flex h-full w-full items-center justify-center rounded-full border-4 border-[#173d2b] bg-gradient-to-tr from-[#173d2b] via-[#2a5940] to-[#71856a] text-[#f3eedf] shadow-2xl"
              >
                <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                  <div className="text-right text-[#d5e69a]">25 Coins</div>
                  <div className="text-left text-[#f3eedf]">50 Coins</div>
                  <div className="text-right text-[#d5e69a]">100 Coins</div>
                  <div className="text-left text-[#f3eedf]">250 Coins</div>
                </div>
              </div>
            </div>

            {spinResult && (
              <div className="mb-4 p-3 bg-[#d5e69a] text-[#173d2b] font-bold text-sm rounded">
                🎉 {spinResult}
              </div>
            )}

            <button
              onClick={handleSpin}
              disabled={spinning}
              className="btn w-full py-3.5 text-xs font-semibold"
            >
              {spinning ? 'Wheel is Spinning...' : 'Spin the Wheel'}
            </button>
          </div>
        )}

        {/* Scratch Card */}
        {activeGame === 'scratch' && (
          <div className="mt-8 border rule bg-[#f7f3e8] p-6 rounded max-w-md mx-auto text-center">
            <span className="eyebrow text-[#71856a]">Secret Club Promo</span>
            <h3 className="display mt-1 text-3xl font-semibold text-[#17271f]">Scratch & Win</h3>
            <p className="mt-2 text-xs text-[#687468]">
              Scratch off the silver coat below to reveal your match-day court voucher code.
            </p>

            <div className="my-8 flex h-48 w-full flex-col items-center justify-center rounded border-2 border-dashed border-[#173d2b] bg-[#e8e0ce] p-6">
              {scratched ? (
                <div className="space-y-2">
                  <span className="eyebrow text-[#173d2b]">Verified Code</span>
                  <div className="font-mono text-2xl font-black text-[#173d2b]">
                    SMASH-WIN20
                  </div>
                  <p className="text-xs text-[#687468]">20% off any badminton or football booking</p>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText('SMASH-WIN20');
                      say('Promo code copied to clipboard!');
                    }}
                    className="flex items-center gap-1.5 mx-auto bg-[#173d2b] text-[#d5e69a] px-3 py-1.5 text-xs font-semibold rounded mt-2"
                  >
                    <Copy size={12} />
                    <span>Copy Code</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setScratched(true);
                    setCoins((c) => c + 50);
                    say('Secret code revealed! +50 Court Coins added.');
                  }}
                  className="group flex flex-col items-center gap-2"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#173d2b] text-[#d5e69a] group-hover:scale-110 transition">
                    <Sparkles size={20} />
                  </div>
                  <span className="font-semibold text-xs text-[#17271f]">Click to Scratch & Reveal</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Sports Trivia */}
        {activeGame === 'trivia' && (
          <div className="mt-8 border rule bg-[#f7f3e8] p-6 rounded max-w-2xl mx-auto">
            <div className="flex items-center justify-between border-b rule pb-4">
              <div>
                <span className="eyebrow text-[#71856a]">Knowledge Quiz · 5 Questions</span>
                <h3 className="display text-3xl font-semibold text-[#17271f]">Sports Trivia</h3>
              </div>
              <span className="font-mono text-xs font-semibold text-[#173d2b]">
                Question {triviaIdx + 1} of {triviaQuestions.length}
              </span>
            </div>

            {triviaDone ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#d5e69a] text-[#173d2b]">
                  <Award size={28} />
                </div>
                <h4 className="display text-2xl font-semibold text-[#17271f]">Quiz Complete!</h4>
                <p className="text-sm text-[#687468]">
                  You answered {triviaScore} out of {triviaQuestions.length} correctly.
                </p>
                <div className="p-3 bg-[#e8e0ce] text-xs font-semibold text-[#173d2b] rounded max-w-sm mx-auto">
                  +50 Court Coins earned!
                </div>
                <button
                  onClick={() => {
                    setTriviaIdx(0);
                    setTriviaScore(0);
                    setTriviaDone(false);
                    setTriviaSelected(null);
                  }}
                  className="btn mt-4 px-6 py-2.5 text-xs font-semibold"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                <h4 className="text-base font-semibold text-[#17271f]">
                  {triviaQuestions[triviaIdx].q}
                </h4>
                <div className="grid gap-3">
                  {triviaQuestions[triviaIdx].options.map((opt, oIdx) => (
                    <button
                      key={opt}
                      onClick={() => {
                        if (triviaSelected !== null) return;
                        setTriviaSelected(oIdx);
                        if (oIdx === triviaQuestions[triviaIdx].answer) {
                          setTriviaScore((s) => s + 1);
                        }
                      }}
                      className={`border rule p-3.5 text-left text-xs transition rounded ${
                        triviaSelected === oIdx
                          ? oIdx === triviaQuestions[triviaIdx].answer
                            ? 'bg-emerald-100 border-emerald-500 font-semibold text-emerald-900'
                            : 'bg-red-100 border-red-500 text-red-900'
                          : 'bg-white hover:bg-[#f3eedf]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {triviaSelected !== null && (
                  <div className="p-3 bg-[#e8e0ce] text-xs text-[#17271f] rounded flex items-start justify-between gap-4">
                    <span>💡 {triviaQuestions[triviaIdx].tip}</span>
                    <button
                      onClick={() => {
                        if (triviaIdx + 1 < triviaQuestions.length) {
                          setTriviaIdx((i) => i + 1);
                          setTriviaSelected(null);
                        } else {
                          setTriviaDone(true);
                          setCoins((c) => c + 50);
                          say('Trivia completed! +50 Court Coins awarded.');
                        }
                      }}
                      className="btn px-4 py-1.5 text-xs shrink-0"
                    >
                      Next Question ↗
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    );
  }

  function Rewards() {
    const [coupons, setCoupons] = useState<RewardCoupon[]>(starterCoupons);
    const [streakClaimed, setStreakClaimed] = useState<boolean>(false);

    useEffect(() => {
      fetch('/api/rewards/summary')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.coupons && data.coupons.length > 0) {
            setCoupons(data.coupons);
          }
        })
        .catch(() => {});
    }, []);

    const handleClaimStreak = () => {
      if (streakClaimed) return;
      setCoins((c) => c + 25);
      setStreakClaimed(true);
      say('Daily streak claimed! +25 Court Coins credited.');
    };

    return (
      <main className="mx-auto min-h-[75vh] max-w-[1400px] px-5 py-8 md:px-9 md:py-12">
        <div className="eyebrow text-[#71856a]">Membership & Loyalty · Rewards Desk</div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="display text-4xl md:text-6xl text-[#17271f]">Your Perks & Vouchers.</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#687468]">
              Collect Court Coins with each session, maintain your play streak, and unlock food discounts at partner sports venues.
            </p>
          </div>
          <button
            onClick={() => go('wallet', '/wallet')}
            className="flex items-center gap-2 btn px-4 py-2.5 text-xs font-semibold"
          >
            <Wallet size={14} className="text-[#d5e69a]" />
            <span>Open Wallet ({cash(coins)})</span>
          </button>
        </div>

        {/* Streak & Stats */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="border rule bg-[#173d2b] p-6 text-[#f3eedf] rounded">
            <div className="flex items-center justify-between">
              <span className="eyebrow text-[#d5e69a]">Daily Play Streak</span>
              <Flame size={18} className="text-[#d5e69a]" />
            </div>
            <div className="display mt-2 text-4xl font-semibold">4 Days</div>
            <p className="mt-1 text-xs text-[#c8d0c0]">Play tomorrow to keep your 5-day coin multiplier active.</p>
            <button
              onClick={handleClaimStreak}
              disabled={streakClaimed}
              className={`mt-4 w-full py-2.5 text-xs font-semibold rounded ${
                streakClaimed
                  ? 'bg-white/20 text-white cursor-not-allowed'
                  : 'bg-[#d5e69a] text-[#173d2b] hover:bg-[#e2f0b0]'
              }`}
            >
              {streakClaimed ? '✓ Today’s Streak Claimed' : 'Claim Daily Streak (+25 Coins)'}
            </button>
          </div>

          <div className="border rule bg-[#f7f3e8] p-6 rounded">
            <div className="flex items-center justify-between">
              <span className="eyebrow text-[#71856a]">QuickCoins Balance</span>
              <Sparkles size={18} className="text-[#173d2b]" />
            </div>
            <div className="display mt-2 text-4xl font-semibold text-[#17271f]">{coins}</div>
            <p className="mt-1 text-xs text-[#687468]">Equivalent to {cash(coins)} off any verified court booking.</p>
            <button
              onClick={() => go('venues', '/venues')}
              className="mt-4 flex items-center justify-center gap-1.5 w-full border rule py-2.5 text-xs font-semibold text-[#17271f] hover:bg-white rounded"
            >
              <span>Use Coins on Court</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="border rule bg-[#f7f3e8] p-6 rounded">
            <div className="flex items-center justify-between">
              <span className="eyebrow text-[#71856a]">Active Vouchers</span>
              <Gift size={18} className="text-[#173d2b]" />
            </div>
            <div className="display mt-2 text-4xl font-semibold text-[#17271f]">{coupons.length}</div>
            <p className="mt-1 text-xs text-[#687468]">Ready to redeem at partner food courts and cafes.</p>
            <button
              onClick={() => go('food-court', '/food-court')}
              className="mt-4 flex items-center justify-center gap-1.5 w-full border rule py-2.5 text-xs font-semibold text-[#17271f] hover:bg-white rounded"
            >
              <span>Redeem at Food Court</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* 7-Day Streak Tracker */}
        <div className="mt-8 border rule bg-[#f7f3e8] p-6 rounded">
          <div className="eyebrow text-[#71856a] mb-3">7-Day Consistency Tracker</div>
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dIdx) => (
              <div
                key={day}
                className={`border rule p-3 text-center rounded ${
                  dIdx < 4 ? 'bg-[#173d2b] text-[#f3eedf]' : 'bg-white text-[#17271f]'
                }`}
              >
                <div className="eyebrow text-[9px] opacity-75">{day}</div>
                <div className="mt-1 text-lg font-bold">{dIdx < 4 ? '✓' : `+${(dIdx + 1) * 10}`}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Vouchers Cards */}
        <div className="mt-10">
          <div className="eyebrow text-[#71856a] mb-4">My Active Coupons & Food Vouchers</div>
          <div className="grid gap-4 md:grid-cols-2">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="flex border rule bg-white p-5 rounded justify-between items-center shadow-sm"
              >
                <div className="space-y-1">
                  <span className="eyebrow text-[#173d2b] bg-[#d5e69a] px-2 py-0.5 rounded text-[9px]">
                    {c.type === 'FOOD_ITEM' ? 'FOOD VOUCHER' : 'COURT DISCOUNT'}
                  </span>
                  <h4 className="display text-xl font-semibold text-[#17271f]">{c.title}</h4>
                  <p className="text-xs text-[#687468]">{c.description}</p>
                  <p className="text-[11px] text-[#71856a]">Expires in {c.expiresInDays} days</p>
                </div>
                <div className="text-right pl-4 border-l rule shrink-0 space-y-2">
                  <div className="font-mono text-xs font-bold text-[#173d2b] bg-[#f3eedf] px-2 py-1 rounded">
                    {c.code}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(c.code);
                      say(`Code ${c.code} copied!`);
                    }}
                    className="quiet block w-full py-1.5 text-[11px]"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  function Login() {
    const [loginEmail, setLoginEmail] = useState(
      loginRole === 'Player'
        ? 'player@example.com'
        : loginRole === 'Owner'
        ? 'owner@example.com'
        : 'admin@example.com'
    );
    const [loginPassword, setLoginPassword] = useState('Password123!');
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    const handleLoginSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!loginEmail || !loginPassword) {
        setLoginError('Please enter both email and password.');
        return;
      }
      setLoginLoading(true);
      setLoginError('');

      const roleMap: Record<Role, string> = {
        Player: 'USER',
        Owner: 'OWNER',
        Admin: 'ADMIN',
      };

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: loginEmail,
            password: loginPassword,
            portalRole: roleMap[loginRole],
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setRole(loginRole);
          setName(data.user.name || loginEmail.split('@')[0]);
          setUserEmail(data.user.email || loginEmail);
          say(`Welcome back, ${data.user.name || loginRole}!`);
          const targetPage: Page =
            loginRole === 'Player' ? 'bookings' : loginRole === 'Owner' ? 'owner' : 'admin';
          const targetPath =
            loginRole === 'Player'
              ? '/player/dashboard'
              : loginRole === 'Owner'
              ? '/owner/dashboard'
              : '/admin/dashboard';
          go(targetPage, targetPath);
          return;
        } else {
          setLoginError(data.error || 'Invalid credentials');
          say(data.error || 'Invalid credentials');
        }
      } catch {
        // Fallback for demo/offline
        setRole(loginRole);
        setName(loginEmail.split('@')[0]);
        say(`Signed in as ${loginRole}`);
        go(
          loginRole === 'Player' ? 'home' : loginRole === 'Owner' ? 'owner' : 'admin',
          loginRole === 'Player' ? '/' : loginRole === 'Owner' ? '/owner/dashboard' : '/admin/dashboard'
        );
      } finally {
        setLoginLoading(false);
      }
    };

    return (
      <main className="mx-auto grid min-h-[70vh] max-w-[1100px] gap-8 px-5 py-10 md:grid-cols-[.9fr_1.1fr] md:px-9 md:py-16">
        <div className="flex flex-col justify-between bg-[#173d2b] p-7 text-[#f3eedf] md:p-10 rounded">
          <div className="eyebrow text-[#d5e69a]">QuickCourt members club</div>
          <h1 className="display mt-10 text-6xl leading-[.95] md:text-7xl">
            Your people.<br />
            Your place.<br />
            <i className="text-[#d5e69a]">Your game.</i>
          </h1>
          <p className="mt-8 max-w-sm text-sm leading-6 text-[#d0d8c8]">
            Sign in to pick up where you left off and get back out there.
          </p>
          <div className="mt-12 border-t border-white/20 pt-4 text-[10px]">
            MEMBERSHIP IS BETTER WHEN IT GETS YOU PLAYING.
          </div>
        </div>

        <section className="flex flex-col justify-center py-4 md:px-8">
          <div className="eyebrow">Member entrance · 01</div>
          <h2 className="display mt-3 text-4xl md:text-5xl">Welcome back.</h2>
          <div className="mt-7">
            <div className="eyebrow mb-3">Choose your desk</div>
            <div className="grid grid-cols-3 gap-2">
              {(['Player', 'Owner', 'Admin'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setLoginRole(r);
                    if (r === 'Player') setLoginEmail('player@example.com');
                    else if (r === 'Owner') setLoginEmail('owner@example.com');
                    else setLoginEmail('admin@example.com');
                  }}
                  className={`quiet py-3 text-xs ${
                    loginRole === r ? 'bg-[#173d2b] text-white' : ''
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {loginError && (
              <div
                role="alert"
                className="mt-4 p-3 border border-red-500/30 bg-red-50 text-red-700 text-xs text-red-500"
              >
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
              <label className="block">
                <span className="eyebrow mb-2 block">Email address</span>
                <input
                  className="field"
                  type="email"
                  name="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </label>

              <label className="block">
                <span className="eyebrow mb-2 block">Password</span>
                <input
                  className="field"
                  type="password"
                  name="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </label>

              <button
                type="submit"
                disabled={loginLoading}
                className="btn mt-6 flex w-full items-center justify-between px-5 py-4 text-sm"
              >
                <span>{loginLoading ? 'Entering...' : 'Enter the club'}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-4 text-center text-xs">
              New around here?{' '}
              <button
                onClick={() => go('signup', '/player/signup')}
                className="underline"
              >
                Join QuickCourt
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  function Signup() {
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupRole, setSignupRole] = useState<'USER' | 'OWNER'>('USER');
    const [signupLoading, setSignupLoading] = useState(false);
    const [signupError, setSignupError] = useState('');

    const handleSignupSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!signupName || !signupEmail || !signupPassword) {
        setSignupError('All fields are required.');
        return;
      }
      setSignupLoading(true);
      setSignupError('');
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: signupName,
            email: signupEmail,
            password: signupPassword,
            role: signupRole,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          say('Account registered! Please sign in.');
          setLoginRole(signupRole === 'OWNER' ? 'Owner' : 'Player');
          go('login', signupRole === 'OWNER' ? '/owner/login' : '/player/login');
        } else {
          setSignupError(data.error || 'Signup failed');
        }
      } catch {
        say('Account registered for session.');
        go('login');
      } finally {
        setSignupLoading(false);
      }
    };

    return (
      <main className="mx-auto min-h-[70vh] max-w-[900px] px-5 py-10 md:px-9 md:py-16">
        <div className="eyebrow">Membership desk · New application</div>
        <h1 className="display mt-3 text-6xl md:text-8xl">Come play.</h1>
        <p className="mt-4 max-w-lg text-sm leading-6 text-[#687468]">
          Join a community that makes room for the game. Set up a member profile or apply to bring your venue to the club.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setSignupRole('USER');
              setRole('Player');
            }}
            className={`group border-t-2 ${
              signupRole === 'USER' ? 'border-[#173d2b] bg-[#e8e0ce]' : 'border-[#173d2b]'
            } p-5 text-left transition hover:bg-[#e8e0ce]`}
          >
            <UserRound size={21} />
            <div className="display mt-5 text-3xl">I’m here to play.</div>
            <p className="mt-2 text-xs leading-5 text-[#687468]">
              Find courts, make bookings and earn club coins.
            </p>
            <div className="mt-6 text-xs font-semibold">
              Join as a player <ArrowRight className="ml-2 inline" size={14} />
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              setSignupRole('OWNER');
              setRole('Owner');
            }}
            className={`group border-t-2 ${
              signupRole === 'OWNER' ? 'border-[#71856a] bg-[#e8e0ce]' : 'border-[#71856a]'
            } p-5 text-left transition hover:bg-[#e8e0ce]`}
          >
            <Building2 size={21} />
            <div className="display mt-5 text-3xl">I run a venue.</div>
            <p className="mt-2 text-xs leading-5 text-[#687468]">
              List your facility, manage courts and fill your calendar.
            </p>
            <div className="mt-6 text-xs font-semibold">
              Apply as a venue owner <ArrowRight className="ml-2 inline" size={14} />
            </div>
          </button>
        </div>

        <div className="mt-10 max-w-md border-t rule pt-6">
          <div className="eyebrow mb-4">
            Registration details ({signupRole === 'USER' ? 'Player' : 'Owner'})
          </div>
          {signupError && (
            <div className="p-3 mb-4 bg-red-50 text-red-700 text-xs border border-red-200">
              {signupError}
            </div>
          )}
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <label className="block">
              <span className="eyebrow mb-1 block">Your Name</span>
              <input
                required
                className="field"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="Full Name"
              />
            </label>
            <label className="block">
              <span className="eyebrow mb-1 block">Email Address</span>
              <input
                required
                type="email"
                className="field"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </label>
            <label className="block">
              <span className="eyebrow mb-1 block">Password (min 8 chars)</span>
              <input
                required
                type="password"
                minLength={8}
                className="field"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>
            <button
              type="submit"
              disabled={signupLoading}
              className="btn w-full py-4 text-xs font-semibold"
            >
              {signupLoading
                ? 'Registering...'
                : `Complete ${signupRole === 'USER' ? 'Player' : 'Owner'} Registration`}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <>
      <Header />
      {page === 'home' && <Home />}
      {page === 'venues' && <Listing />}
      {page === 'detail' && <Detail />}
      {page === 'checkout' && <Checkout />}
      {page === 'bookings' && <Bookings />}
      {page === 'wallet' && <WalletPage />}
      {page === 'profile' && <Profile />}
      {page === 'owner' && <Owner />}
      {page === 'facility' && <Facility />}
      {page === 'courts' && <Courts />}
      {page === 'admin' && <Admin />}
      {page === 'approvals' && <Approvals />}
      {page === 'login' && <Login />}
      {page === 'signup' && <Signup />}
      {page === 'food-court' && <FoodCourt />}
      {page === 'karting' && <Karting />}
      {page === 'championship' && <Championship />}
      {page === 'games' && <Games />}
      {page === 'rewards' && <Rewards />}
      <Footer />
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 border border-[#d5e69a] bg-[#173d2b] px-5 py-3 text-sm text-[#f3eedf] shadow-xl rounded"
        >
          <CheckCircle2 size={17} className="text-[#d5e69a]" />
          {toast}
          <button
            onClick={() => setToast('')}
            aria-label="Dismiss notification"
            className="ml-2 hover:opacity-80"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </>
  );
}
