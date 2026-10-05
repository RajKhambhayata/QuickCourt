'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SPORTS_LIST, CITIES_LIST } from '@/lib/constants';
import { Search, X, MapPin, ArrowRight, CornerDownLeft } from 'lucide-react';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickSearchModal({ isOpen, onClose }: QuickSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isMac, setIsMac] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMac(typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or if mounted globally
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const matchingSports = SPORTS_LIST.filter(
    (s) =>
      !trimmed ||
      s.name.toLowerCase().includes(trimmed) ||
      s.slug.toLowerCase().includes(trimmed)
  );

  const matchingCities = CITIES_LIST.filter(
    (c) => !trimmed || c.toLowerCase().includes(trimmed)
  );

  const handleSelectSport = (slug: string) => {
    router.push(`/venues?sport=${encodeURIComponent(slug)}`);
    onClose();
  };

  const handleSelectCity = (city: string) => {
    router.push(`/venues?city=${encodeURIComponent(city)}`);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/venues?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 pt-16 sm:pt-24 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <form onSubmit={handleSubmit} className="flex items-center px-4 py-3.5 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sports, venues, or cities..."
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 rounded border border-slate-200">
              ESC
            </kbd>
          )}
        </form>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Sports Section */}
          {matchingSports.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Sports &amp; Turfs
              </div>
              <div className="space-y-1">
                {matchingSports.map((sport) => (
                  <button
                    key={sport.slug}
                    onClick={() => handleSelectSport(sport.slug)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-50 transition group text-xs font-semibold text-slate-700"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-base">{sport.icon}</span>
                      <span>{sport.name}</span>
                    </span>
                    <span className="text-slate-400 group-hover:text-emerald-600 flex items-center gap-1 text-[11px]">
                      View venues <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cities Section */}
          {matchingCities.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Popular Cities
              </div>
              <div className="grid grid-cols-2 gap-1">
                {matchingCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleSelectCity(city)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-slate-50 transition text-xs font-semibold text-slate-700"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{city}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fallback general search */}
          {query.trim() && (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={handleSubmit}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition"
              >
                <span>Search all arenas for &ldquo;{query.trim()}&rdquo;</span>
                <CornerDownLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Navigate with mouse or tap</span>
          <span>
            Shortcut: <kbd className="font-mono">{isMac ? '⌘K' : 'Ctrl+K'}</kbd>
          </span>
        </div>
      </div>
    </div>
  );
}
