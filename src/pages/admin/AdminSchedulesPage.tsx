import React, { useState, useEffect } from 'react';
import { getSchedules, createSchedule, deleteSchedule } from '../../services/scheduleService';
import { getRoundsAndGroups } from '../../services/teamService';
import { logAdminActivity } from '../../services/adminService';
import { Schedule, Round, Group } from '../../types';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { formatDateTime } from '../../utils/formatters';

export const AdminSchedulesPage: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [roundId, setRoundId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [matchNum, setMatchNum] = useState(1);
  const [matchName, setMatchName] = useState('Match 1 - Erangel');
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [mapName, setMapName] = useState('Erangel');
  const [lobbyNum, setLobbyNum] = useState('Lobby 1');
  const [notes, setNotes] = useState('');

  async function load() {
    const data = await getSchedules();
    const rg = await getRoundsAndGroups();
    setSchedules(data);
    setRounds(rg.rounds);
    setGroups(rg.groups);
    if (rg.rounds.length > 0 && !roundId) setRoundId(rg.rounds[0].id);
  }

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roundId && groupId && matchName) {
      await createSchedule({
        round_id: roundId,
        group_id: groupId,
        match_number: Number(matchNum),
        match_name: matchName,
        date_time: new Date(dateTime).toISOString(),
        map_name: mapName,
        lobby_number: lobbyNum,
        notes
      });
      await logAdminActivity('CREATED_SCHEDULE', { match_name: matchName, round_id: roundId, group_id: groupId });
      setModalOpen(false);
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this match fixture?')) {
      await deleteSchedule(id);
      await logAdminActivity('DELETED_SCHEDULE', { id });
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-surface-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">Match Schedule Management</h1>
          <p className="text-xs text-surface-500 mt-1">Create match fixtures by Round & Group (Map, Lobby Number, Date & Time).</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create Match Fixture
        </button>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 shadow-card overflow-hidden">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-surface-50 text-surface-600 border-b border-surface-200 font-semibold uppercase">
              <th className="py-3 px-4">Match</th>
              <th className="py-3 px-4">Round & Group</th>
              <th className="py-3 px-4">Map</th>
              <th className="py-3 px-4">Lobby</th>
              <th className="py-3 px-4">Start Time</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 text-surface-800">
            {schedules.map(m => (
              <tr key={m.id} className="hover:bg-surface-50">
                <td className="py-3 px-4 font-bold text-surface-900">M{m.match_number}: {m.match_name}</td>
                <td className="py-3 px-4 font-medium text-brand-600">{m.round_name} • {m.group_name}</td>
                <td className="py-3 px-4 font-semibold">{m.map_name}</td>
                <td className="py-3 px-4">{m.lobby_number}</td>
                <td className="py-3 px-4 text-surface-500">{formatDateTime(m.date_time)}</td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => handleDelete(m.id)} className="p-1 text-rose-600 hover:bg-rose-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Match Fixture">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Round *</label>
              <select
                value={roundId}
                onChange={(e) => { setRoundId(e.target.value); setGroupId(''); }}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {rounds.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Group *</label>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select Group...</option>
                {groups.filter(g => g.round_id === roundId).map(g => <option key={g.id} value={g.id}>{g.group_name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Match #</label>
              <input
                type="number"
                value={matchNum}
                onChange={(e) => setMatchNum(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Match Name</label>
              <input
                type="text"
                value={matchName}
                onChange={(e) => setMatchName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Map</label>
              <select value={mapName} onChange={(e) => setMapName(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="Erangel">Erangel</option>
                <option value="Miramar">Miramar</option>
                <option value="Sanhok">Sanhok</option>
                <option value="Vikendi">Vikendi</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Start Time</label>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <button type="submit" className="w-full py-2 bg-brand-600 text-white font-bold rounded-lg">
            Save Match Fixture
          </button>
        </form>
      </Modal>
    </div>
  );
};

