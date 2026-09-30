import React from 'react';
import Link from 'next/link';
import { Trophy, Shield, MapPin, Mail, Phone, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Quick<span className="text-emerald-500">Court</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              The fastest way to discover sports facilities, reserve floodlit courts, and play with your local community.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>100% Verified Venues & Safe Checkout</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Popular Sports</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/venues?sport=Badminton" className="hover:text-emerald-400 transition">
                  Badminton Courts
                </Link>
              </li>
              <li>
                <Link href="/venues?sport=Box Cricket" className="hover:text-emerald-400 transition">
                  Box Cricket & Astroturf
                </Link>
              </li>
              <li>
                <Link href="/venues?sport=Tennis" className="hover:text-emerald-400 transition">
                  Lawn Tennis & Clay Courts
                </Link>
              </li>
              <li>
                <Link href="/venues?sport=Pickleball" className="hover:text-emerald-400 transition">
                  Pickleball Arenas
                </Link>
              </li>
              <li>
                <Link href="/venues?sport=Basketball" className="hover:text-emerald-400 transition">
                  FIBA Indoor Basketball
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">For Facility Owners</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/signup?role=OWNER" className="hover:text-emerald-400 transition">
                  List Your Sports Arena
                </Link>
              </li>
              <li>
                <Link href="/owner/dashboard" className="hover:text-emerald-400 transition">
                  Owner Management Dashboard
                </Link>
              </li>
              <li>
                <Link href="/owner/slots" className="hover:text-emerald-400 transition">
                  Slot & Maintenance Manager
                </Link>
              </li>
              <li>
                <Link href="/owner/facility" className="hover:text-emerald-400 transition">
                  Facility Profile & Photos
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Contact & Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Indiranagar & HSR Layout, Bangalore</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>support@quickcourt.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} QuickCourt Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for the Sports Community</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
