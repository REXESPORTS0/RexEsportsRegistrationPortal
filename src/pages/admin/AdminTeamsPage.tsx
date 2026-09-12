import React, { useState, useEffect } from 'react';
import { getAllRegistrations, updateTeamStatus, regenerateTeamCode, updateTeamDetails, deleteTeam } from '../../services/teamService';
import { logAdminActivity } from '../../services/adminService';
import { Team } from '../../types';
import { RefreshCw, Search, Edit2, Trash2, Key, Copy } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const AdminTeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [codeModal, setCodeModal] = useState<{ teamName: string; code: string } | null>(null);
  const [editTeam, setEditTeam] = useState<Team | null>(null);

  const [teamName, setTeamName] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [captainIgn, setCaptainIgn] = useState('');
  const [captainUid, setCaptainUid] = useState('');
  const [captainContact, setCaptainContact] = useState('');

  async function loadData() {
    setLoading(true);
    const data = await getAllRegistrations('all');
    setTeams(data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleRegenerateCode = async (team: Team) => {
    if (confirm(`Regenerate new secure Team Code for ${team.team_name}? The old code will be revoked.`)) {
      const res = await regenerateTeamCode(team.id);
      if (res.success && res.new_code) {
        await logAdminActivity('REGENERATED_TEAM_CODE', { team_id: team.id, team_name: team.team_name, new_code: res.new_code });
        setCodeModal({ teamName: team.team_name, code: res.new_code });
        loadData();
      }
    }
  };

  const handleStatusChange = async (teamId: string, newStatus: Team['status']) => {
    await updateTeamStatus(teamId, newStatus);
    await logAdminActivity('CHANGED_TEAM_STATUS', { team_id: teamId, status: newStatus });
    loadData();
  };

  const handleSaveTeamDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editTeam && teamName.trim()) {
      await updateTeamDetails(editTeam.id, {
        team_name: teamName.trim(),
        captain_name: captainName.trim(),
        captain_ign: captainIgn.trim(),
        captain_uid: captainUid.trim(),
        captain_contact: captainContact.trim()
      });
      await logAdminActivity('UPDATED_TEAM_DETAILS', { team_id: editTeam.id, team_name: teamName });
      setEditTeam(null);
      loadData();
    }
  };

  const handleDeleteTeam = async (teamId: string, name: string) => {
    if (confirm(`Delete team "${name}" and all its player records? This action cannot be undone.`)) {
      await deleteTeam(teamId);
      await logAdminActivity('DELETED_TEAM', { team_id: teamId, team_name: name });
      loadData();
    }
  };

  const openEditModal = (t: Team) => {
    setEditTeam(t);
    setTeamName(t.team_name);
    setCaptainName(t.captain_name);
    setCaptainIgn(t.captain_ign);
    setCaptainUid(t.captain_uid);
    setCaptainContact(t.captain_contact);
  };

  const filteredTeams = teams.filter(t => 
    t.team_name.toLowerCase().includes(search.toLowerCase()) ||
    t.captain_ign.toLowerCase().includes(search.toLowerCase()) ||
    t.team_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      <div className="border-b border-surface-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">Teams Directory & Code Management</h1>
          <p className="text-xs text-surface-500 mt-1">Manage team access codes, edit team details, regenerate revoked codes, or delete teams.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search team or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-surface-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-surface-50 text-surface-600 border-b border-surface-200 font-semibold uppercase">
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-4">Captain Info</th>
                <th className="py-3 px-4">Private Team Code</th>
                <th className="py-3 px-4">Stage Assignment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 text-surface-800">
              {filteredTeams.map((team) => (
                <tr key={team.id} className="hover:bg-surface-50/60 transition-colors">
                  
                  <td className="py-3 px-4 font-bold text-surface-900 flex items-center gap-2">
                    <img
                      src={team.logo_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=120&q=80'}
                      alt={team.team_name}
                      className="w-7 h-7 rounded object-cover border border-surface-200"
                    />
                    {team.team_name}
                  </td>

                  <td className="py-3 px-4 font-medium">
                    {team.captain_ign} ({team.captain_contact})
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-brand-600">
                    {team.team_code}
                  </td>

                  <td className="py-3 px-4 text-surface-600">
                    {team.assignment ? `${team.assignment.round_name} (${team.assignment.group_name})` : 'Unassigned'}
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={team.status}
                      onChange={(e) => handleStatusChange(team.id, e.target.value as any)}
                      className="px-2 py-1 border border-surface-300 rounded text-[11px] bg-white font-semibold focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="qualified">Qualified</option>
                      <option value="eliminated">Eliminated</option>
                      <option value="disqualified">Disqualified</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>

                  <td className="py-3 px-4 text-right flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => openEditModal(team)}
                      className="p-1 text-surface-500 hover:text-brand-600 hover:bg-surface-100 rounded"
                      title="Edit Team Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleRegenerateCode(team)}
                      className="px-2 py-1 bg-surface-100 border border-surface-300 hover:bg-surface-200 text-surface-800 font-semibold rounded text-[11px] inline-flex items-center gap-1"
                      title="Regenerate Access Code"
                    >
                      <RefreshCw className="w-3 h-3 text-brand-600" /> New Code
                    </button>

                    <button
                      onClick={() => handleDeleteTeam(team.id, team.team_name)}
                      className="p-1 text-surface-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                      title="Delete Team"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={Boolean(editTeam)} onClose={() => setEditTeam(null)} title={`Edit Team — ${editTeam?.team_name}`}>
        <form onSubmit={handleSaveTeamDetails} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Team Name *</label>
            <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} required className="w-full px-3 py-2 border rounded-lg" />
          </div>

          <div>
            <label className="block font-semibold mb-1">Captain Full Name</label>
            <input type="text" value={captainName} onChange={(e) => setCaptainName(e.target.value)} required className="w-full px-3 py-2 border rounded-lg" />
          </div>

          <div>
            <label className="block font-semibold mb-1">Captain BGMI IGN</label>
            <input type="text" value={captainIgn} onChange={(e) => setCaptainIgn(e.target.value)} required className="w-full px-3 py-2 border rounded-lg" />
          </div>

          <div>
            <label className="block font-semibold mb-1">Captain BGMI UID</label>
            <input type="text" value={captainUid} onChange={(e) => setCaptainUid(e.target.value)} required className="w-full px-3 py-2 border rounded-lg font-mono" />
          </div>

          <div>
            <label className="block font-semibold mb-1">Captain Contact Phone</label>
            <input type="text" value={captainContact} onChange={(e) => setCaptainContact(e.target.value)} required className="w-full px-3 py-2 border rounded-lg font-mono" />
          </div>

          <button type="submit" className="w-full py-2 bg-brand-600 text-white font-bold rounded-lg">
            Save Team Details
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(codeModal)}
        onClose={() => setCodeModal(null)}
        title="Team Code Regenerated"
        maxWidth="md"
      >
        {codeModal && (
          <div className="space-y-4 text-center">
            <h3 className="text-base font-bold text-surface-900">{codeModal.teamName} New Code</h3>
            <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl">
              <span className="text-2xl font-mono font-extrabold text-brand-900">{codeModal.code}</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(codeModal.code);
                alert('Copied to clipboard');
              }}
              className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700"
            >
              Copy New Code
            </button>
          </div>
        )}
      </Modal>

    </div>
  );
};
