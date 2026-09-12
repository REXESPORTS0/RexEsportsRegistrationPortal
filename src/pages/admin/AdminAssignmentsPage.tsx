import React, { useState, useEffect } from 'react';
import { getAllRegistrations, getRoundsAndGroups, assignTeamToGroup, autoAssignTeamsToGroups } from '../../services/teamService';
import { logAdminActivity } from '../../services/adminService';
import { Team, Round, Group } from '../../types';
import { UserPlus, Sparkles, Check } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const AdminAssignmentsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [targetRound, setTargetRound] = useState('');
  const [targetGroup, setTargetGroup] = useState('');
  const [slotNum, setSlotNum] = useState(1);
  const [autoStatus, setAutoStatus] = useState<string | null>(null);

  async function load() {
    const data = await getAllRegistrations('all');
    const rg = await getRoundsAndGroups();
    setTeams(data.filter(t => t.status === 'approved' || t.status === 'qualified'));
    setRounds(rg.rounds);
    setGroups(rg.groups);
    if (rg.rounds.length > 0 && !targetRound) setTargetRound(rg.rounds[0].id);
  }

  useEffect(() => {
    load();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTeam && targetRound && targetGroup) {
      await assignTeamToGroup(selectedTeam.id, targetRound, targetGroup, Number(slotNum));
      await logAdminActivity('ASSIGNED_TEAM_GROUP', {
        team_name: selectedTeam.team_name,
        round_id: targetRound,
        group_id: targetGroup,
        slot: slotNum
      });
      setSelectedTeam(null);
      load();
    }
  };

  const handleAutoAssign = async () => {
    if (!targetRound) return;
    const roundObj = rounds.find(r => r.id === targetRound);
    if (confirm(`Auto-assign all unassigned approved teams to available groups in ${roundObj?.name || 'this round'}?`)) {
      const res = await autoAssignTeamsToGroups(targetRound);
      await logAdminActivity('AUTO_ASSIGNED_TEAMS', { round_id: targetRound, count: res.assignedCount });
      setAutoStatus(`Successfully auto-slotted ${res.assignedCount} teams into groups!`);
      setTimeout(() => setAutoStatus(null), 4000);
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-surface-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">Team Slot & Group Assignment System</h1>
          <p className="text-xs text-surface-500 mt-1">Slot approved teams into specific Round + Group lobbies (Slot 1 through 20) manually or via 1-click Auto-Slotting.</p>
        </div>

        <button
          onClick={handleAutoAssign}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" /> 1-Click Auto-Slot Unassigned Teams
        </button>
      </div>

      {autoStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{autoStatus}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-surface-200 shadow-card overflow-hidden">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-surface-50 text-surface-600 border-b border-surface-200 font-semibold uppercase">
              <th className="py-3 px-4">Approved Squad</th>
              <th className="py-3 px-4">Captain IGN</th>
              <th className="py-3 px-4">Current Stage Assignment</th>
              <th className="py-3 px-4">Lobby Slot #</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 text-surface-800">
            {teams.map(team => (
              <tr key={team.id} className="hover:bg-surface-50">
                <td className="py-3 px-4 font-bold text-surface-900">{team.team_name}</td>
                <td className="py-3 px-4">{team.captain_ign}</td>
                <td className="py-3 px-4">
                  {team.assignment ? (
                    <span className="px-2 py-1 bg-brand-50 border border-brand-200 text-brand-800 font-bold rounded">
                      {team.assignment.round_name} • {team.assignment.group_name}
                    </span>
                  ) : (
                    <span className="text-surface-400 italic">Unassigned</span>
                  )}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-surface-700">
                  {team.assignment ? `Slot #${team.assignment.slot_number || 1}` : '—'}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => {
                      setSelectedTeam(team);
                      if (team.assignment) {
                        setTargetRound(team.assignment.round_id);
                        setTargetGroup(team.assignment.group_id);
                        setSlotNum(team.assignment.slot_number || 1);
                      }
                    }}
                    className="px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded text-xs inline-flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Slot Team
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={Boolean(selectedTeam)} onClose={() => setSelectedTeam(null)} title={`Assign ${selectedTeam?.team_name}`}>
        <form onSubmit={handleAssign} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-surface-700 mb-1">Target Round</label>
            <select
              value={targetRound}
              onChange={(e) => {
                setTargetRound(e.target.value);
                setTargetGroup('');
              }}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg text-xs"
            >
              {rounds.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-surface-700 mb-1">Target Group</label>
            <select
              value={targetGroup}
              onChange={(e) => setTargetGroup(e.target.value)}
              required
              className="w-full px-3 py-2 border border-surface-300 rounded-lg text-xs"
            >
              <option value="">Select Group...</option>
              {groups.filter(g => g.round_id === targetRound).map(g => (
                <option key={g.id} value={g.id}>{g.group_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-surface-700 mb-1">Lobby Slot Number (Slot 1 to 20)</label>
            <select
              value={slotNum}
              onChange={(e) => setSlotNum(Number(e.target.value))}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg text-xs font-mono font-bold"
            >
              {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>Slot #{num}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="w-full py-2 bg-brand-600 text-white font-bold rounded-lg text-xs">
            Confirm Slot Assignment
          </button>
        </form>
      </Modal>
    </div>
  );
};
