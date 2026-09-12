import React, { useState, useEffect } from 'react';
import { getTournamentDetails } from '../../services/tournamentService';
import { Tournament } from '../../types';
import { BookOpen, ShieldAlert, CheckCircle2, FileText } from 'lucide-react';

export const RulesPage: React.FC = () => {
  const [tournament, setTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    getTournamentDetails().then(setTournament);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="border-b border-surface-200 pb-6">
        <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">Official Rulebook & Code of Conduct</h1>
        <p className="text-sm text-surface-500 mt-1">
          Regulatory rules, scoring system, and penalty guidelines for REX BGMI Esports tournaments.
        </p>
      </div>

      {/* Scoring Table */}
      <section className="bg-white p-6 rounded-xl border border-surface-200 shadow-card space-y-4">
        <h2 className="text-xl font-bold text-surface-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-600" />
          Official Points System
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-surface-50 text-surface-600 border-b border-surface-200 uppercase font-semibold">
                <th className="py-2.5 px-4">Placement</th>
                <th className="py-2.5 px-4">Placement Points</th>
                <th className="py-2.5 px-4">Finish / Kill Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 text-surface-800">
              <tr>
                <td className="py-2.5 px-4 font-bold text-amber-700">1st (WWCD)</td>
                <td className="py-2.5 px-4 font-bold">10 Points</td>
                <td className="py-2.5 px-4 font-bold text-brand-600">+1 Point per Kill</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold text-slate-700">2nd Place</td>
                <td className="py-2.5 px-4 font-bold">6 Points</td>
                <td className="py-2.5 px-4 font-bold text-brand-600">+1 Point per Kill</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold text-amber-900">3rd Place</td>
                <td className="py-2.5 px-4 font-bold">5 Points</td>
                <td className="py-2.5 px-4 font-bold text-brand-600">+1 Point per Kill</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4">4th Place</td>
                <td className="py-2.5 px-4">4 Points</td>
                <td className="py-2.5 px-4 text-brand-600">+1 Point per Kill</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4">5th Place</td>
                <td className="py-2.5 px-4">3 Points</td>
                <td className="py-2.5 px-4 text-brand-600">+1 Point per Kill</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4">6th Place</td>
                <td className="py-2.5 px-4">2 Points</td>
                <td className="py-2.5 px-4 text-brand-600">+1 Point per Kill</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4">7th – 8th Place</td>
                <td className="py-2.5 px-4">1 Point</td>
                <td className="py-2.5 px-4 text-brand-600">+1 Point per Kill</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-surface-400">9th – 16th Place</td>
                <td className="py-2.5 px-4 text-surface-400">0 Points</td>
                <td className="py-2.5 px-4 text-brand-600">+1 Point per Kill</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Rules Content */}
      <section className="bg-white p-6 rounded-xl border border-surface-200 shadow-card space-y-4">
        <h2 className="text-xl font-bold text-surface-900">Tournament Rules & Guidelines</h2>
        
        <div className="prose prose-slate max-w-none text-xs leading-relaxed whitespace-pre-line text-surface-700">
          {tournament?.rules || `1. Player Eligibility: All players must be registered under their exact BGMI In-Game Name (IGN) and character UID.\n2. Room Joining: Room ID and Password will be published in your private Team Portal 15 minutes prior to match schedule.\n3. Disqualification: Playing with unapproved substitutes, using third-party hacks, modified APKs, or teaming will result in immediate squad elimination.\n4. Screenshot Submission: Captains are required to record match end-screen result screenshots.`}
        </div>
      </section>

    </div>
  );
};

