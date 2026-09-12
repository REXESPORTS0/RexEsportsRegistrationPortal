import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOverviewStats } from '../../services/tournamentService';
import { getAdminActivities } from '../../services/adminService';
import { 
  Users, ShieldCheck, Clock, XCircle, Trophy, Layers, Grid, 
  FileText, Calendar, Radio, Activity, ArrowRight 
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { formatDateTime } from '../../utils/formatters';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    getOverviewStats().then(setStats);
    getAdminActivities().then(setActivities);
  }, []);

  return (
    <div className="space-y-8 pb-10">
      
      {/* Title */}
      <div className="border-b border-surface-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">Tournament Control Center</h1>
          <p className="text-xs text-surface-500 mt-1">Realtime overview of team registrations, round stages, IDP publishing, and live streams.</p>
        </div>
        <Badge variant={stats?.streamStatus === 'live' ? 'live' : 'default'}>
          {stats?.streamStatus === 'live' ? '🔴 BROADCAST LIVE' : 'Broadcast Offline'}
        </Badge>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <Link to="/admin/teams" className="bg-white p-4 rounded-xl border border-surface-200 shadow-subtle hover:border-brand-400 transition-all">
          <span className="text-xs text-surface-500 font-medium block">Total Teams</span>
          <span className="text-2xl font-extrabold text-surface-900 mt-1 block">{stats?.totalTeams || 0}</span>
        </Link>

        <Link to="/admin/registrations" className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 shadow-subtle hover:bg-amber-50 transition-all">
          <span className="text-xs text-amber-700 font-medium block">Pending Review</span>
          <span className="text-2xl font-extrabold text-amber-900 mt-1 block">{stats?.pending || 0}</span>
        </Link>

        <Link to="/admin/teams" className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 shadow-subtle hover:bg-emerald-50 transition-all">
          <span className="text-xs text-emerald-700 font-medium block">Approved</span>
          <span className="text-2xl font-extrabold text-emerald-900 mt-1 block">{stats?.approved || 0}</span>
        </Link>

        <Link to="/admin/teams" className="bg-blue-50/50 p-4 rounded-xl border border-blue-200 shadow-subtle hover:bg-blue-50 transition-all">
          <span className="text-xs text-blue-700 font-medium block">Qualified</span>
          <span className="text-2xl font-extrabold text-blue-900 mt-1 block">{stats?.qualified || 0}</span>
        </Link>

        <Link to="/admin/idps" className="bg-white p-4 rounded-xl border border-surface-200 shadow-subtle hover:border-brand-400 transition-all">
          <span className="text-xs text-surface-500 font-medium block">Published IDPs</span>
          <span className="text-2xl font-extrabold text-brand-600 mt-1 block">{stats?.publishedIdps || 0}</span>
        </Link>

        <Link to="/admin/live" className="bg-white p-4 rounded-xl border border-surface-200 shadow-subtle hover:border-brand-400 transition-all">
          <span className="text-xs text-surface-500 font-medium block">Active Rounds</span>
          <span className="text-2xl font-extrabold text-surface-900 mt-1 block">{stats?.activeRounds || 0}</span>
        </Link>

      </div>

      {/* QUICK OPERATIONAL ACTION TILES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-surface-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              1. Approve Squad Registrations
            </h3>
            <Link to="/admin/registrations" className="text-xs font-semibold text-brand-600 hover:underline">Open</Link>
          </div>
          <p className="text-xs text-surface-500 leading-relaxed">
            Review submitted team rosters. Approving a team automatically generates their secure private Team Code (REX-XXXXXX).
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-surface-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              2. Upload & Publish Round IDP
            </h3>
            <Link to="/admin/idps" className="text-xs font-semibold text-brand-600 hover:underline">Open</Link>
          </div>
          <p className="text-xs text-surface-500 leading-relaxed">
            Upload PDF match instruction sheets for specific Round + Group. Authorized teams automatically see it in real time.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-surface-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-600" />
              3. Publish Room Credentials
            </h3>
            <Link to="/admin/room-details" className="text-xs font-semibold text-brand-600 hover:underline">Open</Link>
          </div>
          <p className="text-xs text-surface-500 leading-relaxed">
            Enter and publish Room ID & Password for matches. Teams assigned to that match receive instant credentials in Team Portal.
          </p>
        </div>

      </div>

      {/* RECENT ADMIN LOGS */}
      <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-surface-100 pb-3">
          <h3 className="text-sm font-bold text-surface-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-600" />
            Recent Admin Operational Activity
          </h3>
          <Link to="/admin/activity" className="text-xs font-semibold text-brand-600 hover:underline">View Full Log</Link>
        </div>

        <div className="space-y-2">
          {activities.slice(0, 5).map((act) => (
            <div key={act.id} className="p-3 bg-surface-50 rounded-lg border border-surface-200 text-xs flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-surface-900 mr-2">{act.action}</span>
                <span className="text-surface-600">{JSON.stringify(act.details)}</span>
              </div>
              <span className="text-[11px] text-surface-400 shrink-0">{formatDateTime(act.created_at)}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

