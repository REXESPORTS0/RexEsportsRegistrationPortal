import React, { useState, useEffect } from 'react';
import { getRoundsAndGroups, createGroup, updateGroup, deleteGroup } from '../../services/teamService';
import { logAdminActivity } from '../../services/adminService';
import { Round, Group } from '../../types';
import { Grid, Plus, Edit2, Trash2 } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const AdminGroupsPage: React.FC = () => {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);

  const [selectedRound, setSelectedRound] = useState('');
  const [groupName, setGroupName] = useState('');

  async function load() {
    const data = await getRoundsAndGroups();
    setRounds(data.rounds);
    setGroups(data.groups);
    if (data.rounds.length > 0 && !selectedRound) {
      setSelectedRound(data.rounds[0].id);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    if (editGroup) {
      await updateGroup(editGroup.id, groupName.trim());
      await logAdminActivity('UPDATED_GROUP', { group_id: editGroup.id, name: groupName });
    } else {
      await createGroup(selectedRound, groupName.trim());
      await logAdminActivity('CREATED_GROUP', { round_id: selectedRound, group_name: groupName });
    }

    setGroupName('');
    setEditGroup(null);
    setModalOpen(false);
    load();
  };

  const handleDelete = async (groupId: string, name: string) => {
    if (confirm(`Are you sure you want to delete group "${name}"? Associated team assignments and schedules for this group will be deleted.`)) {
      await deleteGroup(groupId);
      await logAdminActivity('DELETED_GROUP', { group_id: groupId, name });
      load();
    }
  };

  const openEditModal = (group: Group) => {
    setEditGroup(group);
    setGroupName(group.group_name);
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setEditGroup(null);
    setGroupName('');
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-surface-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">Round Groups Manager</h1>
          <p className="text-xs text-surface-500 mt-1">Manage, edit, or delete group lobbies (Group A, Group B, Group C) per round.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Group
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {rounds.map(round => {
          const roundGroups = groups.filter(g => g.round_id === round.id);
          return (
            <div key={round.id} className="bg-white p-5 rounded-xl border border-surface-200 shadow-card space-y-3">
              <h3 className="text-sm font-bold text-surface-900 border-b border-surface-100 pb-2">{round.name}</h3>
              {roundGroups.length === 0 ? (
                <p className="text-xs text-surface-400 italic">No groups created yet.</p>
              ) : (
                <div className="space-y-2">
                  {roundGroups.map(g => (
                    <div key={g.id} className="p-2.5 bg-surface-50 rounded-lg border border-surface-200 text-xs font-bold text-surface-800 flex items-center justify-between">
                      <span>{g.group_name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(g)}
                          className="p-1 text-surface-500 hover:text-brand-600 hover:bg-surface-200 rounded"
                          title="Edit Group Name"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(g.id, g.group_name)}
                          className="p-1 text-surface-500 hover:text-rose-600 hover:bg-rose-100 rounded"
                          title="Delete Group"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editGroup ? `Edit Group — ${editGroup.group_name}` : "Create New Group"}>
        <form onSubmit={handleCreateOrUpdate} className="space-y-4 text-xs">
          {!editGroup && (
            <div>
              <label className="block font-semibold text-surface-700 mb-1">Select Target Round *</label>
              <select
                value={selectedRound}
                onChange={(e) => setSelectedRound(e.target.value)}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg text-xs"
              >
                {rounds.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-semibold text-surface-700 mb-1">Group Name *</label>
            <input
              type="text"
              placeholder="e.g. Group A"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-surface-300 rounded-lg text-xs"
            />
          </div>

          <button type="submit" className="w-full py-2 bg-brand-600 text-white font-bold rounded-lg text-xs">
            {editGroup ? "Update Group Name" : "Save Group"}
          </button>
        </form>
      </Modal>
    </div>
  );
};
