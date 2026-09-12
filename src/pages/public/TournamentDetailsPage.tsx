import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTournamentDetails } from '../../services/tournamentService';
import { Tournament } from '../../types';
import { Trophy, Calendar, CheckCircle2, Shield, ArrowRight, Award } from 'lucide-react';

export const TournamentDetailsPage: React.FC = () => {
  const [tournament, setTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    getTournamentDetails().then(setTournament);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title Header */}
      <div className="border-b border-surface-200 pb-6">
        <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">
          {tournament?.name || 'REX BGMI PRO CHAMPIONSHIP 2026'} — Tournament Details
        </h1>
        <p className="text-sm text-surface-500 mt-2">
          Comprehensive tournament overview, format roadmap, prize pool distribution, and competitor eligibility.
        </p>
      </div>

      {/* Prize Pool Breakdown */}
      <section className="bg-white p-6 rounded-xl border border-surface-200 shadow-card">
        <div className="flex items-center gap-2 mb-6">
          <Award className="w-6 h-6 text-brand-600" />
          <h2 className="text-xl font-bold text-surface-900">Prize Pool Distribution (₹500,000 INR)</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-center">
            <span className="text-xs uppercase font-bold text-amber-700 block">1st Place Champions</span>
            <span className="text-2xl font-extrabold text-amber-900 mt-1 block">₹250,000</span>
            <span className="text-[11px] text-amber-600">Trophy + Winner Medals</span>
          </div>

          <div className="p-4 rounded-lg bg-slate-100 border border-slate-200 text-center">
            <span className="text-xs uppercase font-bold text-slate-700 block">2nd Place Runner Up</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">₹125,000</span>
            <span className="text-[11px] text-slate-600">Runner Up Trophy</span>
          </div>

          <div className="p-4 rounded-lg bg-amber-900/10 border border-amber-900/20 text-center">
            <span className="text-xs uppercase font-bold text-amber-900 block">3rd Place</span>
            <span className="text-2xl font-extrabold text-amber-950 mt-1 block">₹75,000</span>
            <span className="text-[11px] text-amber-900/80">Podium Finisher</span>
          </div>

          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-center">
            <span className="text-xs uppercase font-bold text-blue-700 block">MVP Player</span>
            <span className="text-2xl font-extrabold text-blue-900 mt-1 block">₹50,000</span>
            <span className="text-[11px] text-blue-600">Most Kills Award</span>
          </div>
        </div>
      </section>

      {/* Tournament Format & Progression Roadmap */}
      <section className="bg-white p-6 rounded-xl border border-surface-200 shadow-card space-y-6">
        <h2 className="text-xl font-bold text-surface-900">Tournament Stages</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-4 bg-surface-50 rounded-lg border border-surface-200 space-y-2">
            <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded">STAGE 1</span>
            <h4 className="text-base font-bold text-surface-900">Round 1 Qualifiers</h4>
            <p className="text-xs text-surface-600 leading-relaxed">Open registration squads divided into 32 groups. Top 4 teams per group advance.</p>
          </div>

          <div className="p-4 bg-surface-50 rounded-lg border border-surface-200 space-y-2">
            <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded">STAGE 2</span>
            <h4 className="text-base font-bold text-surface-900">Quarter Finals</h4>
            <p className="text-xs text-surface-600 leading-relaxed">128 qualified teams split into 8 groups playing 3 matches on Erangel & Miramar.</p>
          </div>

          <div className="p-4 bg-brand-50 rounded-lg border border-brand-200 space-y-2">
            <span className="px-2 py-0.5 bg-brand-600 text-white text-[10px] font-bold rounded">STAGE 3 (ACTIVE)</span>
            <h4 className="text-base font-bold text-brand-900">Semi Finals</h4>
            <p className="text-xs text-brand-700 leading-relaxed">Top 32 teams divided into Groups A & B. Match schedules & IDPs published per group.</p>
          </div>

          <div className="p-4 bg-surface-50 rounded-lg border border-surface-200 space-y-2">
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">STAGE 4</span>
            <h4 className="text-base font-bold text-surface-900">Grand Finals</h4>
            <p className="text-xs text-surface-600 leading-relaxed">Top 16 elite squads compete in 12 final matches over 2 live streamed broadcast days.</p>
          </div>
        </div>
      </section>

      {/* Rules & Eligibility summary */}
      <section className="bg-white p-6 rounded-xl border border-surface-200 shadow-card">
        <h2 className="text-xl font-bold text-surface-900 mb-4">Eligibility & Registration Requirements</h2>
        <ul className="space-y-3 text-sm text-surface-700">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span>Squads must consist of exactly 4 starting players with 1 optional substitute.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span>All players must provide accurate BGMI In-game Name (IGN) and BGMI Character ID (UID).</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span>Captains must provide valid 10-digit mobile contact number for emergency coordinator updates.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span>Playing on third-party emulators, iPads/tablets (if restricted by round), or using modified APKs will lead to lifetime organization ban.</span>
          </li>
        </ul>

        <div className="pt-6 mt-6 border-t border-surface-100 flex items-center justify-between">
          <Link to="/rules" className="text-xs font-semibold text-brand-600 hover:text-brand-700">Read Full Official Rulebook →</Link>
          <Link to="/register" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700">Register Squad Now</Link>
        </div>
      </section>

    </div>
  );
};

