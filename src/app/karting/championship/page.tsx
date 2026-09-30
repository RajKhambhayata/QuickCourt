'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, ChevronLeft, Flag, Medal, Zap, Clock, CheckCircle2, CalendarClock } from 'lucide-react';

interface Standing {
  id: string;
  teamName: string | null;
  points: number;
  podiums: number;
  fastestLaps: number;
  rank: number;
  player?: { name: string } | null;
}

interface Round {
  round: number;
  name: string;
  track: string;
  status: 'COMPLETED' | 'UPCOMING' | 'LIVE';
  winner?: string;
  date?: string;
}

interface Season {
  id: string;
  name: string;
  sport: string;
  pointsRule: string;
  startDate: string;
  rounds: Round[];
}

interface ScoringRow {
  pos: string;
  pts: number | string;
}

const POSITION_STYLES = [
  'from-amber-700/70 to-yellow-800/40 border-yellow-600/60 text-yellow-300',
  'from-slate-600/70 to-slate-700/40 border-slate-500/60 text-slate-200',
  'from-amber-800/70 to-amber-900/40 border-amber-700/60 text-amber-400',
];

export default function ChampionshipPage() {
  const [season, setSeason] = useState<Season | null>(null);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [scoring, setScoring] = useState<ScoringRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScoring, setShowScoring] = useState(false);

  useEffect(() => {
    fetch('/api/seasons/standings')
      .then((r) => r.json())
      .then((d) => {
        if (d.season) setSeason(d.season);
        if (d.standings) setStandings(d.standings);
        if (d.scoringTable) setScoring(d.scoringTable);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading championship data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/karting" className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition">
            <ChevronLeft className="w-4 h-4 text-slate-300" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              {season ? season.name : 'F1 Championship'}
            </h1>
            <p className="text-xs text-slate-400">
              {season ? `${season.sport} · F1 Points System` : 'No active season'}
            </p>
          </div>
        </div>

        {!season ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <Trophy className="w-12 h-12 text-slate-700 mx-auto" />
            <p className="text-slate-400">No active championship season</p>
            <Link href="/karting" className="inline-block px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl">
              View Karting Heats
            </Link>
          </div>
        ) : (
          <>
            {/* Podium Top 3 */}
            {standings.length >= 3 && (
              <div className="flex items-end justify-center gap-3">
                {/* 2nd */}
                <div className="flex-1 max-w-[140px]">
                  <div className="bg-gradient-to-br from-slate-600/70 to-slate-700/40 border border-slate-500/60 rounded-2xl p-3 text-center space-y-1 h-28 flex flex-col justify-end">
                    <div className="text-3xl">🥈</div>
                    <p className="text-slate-200 font-black text-xs leading-tight">
                      {standings[1]?.teamName || standings[1]?.player?.name || '—'}
                    </p>
                    <p className="text-amber-400 font-black text-sm">{standings[1]?.points}pts</p>
                  </div>
                </div>
                {/* 1st */}
                <div className="flex-1 max-w-[160px] -mb-2">
                  <div className="bg-gradient-to-br from-amber-700/70 to-yellow-800/40 border border-yellow-600/60 rounded-2xl p-4 text-center space-y-1 h-36 flex flex-col justify-end shadow-xl shadow-amber-900/30">
                    <div className="text-4xl">🥇</div>
                    <p className="text-yellow-300 font-black text-sm leading-tight">
                      {standings[0]?.teamName || standings[0]?.player?.name || '—'}
                    </p>
                    <p className="text-amber-300 font-black text-base">{standings[0]?.points}pts</p>
                  </div>
                </div>
                {/* 3rd */}
                <div className="flex-1 max-w-[140px]">
                  <div className="bg-gradient-to-br from-amber-800/70 to-amber-900/40 border border-amber-700/60 rounded-2xl p-3 text-center space-y-1 h-24 flex flex-col justify-end">
                    <div className="text-3xl">🥉</div>
                    <p className="text-amber-400 font-black text-xs leading-tight">
                      {standings[2]?.teamName || standings[2]?.player?.name || '—'}
                    </p>
                    <p className="text-amber-400 font-black text-sm">{standings[2]?.points}pts</p>
                  </div>
                </div>
              </div>
            )}

            {/* Full Standings Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-4 border-b border-slate-800">
                <h2 className="text-white font-black text-sm flex items-center gap-2">
                  <Medal className="w-4 h-4 text-amber-400" /> Constructor Standings
                </h2>
              </div>
              <div className="divide-y divide-slate-800/60">
                <div className="grid grid-cols-5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
                  <span>Pos</span>
                  <span className="col-span-2">Team</span>
                  <span className="text-center">Podiums</span>
                  <span className="text-right">Points</span>
                </div>
                {standings.map((s, idx) => (
                  <div key={s.id} className={`grid grid-cols-5 px-4 py-3 items-center ${idx < 3 ? 'bg-amber-950/10' : ''}`}>
                    <span className={`font-black text-sm ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-600'}`}>
                      P{s.rank}
                    </span>
                    <span className="col-span-2 text-white font-bold text-xs">
                      {s.teamName || s.player?.name || 'Anonymous'}
                      {s.fastestLaps > 0 && (
                        <span className="ml-2 text-[10px] text-violet-400 font-black">⚡ {s.fastestLaps} FL</span>
                      )}
                    </span>
                    <span className="text-center text-slate-400 text-xs">{s.podiums}</span>
                    <span className="text-right text-white font-black text-sm">{s.points}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Race Calendar */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-4 border-b border-slate-800">
                <h2 className="text-white font-black text-sm flex items-center gap-2">
                  <Flag className="w-4 h-4 text-rose-400" /> Race Calendar
                </h2>
              </div>
              <div className="divide-y divide-slate-800/60">
                {season.rounds.map((round) => (
                  <div key={round.round} className="px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-black text-slate-400">R{round.round}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-xs">{round.name}</p>
                      <p className="text-slate-500 text-[11px]">{round.track}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {round.status === 'COMPLETED' ? (
                        <div className="space-y-0.5">
                          <span className="text-emerald-400 text-[10px] font-black flex items-center gap-0.5 justify-end">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                          {round.winner && (
                            <p className="text-yellow-400 text-[11px] font-semibold">🏆 {round.winner}</p>
                          )}
                        </div>
                      ) : round.status === 'LIVE' ? (
                        <span className="text-rose-400 text-[10px] font-black flex items-center gap-1 animate-pulse">
                          <Zap className="w-3 h-3" /> LIVE
                        </span>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="text-slate-500 text-[10px] font-bold flex items-center gap-0.5 justify-end">
                            <CalendarClock className="w-3 h-3" /> Upcoming
                          </span>
                          {round.date && <p className="text-slate-400 text-[11px]">{round.date}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* F1 Scoring System */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3"
                onClick={() => setShowScoring(!showScoring)}
              >
                <span className="text-slate-300 font-bold text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> F1 Points System
                </span>
                <ChevronLeft className={`w-4 h-4 text-slate-500 transition-transform ${showScoring ? '-rotate-90' : 'rotate-180'}`} />
              </button>
              {showScoring && (
                <div className="px-4 pb-4 grid grid-cols-4 gap-2">
                  {scoring.map((s) => (
                    <div key={s.pos} className="bg-slate-800 rounded-xl p-2 text-center">
                      <p className="text-slate-500 text-[11px]">{s.pos}</p>
                      <p className="text-white font-black text-sm">{s.pts}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
