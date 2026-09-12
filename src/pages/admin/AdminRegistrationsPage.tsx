import React, { useState, useEffect } from 'react';
import { getAllRegistrations, updateTeamStatus } from '../../services/teamService';
import { logAdminActivity } from '../../services/adminService';
import { Team } from '../../types';
import { ShieldCheck, Check, X, Search, Filter, Eye, Copy, Key } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { formatDateTime } from '../../utils/formatters';

export const AdminRegistrationsPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const [approvedCodeModal, setApprovedCodeModal] = useState<{ teamName: string; code: string } | null>(null);

  async function loadData() {
    setLoading(true);
    const data = await getAllRegistrations(filter);
    setRegistrations(data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [filter]);

  const handleApprove = async (team: Team) => {
    const res = await updateTeamStatus(team.id, 'approved');
    if (res.success && res.team_code) {
      await logAdminActivity('APPROVED_TEAM', { team_id: team.id, team_name: team.team_name, team_code: res.team_code });
      setApprovedCodeModal({ teamName: team.team_name, code: res.team_code });
      loadData();
    }
  };

  const handleReject = async (team: Team) => {
    if (confirm(`Are you sure you want to reject registration for ${team.team_name}?`)) {
      await updateTeamStatus(team.id, 'rejected');
      await logAdminActivity('REJECTED_TEAM', { team_id: team.id, team_name: team.team_name });
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-surface-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">Team Registrations</h1>
          <p className="text-xs text-surface-500 mt-1">Review pending registrations, inspect rosters, and approve teams to generate Team Codes.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-surface-100 p-1 rounded-lg border border-surface-200 self-start sm:self-auto">
          {['pending', 'approved', 'rejected', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                filter === f ? 'bg-white text-brand-700 shadow-xs' : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-surface-50 text-surface-600 border-b border-surface-200 font-semibold uppercase">
                <th className="py-3 px-4">Team Name</th>
                <th className="py-3 px-4">Captain Info</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Submitted Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 text-surface-800">
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-surface-500 italic">
                    No registrations found matching status filter "{filter}".
                  </td>
                </tr>
              ) : (
                registrations.map((team) => (
                  <tr key={team.id} className="hover:bg-surface-50/60 transition-colors">
                    
                    <td className="py-3 px-4 font-bold text-surface-900 flex items-center gap-2">
                      <img
                        src={team.logo_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=120&q=80'}
                        alt={team.team_name}
                        className="w-7 h-7 rounded object-cover border border-surface-200"
                      />
                      {team.team_name}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-surface-900">{team.captain_ign}</div>
                      <div className="text-[11px] text-surface-500">{team.captain_name} (UID: {team.captain_uid})</div>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium">{team.captain_contact}</td>

                    <td className="py-3 px-4 text-surface-500">{formatDateTime(team.created_at)}</td>

                    <td className="py-3 px-4">
                      <Badge variant={team.status === 'approved' ? 'success' : team.status === 'pending' ? 'warning' : 'danger'} size="sm">
                        {team.status}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedTeam(team)}
                          className="p-1.5 text-surface-500 hover:text-surface-900 hover:bg-surface-100 rounded-md"
                          title="View Full Roster"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {team.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(team)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px] flex items-center gap-1 shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>

                            <button
                              onClick={() => handleReject(team)}
                              className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-semibold rounded text-[11px] flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Full Roster Inspection */}
      <Modal
        isOpen={Boolean(selectedTeam)}
        onClose={() => setSelectedTeam(null)}
        title={`Roster Inspection — ${selectedTeam?.team_name}`}
        maxWidth="lg"
      >
        {selectedTeam && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 bg-surface-50 p-3 rounded-lg border border-surface-200">
              <div>
                <span className="text-surface-400 block">Captain Name</span>
                <span className="font-bold text-surface-900">{selectedTeam.captain_name}</span>
              </div>
              <div>
                <span className="text-surface-400 block">Contact Mobile</span>
                <span className="font-bold text-surface-900">{selectedTeam.captain_contact}</span>
              </div>
              <div>
                <span className="text-surface-400 block">Captain Email</span>
                <span className="font-semibold text-surface-900">{selectedTeam.captain_email || 'None'}</span>
              </div>
              <div>
                <span className="text-surface-400 block">Team Access Code</span>
                <span className="font-mono font-bold text-brand-600">{selectedTeam.team_code || 'Generated on approval'}</span>
              </div>
            </div>

            <h4 className="font-bold text-surface-900 pt-2">Player Roster (IGN & BGMI UID)</h4>
            <div className="space-y-2">
              {selectedTeam.players?.map((p, idx) => (
                <div key={p.id} className="p-2.5 bg-white border border-surface-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-bold text-surface-900 mr-2">P{idx + 1}: {p.ign}</span>
                    {p.is_captain && <span className="px-1.5 py-0.5 bg-brand-100 text-brand-800 text-[10px] font-bold rounded">Captain</span>}
                  </div>
                  <span className="font-mono text-surface-600">UID: {p.uid}</span>
                </div>
              ))}
            </div>

            {selectedTeam.status === 'pending' && (
              <div className="pt-4 border-t border-surface-100 flex justify-end gap-3">
                <button
                  onClick={() => {
                    handleApprove(selectedTeam);
                    setSelectedTeam(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
                >
                  Approve Team
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* MODAL: Approved Team Code Display */}
      <Modal
        isOpen={Boolean(approvedCodeModal)}
        onClose={() => setApprovedCodeModal(null)}
        title="Registration Confirmed & Team Code Generated"
        maxWidth="md"
      >
        {approvedCodeModal && (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-surface-900">{approvedCodeModal.teamName} Approved</h3>

            <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-brand-600 block">Private Team Access Code</span>
              <span className="text-3xl font-mono font-extrabold text-brand-900 tracking-widest block">{approvedCodeModal.code}</span>
            </div>

            <p className="text-xs text-surface-500 leading-relaxed">
              Share this code with team captain <strong className="text-surface-800">{approvedCodeModal.teamName}</strong>. They will use it to log into the Team Portal at <strong className="underline">/team</strong>.
            </p>

            <button
              onClick={() => {
                navigator.clipboard.writeText(approvedCodeModal.code);
                alert('Team Code copied to clipboard!');
              }}
              className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700 inline-flex items-center gap-1.5"
            >
              <Copy className="w-4 h-4" /> Copy Team Code
            </button>
          </div>
        )}
      </Modal>

    </div>
  );
};

