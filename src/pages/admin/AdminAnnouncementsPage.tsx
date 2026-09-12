import React, { useState, useEffect } from 'react';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../../services/announcementService';
import { getRoundsAndGroups } from '../../services/teamService';
import { logAdminActivity } from '../../services/adminService';
import { Announcement, AnnouncementTarget, AnnouncementPriority, Round, Group } from '../../types';
import { Bell, Plus, Trash2 } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { formatDateTime } from '../../utils/formatters';

export const AdminAnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [targetType, setTargetType] = useState<AnnouncementTarget>('all');
  const [roundId, setRoundId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('normal');

  async function load() {
    const data = await getAnnouncements();
    const rg = await getRoundsAndGroups();
    setAnnouncements(data);
    setRounds(rg.rounds);
    setGroups(rg.groups);
  }

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      await createAnnouncement({
        target_type: targetType,
        round_id: roundId || undefined,
        group_id: groupId || undefined,
        title: title.trim(),
        content: content.trim(),
        priority
      });
      await logAdminActivity('CREATED_ANNOUNCEMENT', { title, target_type: targetType });
      setTitle('');
      setContent('');
      setModalOpen(false);
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete announcement?')) {
      await deleteAnnouncement(id);
      await logAdminActivity('DELETED_ANNOUNCEMENT', { id });
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-surface-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">Announcements Manager</h1>
          <p className="text-xs text-surface-500 mt-1">Broadcast official updates targeting Everyone, a specific Round, or a specific Group.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create Announcement
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map(ann => (
          <div key={ann.id} className="bg-white p-5 rounded-xl border border-surface-200 shadow-card flex items-start justify-between gap-4">
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-surface-100 font-bold uppercase rounded text-[10px] text-surface-700">Target: {ann.target_type}</span>
                <h3 className="text-sm font-bold text-surface-900">{ann.title}</h3>
              </div>
              <p className="text-surface-700 leading-relaxed whitespace-pre-line">{ann.content}</p>
              <span className="text-[10px] text-surface-400 block pt-1">{formatDateTime(ann.created_at)}</span>
            </div>
            <button onClick={() => handleDelete(ann.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Announcement">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Target Audience</label>
            <select value={targetType} onChange={(e) => setTargetType(e.target.value as any)} className="w-full px-3 py-2 border rounded-lg">
              <option value="all">Everyone (Public Website & All Teams)</option>
              <option value="round">Specific Round Only</option>
              <option value="group">Specific Group Only</option>
            </select>
          </div>

          {targetType === 'round' && (
            <div>
              <label className="block font-semibold mb-1">Select Round</label>
              <select value={roundId} onChange={(e) => setRoundId(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="">Select Round...</option>
                {rounds.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          )}

          {targetType === 'group' && (
            <div>
              <label className="block font-semibold mb-1">Select Group</label>
              <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="">Select Group...</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.group_name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block font-semibold mb-1">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="w-full px-3 py-2 border rounded-lg">
              <option value="normal">Normal</option>
              <option value="urgent">URGENT</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Announcement Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-3 py-2 border rounded-lg" />
          </div>

          <div>
            <label className="block font-semibold mb-1">Message Content *</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} required className="w-full px-3 py-2 border rounded-lg" />
          </div>

          <button type="submit" className="w-full py-2 bg-brand-600 text-white font-bold rounded-lg">
            Post Announcement
          </button>
        </form>
      </Modal>
    </div>
  );
};

