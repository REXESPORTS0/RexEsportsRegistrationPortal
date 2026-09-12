import React, { useState, useEffect } from 'react';
import { getSchedules } from '../../services/scheduleService';
import { getRoundsAndGroups } from '../../services/teamService';
import { Schedule, Round, Group } from '../../types';
import { Calendar, MapPin, Clock, Filter, Layers, Grid } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const MatchSchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedRound, setSelectedRound] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getSchedules(selectedRound, selectedGroup);
      const rg = await getRoundsAndGroups();
      setSchedules(data);
      setRounds(rg.rounds);
      setGroups(rg.groups);
      setLoading(false);
    }
    load();
  }, [selectedRound, selectedGroup]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="border-b border-surface-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">Match Schedule</h1>
          <p className="text-sm text-surface-500 mt-1">
            Official match fixtures, lobby numbers, maps, and timings.
          </p>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3">
          <select
            value={selectedRound}
            onChange={(e) => {
              setSelectedRound(e.target.value);
              setSelectedGroup('');
            }}
            className="px-3 py-2 border border-surface-300 rounded-lg text-xs font-semibold text-surface-700 bg-white focus:outline-none"
          >
            <option value="">All Rounds</option>
            {rounds.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-3 py-2 border border-surface-300 rounded-lg text-xs font-semibold text-surface-700 bg-white focus:outline-none"
          >
            <option value="">All Groups</option>
            {groups
              .filter(g => !selectedRound || g.round_id === selectedRound)
              .map(g => (
                <option key={g.id} value={g.id}>{g.group_name}</option>
              ))}
          </select>
        </div>
      </div>

      {/* Schedules List */}
      {loading ? (
        <LoadingSpinner text="Loading Match Schedule..." />
      ) : schedules.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Published Matches Found"
          description="Tournament organizers have not published schedules for the selected round and group."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schedules.map((match) => (
            <div key={match.id} className="bg-white p-6 rounded-xl border border-surface-200 shadow-card space-y-4">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 font-bold text-xs flex items-center justify-center border border-brand-200">
                    M{match.match_number}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-surface-900">{match.match_name}</h3>
                    <p className="text-xs text-surface-500">{match.round_name} • {match.group_name}</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-surface-100 border border-surface-200 text-surface-700 text-xs font-bold rounded-md">
                  {match.lobby_number || 'Lobby 1'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2 bg-surface-50 p-2.5 rounded-lg border border-surface-200">
                  <Clock className="w-4 h-4 text-brand-600 shrink-0" />
                  <div>
                    <span className="text-surface-400 block text-[10px]">Match Start Time</span>
                    <span className="font-semibold text-surface-900">{formatDateTime(match.date_time)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-surface-50 p-2.5 rounded-lg border border-surface-200">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-surface-400 block text-[10px]">Map Location</span>
                    <span className="font-bold text-surface-900">{match.map_name}</span>
                  </div>
                </div>
              </div>

              {match.notes && (
                <p className="text-xs text-surface-600 bg-amber-50/60 border border-amber-200 p-3 rounded-lg leading-relaxed">
                  <strong className="text-amber-800">Organizer Note:</strong> {match.notes}
                </p>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

