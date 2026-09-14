import React, { useState } from 'react';
import { useTeamAuth } from '../../context/TeamAuthContext';
import { useSupabaseRealtime } from '../../hooks/useSupabaseRealtime';
import { 
  Trophy, FileText, Calendar, Key, Bell, Radio, ExternalLink, 
  Copy, Check, ShieldCheck, Download, AlertCircle, Clock, MapPin, Eye 
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { formatDateTime } from '../../utils/formatters';

export const TeamDashboardPage: React.FC = () => {
  const { teamPortalData, activeTeamCode, refreshPortalData } = useTeamAuth();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Subscribe to Realtime push for IDPs, Schedules, Room Details, Assignments, Teams & Announcements
  useSupabaseRealtime(['idps', 'room_details', 'schedules', 'announcements', 'team_assignments', 'teams'], () => {
    refreshPortalData();
  });

  if (!teamPortalData) return null;

  const { team, players, assignment, idp, schedules, room_details, announcements } = teamPortalData;

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. TEAM IDENTITY HEADER CARD */}
      <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        <div className="flex items-center gap-4">
          <img
            src={team.logo_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=120&q=80'}
            alt={team.team_name}
            className="w-16 h-16 rounded-xl object-cover border border-surface-200 shadow-subtle shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-surface-900 leading-none">{team.team_name}</h1>
              <Badge variant={team.status === 'approved' || team.status === 'qualified' ? 'success' : 'warning'}>
                {team.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-surface-500 mt-1.5">
              Captain: <span className="font-bold text-surface-800">{team.captain_ign}</span> ({team.captain_name})
            </p>
          </div>
        </div>

        {/* Assigned Group Pill */}
        {assignment ? (
          <div className="bg-brand-50 border border-brand-200 px-4 py-3 rounded-xl text-left md:text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-brand-600 block tracking-wider">Current Stage Assignment</span>
            <p className="text-base font-extrabold text-brand-900 mt-0.5">
              {assignment.round_name} • <span className="text-brand-600">{assignment.group_name}</span>
            </p>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl text-xs text-amber-800 font-medium">
            Waiting for Round & Group Slot Assignment by Organizers
          </div>
        )}

      </div>

      {/* 2. ROUND + GROUP IDP DOCUMENT PANEL */}
      <section className="bg-white p-6 rounded-2xl border border-surface-200 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-surface-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-bold text-surface-900">Instruction & Match Data Sheet (IDP)</h2>
          </div>
          {assignment && (
            <span className="text-xs font-semibold text-surface-500 bg-surface-100 px-2.5 py-1 rounded-md">
              Target: {assignment.round_name} ({assignment.group_name})
            </span>
          )}
        </div>

        {!assignment ? (
          <p className="text-xs text-surface-500 italic">IDP documents become available once your team is assigned to a Round and Group.</p>
        ) : !idp ? (
          <div className="p-6 bg-surface-50 border border-surface-200 rounded-xl text-center space-y-2">
            <FileText className="w-8 h-8 text-surface-400 mx-auto" />
            <h4 className="text-sm font-semibold text-surface-800">No IDP Published Yet</h4>
            <p className="text-xs text-surface-500">
              The organizer has not uploaded the instruction sheet for {assignment.round_name} ({assignment.group_name}). You will receive a realtime update as soon as it is published.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-brand-50/50 border border-brand-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-brand-600 text-white text-[10px] font-bold rounded uppercase">Active IDP</span>
                <h3 className="text-sm font-bold text-surface-900">{idp.title}</h3>
              </div>
              <p className="text-xs text-surface-500">Last updated: {formatDateTime(idp.updated_at)}</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={idp.file_url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
              >
                <Eye className="w-4 h-4" />
                View Document
              </a>
              <a
                href={idp.file_url}
                download
                className="inline-flex items-center justify-center p-2 border border-surface-300 bg-white hover:bg-surface-50 text-surface-700 rounded-lg text-xs font-semibold"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </section>

      {/* 3. MATCH SCHEDULE & ROOM CREDENTIALS (PUBLISHED ROOM ID + PASSWORD) */}
      <section className="bg-white p-6 rounded-2xl border border-surface-200 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-surface-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-bold text-surface-900">Your Authorized Match Fixtures & Room Details</h2>
          </div>
        </div>

        {schedules.length === 0 ? (
          <p className="text-xs text-surface-500 italic">No matches scheduled for your group at this time.</p>
        ) : (
          <div className="space-y-4">
            {schedules.map((match) => {
              const room = room_details.find(rd => rd.schedule_id === match.id);
              return (
                <div key={match.id} className="p-5 bg-surface-50 rounded-xl border border-surface-200 space-y-4">
                  
                  {/* Fixture Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-brand-600 text-white font-extrabold text-xs flex items-center justify-center">
                        M{match.match_number}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-surface-900">{match.match_name}</h4>
                        <p className="text-xs text-surface-500 flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-600" /> {match.map_name}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-brand-600" /> {formatDateTime(match.date_time)}</span>
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 bg-white border border-surface-300 text-surface-700 text-xs font-semibold rounded-md self-start sm:self-auto">
                      {match.lobby_number || 'Lobby 1'}
                    </span>
                  </div>

                  {/* ROOM DETAILS BOX */}
                  <div className="bg-white p-4 rounded-xl border border-surface-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-surface-900">
                        <Key className="w-4 h-4 text-brand-600" />
                        Room ID & Password
                      </div>
                      {room ? (
                        <Badge variant="success" size="sm">● ROOM LIVE</Badge>
                      ) : (
                        <Badge variant="default" size="sm">Not Published</Badge>
                      )}
                    </div>

                    {!room ? (
                      <div className="text-xs text-surface-500 bg-surface-50 p-3 rounded-lg border border-surface-200 italic">
                        Room details not published. Organizers will publish credentials 15 minutes prior to match time.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        
                        {/* ROOM ID */}
                        <div className="p-3 bg-brand-50/70 border border-brand-200 rounded-lg flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-brand-600 block">Room ID</span>
                            <span className="text-base font-mono font-extrabold text-brand-900">{room.room_id}</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(room.room_id, `room_id_${match.id}`)}
                            className="px-2.5 py-1.5 bg-white border border-brand-200 hover:bg-brand-100 text-brand-700 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            {copiedField === `room_id_${match.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedField === `room_id_${match.id}` ? 'Copied' : 'Copy'}
                          </button>
                        </div>

                        {/* ROOM PASSWORD */}
                        <div className="p-3 bg-brand-50/70 border border-brand-200 rounded-lg flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-brand-600 block">Room Password</span>
                            <span className="text-base font-mono font-extrabold text-brand-900">{room.room_password}</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(room.room_password, `room_pass_${match.id}`)}
                            className="px-2.5 py-1.5 bg-white border border-brand-200 hover:bg-brand-100 text-brand-700 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            {copiedField === `room_pass_${match.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedField === `room_pass_${match.id}` ? 'Copied' : 'Copy'}
                          </button>
                        </div>

                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. TARGETED ANNOUNCEMENTS */}
      {announcements.length > 0 && (
        <section className="bg-white p-6 rounded-2xl border border-surface-200 shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-100 pb-3">
            <Bell className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-bold text-surface-900">Competitor Announcements</h2>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-4 bg-surface-50 border border-surface-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {ann.priority === 'urgent' && <Badge variant="urgent">URGENT</Badge>}
                    <h4 className="text-sm font-bold text-surface-900">{ann.title}</h4>
                  </div>
                  <span className="text-[11px] text-surface-400">{formatDateTime(ann.created_at)}</span>
                </div>
                <p className="text-xs text-surface-700 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. SQUAD ROSTER REVIEW */}
      <section className="bg-white p-6 rounded-2xl border border-surface-200 shadow-card space-y-4">
        <h2 className="text-lg font-bold text-surface-900 border-b border-surface-100 pb-3">Registered Squad Roster</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {players.map((p) => (
            <div key={p.id} className="p-3 bg-surface-50 border border-surface-200 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-surface-900">{p.ign}</span>
                {p.is_captain && <span className="px-1.5 py-0.5 bg-brand-100 text-brand-800 text-[10px] font-bold rounded">Captain</span>}
              </div>
              <p className="text-surface-500 font-mono text-[11px]">UID: {p.uid}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

