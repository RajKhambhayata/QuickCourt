'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, ChevronLeft, MapPin, Phone, Star, UtensilsCrossed, QrCode, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  tag?: string;
}

interface Outlet {
  id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  phone?: string;
  image?: string;
  menuItems: MenuItem[];
}

export default function FoodCourtPage() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(null);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemState, setRedeemState] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [redeemMsg, setRedeemMsg] = useState('');
  const [redeemResult, setRedeemResult] = useState<any>(null);

  useEffect(() => {
    fetch('/api/partners')
      .then((r) => r.json())
      .then((d) => { if (d.outlets) setOutlets(d.outlets); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRedeem = async (outlet: Outlet) => {
    if (!redeemCode.trim()) { setRedeemMsg('Please enter your coupon code'); setRedeemState('ERROR'); return; }
    setRedeemState('LOADING');
    setRedeemMsg('');

    try {
      const res = await fetch('/api/partner/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: redeemCode.trim(), outletId: outlet.id }),
      });
      const data = await res.json();
      if (!res.ok) { setRedeemMsg(data.error || 'Redemption failed'); setRedeemState('ERROR'); return; }
      setRedeemResult(data);
      setRedeemState('SUCCESS');
    } catch {
      setRedeemMsg('Network error, please try again');
      setRedeemState('ERROR');
    }
  };

  const CATEGORY_EMOJI: Record<string, string> = {
    'Sports Cafe & Grill': '🔥',
    'Nutrition & Health': '💪',
    'Casual Dining': '🍕',
    'Juice Bar': '🥤',
    'Food Court': '🍔',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 mx-auto flex items-center justify-center animate-pulse">
            <ShoppingBag className="w-7 h-7 text-white" />
          </div>
          <p className="text-slate-400 text-sm">Loading food court partners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/rewards" className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition shrink-0">
            <ChevronLeft className="w-4 h-4 text-slate-300" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 truncate">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 shrink-0" />
              <span>Food Court Partners</span>
            </h1>
            <p className="text-xs text-slate-400">Redeem your game-won vouchers at these outlets</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-amber-950/60 to-orange-950/60 border border-amber-800/50 rounded-2xl px-4 py-3 flex gap-3 items-start">
          <QrCode className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-200 text-xs font-bold">How to Redeem</p>
            <p className="text-amber-400/80 text-[11px] mt-0.5">
              Share your coupon code from Smash Rally, Streak Reward, or Welcome Bonus at the counter. Each code is single-use and instantly verified.
            </p>
          </div>
        </div>

        {/* Outlets Grid */}
        {outlets.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
            <UtensilsCrossed className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No partner outlets yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outlets.map((outlet) => {
              const emoji = CATEGORY_EMOJI[outlet.category] || '🍽️';
              return (
                <div
                  key={outlet.id}
                  className="bg-slate-900/80 border border-slate-700 hover:border-orange-700 rounded-2xl overflow-hidden shadow-lg transition group"
                >
                  {/* Image Header */}
                  {outlet.image ? (
                    <div
                      className="h-32 bg-cover bg-center relative"
                      style={{ backgroundImage: `url('${outlet.image}')` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                      <div className="absolute top-3 right-3 bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        {emoji} {outlet.category}
                      </div>
                    </div>
                  ) : (
                    <div className="h-24 bg-gradient-to-br from-orange-900/40 to-amber-950/40 flex items-center justify-center">
                      <span className="text-5xl">{emoji}</span>
                    </div>
                  )}

                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-white font-black text-base">{outlet.name}</p>
                      <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" /> {outlet.address}, {outlet.city}
                      </p>
                      {outlet.phone && (
                        <p className="text-slate-500 text-xs flex items-center gap-1">
                          <Phone className="w-3 h-3 shrink-0" /> {outlet.phone}
                        </p>
                      )}
                    </div>

                    {/* Menu */}
                    <div className="space-y-1">
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Menu Highlights</p>
                      {outlet.menuItems.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-slate-300 text-xs truncate inline-block max-w-[200px] align-bottom">{item.name}</span>
                            {item.tag && (
                              <span className="ml-1.5 text-[10px] text-orange-400 font-semibold">• {item.tag}</span>
                            )}
                          </div>
                          <span className="text-white font-bold text-xs shrink-0">₹{item.price}</span>
                        </div>
                      ))}
                      {outlet.menuItems.length > 3 && (
                        <p className="text-slate-600 text-[11px]">+{outlet.menuItems.length - 3} more items</p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedOutlet(outlet);
                        setRedeemCode('');
                        setRedeemState('IDLE');
                        setRedeemMsg('');
                        setRedeemResult(null);
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-sm rounded-xl shadow-lg shadow-orange-900/30 transition flex items-center justify-center gap-2"
                    >
                      <QrCode className="w-4 h-4" /> Redeem Voucher Here
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Redeem Modal */}
        {selectedOutlet && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-orange-700 to-amber-700 p-5">
                <p className="text-white font-black text-lg">{selectedOutlet.name}</p>
                <p className="text-orange-200 text-sm">{selectedOutlet.category} · {selectedOutlet.city}</p>
              </div>

              {redeemState === 'SUCCESS' && redeemResult ? (
                <div className="p-6 text-center space-y-4">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
                  <h3 className="text-white font-black text-lg">Redeemed! 🎉</h3>
                  <div className="bg-emerald-950/40 border border-emerald-800 rounded-xl p-4 space-y-1">
                    <p className="text-emerald-300 font-bold text-sm">{redeemResult.coupon?.title}</p>
                    <p className="text-slate-400 text-xs">{redeemResult.coupon?.description}</p>
                    {redeemResult.coupon?.playerName && (
                      <p className="text-slate-500 text-xs">Player: {redeemResult.coupon.playerName}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedOutlet(null)}
                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-black rounded-xl"
                  >
                    Done!
                  </button>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">
                      Enter Coupon / Voucher Code
                    </label>
                    <input
                      type="text"
                      value={redeemCode}
                      onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                      placeholder="e.g. FOOD-AB1234"
                      className="w-full bg-slate-800 border border-slate-700 focus:border-orange-500 text-white font-black tracking-widest text-center text-lg rounded-xl px-4 py-3 outline-none transition placeholder:text-slate-700 placeholder:font-normal placeholder:tracking-normal"
                    />
                  </div>

                  {redeemState === 'ERROR' && redeemMsg && (
                    <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl px-3 py-2">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{redeemMsg}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedOutlet(null)}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={redeemState === 'LOADING'}
                      onClick={() => handleRedeem(selectedOutlet)}
                      className="flex-1 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-white text-sm font-black rounded-xl transition"
                    >
                      {redeemState === 'LOADING' ? 'Verifying...' : 'Verify & Redeem'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
