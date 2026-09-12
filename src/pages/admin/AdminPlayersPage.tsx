import React, { useState, useEffect } from 'react';
import { getAllRegistrations, updatePlayer } from '../../services/teamService';
import { logAdminActivity } from '../../services/adminService';
import { Team, Player } from '../../types';
import { UserCheck, Search, Edit2, Phone } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const AdminPlayersPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState('');
  const [editPlayer, setEditPlayer] = useState<(Player & { team_name: string }) | null>(null);

  const [ign, setIgn] = useState('');
  const [uid, setUid] = useState('');

  async function load() {
    const data = await getAllRegistrations('all');
    setTeams(data);
  }

  useEffect(() => {
    load();
  }, []);

  const allPlayers = teams.flatMap(t => 
    (t.players || []).map(p => ({
      ...p,
      team_name: t.team_name,
      team_code: t.team_code,
      captain_contact: t.captain_contact
    }))
  );

  const filtered = allPlayers.filter(p => 
    p.ign.toLowerCase().includes(search.toLowerCase()) ||
    p.uid.includes(search) ||
    p.team_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editPlayer && ign.trim() && uid.trim()) {
      await updatePlayer(editPlayer.id, ign.trim(), uid.trim());
      await logAdminActivity('UPDATED_PLAYER', { player_id: editPlayer.id, ign, uid });
      setEditPlayer(null);
      load();
    }
  };

  const openEditModal = (p: Player & { team_name: string }) => {
    setEditPlayer(p);
    setIgn(p.ign);
    setUid(p.uid);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-surface-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">Competitor Player Database</h1>
          <p className="text-xs text-surface-500 mt-1">Full database of registered player IGNs, character UIDs, team rosters, and captain contact info.</p>
        </div>
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search IGN, UID or team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-surface-300 rounded-lg text-xs"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 shadow-card overflow-hidden">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-surface-50 text-surface-600 border-b border-surface-200 font-semibold uppercase">
              <th className="py-3 px-4">Player IGN</th>
              <th className="py-3 px-4">BGMI Character UID</th>
              <th className="py-3 px-4">Team Squad</th>
              <th className="py-3 px-4">Captain Phone</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 text-surface-800">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-surface-50">
                <td className="py-3 px-4 font-bold text-surface-900">{p.ign}</td>
                <td className="py-3 px-4 font-mono font-semibold text-brand-600">{p.uid}</td>
                <td className="py-3 px-4 font-medium">{p.team_name}</td>
                <td className="py-3 px-4 font-mono">{p.captain_contact}</td>
                <td className="py-3 px-4">
                  {p.is_captain ? (
                    <span className="px-2 py-0.5 bg-brand-100 text-brand-800 font-bold text-[10px] rounded">Captain (P1)</span>
                  ) : (
                    <span className="text-surface-500">Player #{p.player_number}</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-1.5 text-surface-500 hover:text-brand-600 hover:bg-surface-100 rounded-md"
                    title="Edit Player IGN/UID"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={Boolean(editPlayer)} onClose={() => setEditPlayer(null)} title={`Edit Player — ${editPlayer?.ign}`}>
        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-surface-700 mb-1">BGMI IGN (In-Game Name) *</label>
            <input
              type="text"
              value={ign}
              onChange={(e) => setIgn(e.target.value)}
              required
              className="w-full px-3 py-2 border border-surface-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-surface-700 mb-1">BGMI Character UID *</label>
            <input
              type="text"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              required
              className="w-full px-3 py-2 border border-surface-300 rounded-lg text-xs font-mono font-bold"
            />
          </div>

          <button type="submit" className="w-full py-2 bg-brand-600 text-white font-bold rounded-lg text-xs">
            Save Player Details
          </button>
        </form>
      </Modal>
    </div>
  );
};
