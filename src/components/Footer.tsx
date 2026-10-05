import React from 'react';
import Link from 'next/link';
import { Zap, CheckCircle2, MapPin, Mail, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-inverse-surface text-inverse-on-surface border-t border-surface-container-high/40 pt-16 pb-12">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-surface-variant/20">
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-lg bg-surface-variant/15 flex items-center justify-center text-primary-container shadow-md group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-headline-sm text-surface font-extrabold tracking-tight">
                  QuickCourt
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-md text-[10px] font-bold uppercase tracking-wider">
                  LIVE
                </span>
              </div>
            </Link>
            <p className="font-body-sm text-sm text-tertiary-fixed leading-relaxed">
              The fastest way to discover sports facilities, reserve floodlit courts, and play with your local community. Zero double-booking guarantee.
            </p>
            <div className="flex items-center gap-2 text-xs text-primary-fixed font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% Verified Venues &amp; Instant Digital Passes</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-label-md text-xs font-bold text-surface uppercase tracking-wider mb-4">
              Explore Disciplines
            </h4>
            <ul className="space-y-2.5 font-body-sm text-sm text-tertiary-fixed">
              <li>
                <Link href="/venues?sport=badminton" className="hover:text-primary-container transition-colors">
                  Badminton (BWF Synthetic)
                </Link>
              </li>
              <li>
                <Link href="/venues?sport=box-cricket" className="hover:text-primary-container transition-colors">
                  Box Cricket &amp; Roofed Turfs
                </Link>
              </li>
              <li>
                <Link href="/venues?sport=pickleball" className="hover:text-primary-container transition-colors flex items-center gap-1.5">
                  <span>Pickleball Clubs</span>
                  <span className="px-1.5 py-0.2 rounded bg-primary-container text-on-primary-container text-[10px] font-bold">HOT</span>
                </Link>
              </li>
              <li>
                <Link href="/venues?sport=tennis" className="hover:text-primary-container transition-colors">
                  Lawn Tennis &amp; Clay Courts
                </Link>
              </li>
              <li>
                <Link href="/karting" className="hover:text-primary-container transition-colors">
                  Go-Karting Circuits
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-label-md text-xs font-bold text-surface uppercase tracking-wider mb-4">
              Facility Partners
            </h4>
            <ul className="space-y-2.5 font-body-sm text-sm text-tertiary-fixed">
              <li>
                <Link href="/owner/signup" className="hover:text-primary-container transition-colors">
                  List Your Sports Arena
                </Link>
              </li>
              <li>
                <Link href="/owner/dashboard" className="hover:text-primary-container transition-colors">
                  Operations Overview Matrix
                </Link>
              </li>
              <li>
                <Link href="/owner/slots" className="hover:text-primary-container transition-colors">
                  Slot Schedules &amp; Maintenance
                </Link>
              </li>
              <li>
                <Link href="/owner/courts" className="hover:text-primary-container transition-colors">
                  Court Inventory &amp; Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="font-label-md text-xs font-bold text-surface uppercase tracking-wider mb-4">
              Local HQ &amp; Support
            </h4>
            <ul className="space-y-2.5 font-body-sm text-sm text-tertiary-fixed">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Koramangala &amp; HSR Layout, Bengaluru</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@quickcourt.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Support Hours: 06:00 AM – 11:30 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-body-sm text-xs text-tertiary-fixed">
          <div>
            © {new Date().getFullYear()} QuickCourt Technologies India. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-surface transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-surface transition-colors">Terms of Service</Link>
            <Link href="/rewards" className="hover:text-surface transition-colors">Athlete Rewards</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
