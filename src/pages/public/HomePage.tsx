import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTournamentDetails, getOverviewStats } from '../../services/tournamentService';
import { getAnnouncements } from '../../services/announcementService';
import { getLiveStream } from '../../services/streamService';
import { Tournament, Announcement, LiveStream } from '../../types';
import { Trophy, ShieldCheck, Users, Calendar, Radio, ArrowRight, Lock, Bell, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { formatDateTime } from '../../utils/formatters';

export const HomePage: React.FC = () => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stream, setStream] = useState<LiveStream | null>(null);

  useEffect(() => {
    async function loadData() {
      const tour = await getTournamentDetails();
      const st = await getOverviewStats();
      const anns = await getAnnouncements('all');
      const ls = await getLiveStream();
      setTournament(tour);
      setStats(st);
      setAnnouncements(anns.slice(0, 3));
      setStream(ls);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. HERO BANNER */}
      <section className="bg-gradient-to-b from-brand-50/60 to-white border-b border-surface-200 pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          
          {/* Live Indicator or Registration Badge */}
          <div className="flex items-center justify-center gap-2">
            {stream && stream.status === 'live' ? (
              <Link to="/live" className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600 text-white rounded-full text-xs font-bold animate-pulse shadow-sm">
                <Radio className="w-3.5 h-3.5" />
                LIVE STREAM BROADCAST ACTIVE — WATCH NOW
              </Link>
            ) : tournament?.is_registration_open ? (
              <Badge variant="success" size="md">
                ● REGISTRATIONS NOW OPEN
              </Badge>
            ) : (
              <Badge variant="info" size="md">
                ● TOURNAMENT IN PROGRESS
              </Badge>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-surface-900 tracking-tight max-w-4xl mx-auto leading-tight">
            {tournament?.name || 'REX BGMI PRO CHAMPIONSHIP 2026'}
          </h1>

          <p className="text-base sm:text-lg text-surface-600 max-w-2xl mx-auto leading-relaxed">
            {tournament?.description || 'Official Battlegrounds Mobile India esports tournament. Compete against top squads, track live schedules, receive round IDPs, and access private room credentials.'}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-card transition-all text-sm sm:text-base"
            >
              Register Your Squad
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/team"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-surface-50 text-surface-800 font-semibold rounded-xl border border-surface-300 shadow-subtle transition-all text-sm sm:text-base"
            >
              <Lock className="w-4 h-4 text-brand-600" />
              Team Portal Login
            </Link>

            {stream && stream.status === 'live' && (
              <Link
                to="/live"
                className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-card transition-all text-sm sm:text-base"
              >
                <Radio className="w-4 h-4" />
                Watch Broadcast
              </Link>
            )}
          </div>

        </div>
      </section>

      {/* 2. STATS OVERVIEW CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-surface-500 font-medium">Registered Squads</p>
              <p className="text-2xl font-bold text-surface-900">{stats?.totalTeams || 0}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-surface-500 font-medium">Confirmed Teams</p>
              <p className="text-2xl font-bold text-emerald-700">{stats?.approved || 0}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-surface-500 font-medium">Active Stage</p>
              <p className="text-lg font-bold text-surface-900 truncate">Round 3 Semi Finals</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-surface-500 font-medium">Prize Pool</p>
              <p className="text-xl font-bold text-brand-600">₹500,000 INR</p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. LATEST ANNOUNCEMENTS */}
      {announcements.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-surface-50 border border-surface-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-brand-600" />
                <h3 className="text-base font-bold text-surface-900">Official Announcements</h3>
              </div>
              <Link to="/announcements" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                View All Announcements <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="bg-white p-4 rounded-xl border border-surface-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {ann.priority === 'urgent' && <Badge variant="urgent">URGENT</Badge>}
                      <h4 className="text-sm font-semibold text-surface-900">{ann.title}</h4>
                    </div>
                    <p className="text-xs text-surface-600 line-clamp-1">{ann.content}</p>
                  </div>
                  <span className="text-[11px] text-surface-400 shrink-0">{formatDateTime(ann.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. HOW IT WORKS / COMPETITOR FLOW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-surface-900">Tournament Workflow</h2>
          <p className="text-sm text-surface-500 mt-1">Four simple steps from squad registration to grand finals victory</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-card text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center mx-auto text-sm">1</div>
            <h4 className="text-base font-semibold text-surface-900">Register Squad</h4>
            <p className="text-xs text-surface-500 leading-relaxed">Fill team logo, captain contact details, and IGN/UID for 4 players + 1 sub.</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-card text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center mx-auto text-sm">2</div>
            <h4 className="text-base font-semibold text-surface-900">Get Team Access Code</h4>
            <p className="text-xs text-surface-500 leading-relaxed">Organizers review and approve your squad, generating a secure 10-char Team Code (e.g. REX-7K4P9X).</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-card text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center mx-auto text-sm">3</div>
            <h4 className="text-base font-semibold text-surface-900">Access Team Portal</h4>
            <p className="text-xs text-surface-500 leading-relaxed">Log in at /team to view your Round + Group IDP document, match schedules, and room credentials.</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-card text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center mx-auto text-sm">4</div>
            <h4 className="text-base font-semibold text-surface-900">Compete & Stream</h4>
            <p className="text-xs text-surface-500 leading-relaxed">Join the lobby on time, play your matches, check realtime leaderboard updates, and watch the official broadcast.</p>
          </div>

        </div>
      </section>

    </div>
  );
};

