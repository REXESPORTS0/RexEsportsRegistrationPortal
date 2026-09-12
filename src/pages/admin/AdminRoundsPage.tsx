import React, { useState, useEffect } from 'react';
import { getRoundsAndGroups, createRound, updateRound, deleteRound } from '../../services/teamService';
import { logAdminActivity } from '../../services/adminService';
import { Round } from '../../types';
import { Layers, Plus, Edit2, Trash2 } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const AdminRoundsPage: React.FC = () => {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRound, setEditRound] = useState<Round | null>(null);

  const [roundName, setRoundName] = useState('');
  const [roundNum, setRoundNum] = useState(1);
  const [status, setStatus] = useState<Round['status']>('upcoming');

  async function load() {
    const data = await getRoundsAndGroups();
    setRounds(data.rounds);
  }

  useEffect(() => {
    load();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roundName.trim()) return;

    if (editRound) {
      await updateRound(editRound.id, roundName.trim(), status);
      await logAdminActivity('UPDATED_ROUND', { id: editRound.id, name: roundName, status });
    } else {
      await createRound(roundName.trim(), Number(roundNum));
      await logAdminActivity('CREATED_ROUND', { name: roundName, round_number: roundNum });
    }

    setRoundName('');
    setEditRound(null);
    setModalOpen(false);
    load();
  };

  const handleDelete = async (roundId: string, name: string) => {
    if (confirm(`Are you sure you want to delete round "${name}"? All associated groups and assignments will also be deleted.`)) {
      await deleteRound(roundId);
      await logAdminActivity('DELETED_ROUND', { round_id: roundId, name });
      load();
    }
  };

  const openEditModal = (round: Round) => {
    setEditRound(round);
    setRoundName(round.name);
    setRoundNum(round.round_number);
    setStatus(round.status);
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setEditRound(null);
    setRoundName('');
    setRoundNum(rounds.length + 1);
    setStatus('upcoming');
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-surface-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">Tournament Rounds Manager</h1>
          <p className="text-xs text-surface-500 mt-1">Configure, edit, or delete competition stages (Qualifiers, Quarter Finals, Semi Finals, Grand Finals).</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Round
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {rounds.map(r => (
          <div key={r.id} className="bg-white p-5 rounded-xl border border-surface-200 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-brand-50 text-brand-700 text-[10px] font-bold rounded">Round #{r.round_number}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(r)}
                  className="p-1 text-surface-500 hover:text-brand-600 hover:bg-surface-100 rounded"
                  title="Edit Round"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(r.id, r.name)}
                  className="p-1 text-surface-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                  title="Delete Round"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h3 className="text-base font-bold text-surface-900">{r.name}</h3>
            <span className="text-xs font-semibold capitalize text-surface-500 block">Status: {r.status}</span>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editRound ? `Edit Round — ${editRound.name}` : "Create New Round"}>
        <form onSubmit={handleCreateOrUpdate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-surface-700 mb-1">Round Name *</label>
            <input
              type="text"
              placeholder="e.g. Round 3 (Semi Finals)"
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-surface-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-surface-700 mb-1">Round Order Number</label>
            <input
              type="number"
              value={roundNum}
              onChange={(e) => setRoundNum(Number(e.target.value))}
              required
              min={1}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg text-xs"
            />
          </div>

          {editRound && (
            <div>
              <label className="block font-semibold text-surface-700 mb-1">Stage Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg text-xs font-bold"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing (Active)</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}

          <button type="submit" className="w-full py-2 bg-brand-600 text-white font-bold rounded-lg text-xs">
            {editRound ? "Update Round" : "Save Round"}
          </button>
        </form>
      </Modal>
    </div>
  );
};
