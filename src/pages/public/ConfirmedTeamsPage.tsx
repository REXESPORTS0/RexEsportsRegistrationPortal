import React, { useState, useEffect } from 'react';
import { getConfirmedTeams, getRoundsAndGroups } from '../../services/teamService';
import { Team, Round, Group } from '../../types';
import { Search, Shield, Users, Trophy, Filter } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const ConfirmedTeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedRound, setSelectedRound] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getConfirmedTeams(search, selectedRound, selectedGroup);
      const rg = await getRoundsAndGroups();
      setTeams(data);
      setRounds(rg.rounds);
      setGroups(rg.groups);
      setLoading(false);
    }
    load();
  }, [search, selectedRound, selectedGroup]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="border-b border-surface-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">Confirmed Squads</h1>
          <p className="text-sm text-surface-500 mt-1">
            Approved teams competing in REX BGMI Pro Championship 2026.
          </p>
        </div>
        <div className="px-3.5 py-1.5 bg-brand-50 border border-brand-200 rounded-lg text-xs font-bold text-brand-700 self-start sm:self-auto">
          Total Confirmed: {teams.length} Squads
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search by team name or IGN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-surface-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        {/* Round & Group Select */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs text-surface-500 font-semibold shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </div>

          <select
            value={selectedRound}
            onChange={(e) => {
              setSelectedRound(e.target.value);
              setSelectedGroup('');
            }}
            className="px-3 py-2 border border-surface-300 rounded-lg text-xs text-surface-700 bg-white focus:outline-none"
          >
            <option value="">All Rounds</option>
            {rounds.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-3 py-2 border border-surface-300 rounded-lg text-xs text-surface-700 bg-white focus:outline-none"
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

      {/* Grid of Confirmed Teams */}
      {loading ? (
        <LoadingSpinner text="Fetching Confirmed Squads..." />
      ) : teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Confirmed Teams Found"
          description="No approved teams match your current search or group filters."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div key={team.id} className="bg-white p-5 rounded-xl border border-surface-200 shadow-card hover:shadow-card-hover transition-all space-y-4">
              
              {/* Header: Logo & Status */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={team.logo_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=120&q=80'}
                    alt={team.team_name}
                    className="w-10 h-10 rounded-lg object-cover border border-surface-200"
                  />
                  <div>
                    <h3 className="text-base font-bold text-surface-900 leading-none">{team.team_name}</h3>
                    <span className="text-xs text-surface-500 mt-1 block">Capt: {team.captain_ign}</span>
                  </div>
                </div>

                <Badge variant={team.status === 'qualified' ? 'info' : 'success'} size="sm">
                  {team.status === 'qualified' ? 'Qualified' : 'Approved'}
                </Badge>
              </div>

              {/* Assignment info */}
              {team.assignment ? (
                <div className="px-3 py-1.5 bg-surface-50 rounded-lg border border-surface-200 text-xs flex items-center justify-between text-surface-700">
                  <span className="font-medium">{team.assignment.round_name}</span>
                  <span className="font-bold text-brand-600">{team.assignment.group_name}</span>
                </div>
              ) : (
                <div className="px-3 py-1.5 bg-surface-50 rounded-lg border border-surface-200 text-xs text-surface-400 italic">
                  Group Assignment Pending
                </div>
              )}

              {/* Player Rosters */}
              {team.players && team.players.length > 0 && (
                <div className="pt-2 border-t border-surface-100 space-y-1.5">
                  <p className="text-[10px] uppercase font-bold text-surface-400 tracking-wider">Roster IGNs</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {team.players.map((p) => (
                      <div key={p.id} className="text-xs text-surface-700 truncate bg-surface-50 px-2 py-1 rounded">
                        {p.is_captain && <span className="text-brand-600 font-bold mr-1">[C]</span>}
                        {p.ign}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

