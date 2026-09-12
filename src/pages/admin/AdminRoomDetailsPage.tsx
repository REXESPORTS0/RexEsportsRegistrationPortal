import React, { useState, useEffect } from 'react';
import { getSchedules, publishRoomDetails, unpublishRoomDetails } from '../../services/scheduleService';
import { logAdminActivity } from '../../services/adminService';
import { Schedule } from '../../types';
import { Key, Check, EyeOff, ShieldCheck } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const AdminRoomDetailsPage: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  
  const [roomId, setRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');

  async function load() {
    const data = await getSchedules();
    setSchedules(data);
  }

  useEffect(() => {
    load();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSchedule && roomId.trim() && roomPassword.trim()) {
      await publishRoomDetails(selectedSchedule.id, roomId.trim(), roomPassword.trim());
      await logAdminActivity('PUBLISHED_ROOM_DETAILS', {
        schedule_id: selectedSchedule.id,
        match_name: selectedSchedule.match_name,
        room_id: roomId
      });
      setSelectedSchedule(null);
      setRoomId('');
      setRoomPassword('');
      load();
    }
  };

  const handleUnpublish = async (scheduleId: string) => {
    if (confirm('Unpublish room credentials for this match?')) {
      await unpublishRoomDetails(scheduleId);
      await logAdminActivity('UNPUBLISHED_ROOM_DETAILS', { schedule_id: scheduleId });
      load();
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="border-b border-surface-200 pb-4">
        <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">Match Room Details Credentials</h1>
        <p className="text-xs text-surface-500 mt-1">
          Publish Room ID & Password for specific match fixtures. Credentials are automatically delivered to authorized Team Portals in real time and NEVER shown publicly.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 shadow-card overflow-hidden">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-surface-50 text-surface-600 border-b border-surface-200 font-semibold uppercase">
              <th className="py-3 px-4">Match Fixture</th>
              <th className="py-3 px-4">Stage</th>
              <th className="py-3 px-4">Room ID</th>
              <th className="py-3 px-4">Room Password</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 text-surface-800">
            {schedules.map(match => {
              const isPub = match.room_detail && match.room_detail.is_published;
              return (
                <tr key={match.id} className="hover:bg-surface-50">
                  <td className="py-3 px-4 font-bold text-surface-900">M{match.match_number}: {match.match_name}</td>
                  <td className="py-3 px-4 font-semibold text-brand-600">{match.round_name} • {match.group_name}</td>
                  <td className="py-3 px-4 font-mono font-bold">{isPub ? match.room_detail?.room_id : '—'}</td>
                  <td className="py-3 px-4 font-mono font-bold">{isPub ? match.room_detail?.room_password : '—'}</td>
                  <td className="py-3 px-4">
                    <Badge variant={isPub ? 'success' : 'default'} size="sm">
                      {isPub ? '● PUBLISHED LIVE' : 'Not Published'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isPub ? (
                      <button
                        onClick={() => handleUnpublish(match.id)}
                        className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 font-semibold rounded text-[11px] inline-flex items-center gap-1 hover:bg-rose-100"
                      >
                        <EyeOff className="w-3.5 h-3.5" /> Unpublish
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedSchedule(match);
                          setRoomId(match.room_detail?.room_id || '');
                          setRoomPassword(match.room_detail?.room_password || '');
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] inline-flex items-center gap-1 shadow-xs"
                      >
                        <Key className="w-3.5 h-3.5" /> Enter & Publish Room
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={Boolean(selectedSchedule)} onClose={() => setSelectedSchedule(null)} title={`Publish Room — ${selectedSchedule?.match_name}`}>
        <form onSubmit={handlePublish} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-surface-700 mb-1">Room ID *</label>
            <input
              type="text"
              placeholder="e.g. 8910452"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-base font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-surface-700 mb-1">Room Password *</label>
            <input
              type="text"
              placeholder="e.g. REX99"
              value={roomPassword}
              onChange={(e) => setRoomPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-base font-mono font-bold"
            />
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700">
              Publish Room Credentials Realtime
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

