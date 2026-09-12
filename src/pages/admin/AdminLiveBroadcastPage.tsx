import React, { useState, useEffect } from 'react';
import { getLiveStream, updateLiveStream } from '../../services/streamService';
import { logAdminActivity } from '../../services/adminService';
import { LiveStream, StreamPlatform, StreamStatus } from '../../types';
import { Radio, Save, ExternalLink } from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const AdminLiveBroadcastPage: React.FC = () => {
  const [platform, setPlatform] = useState<StreamPlatform>('youtube');
  const [streamUrl, setStreamUrl] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<StreamStatus>('upcoming');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getLiveStream().then(ls => {
      if (ls) {
        setPlatform(ls.platform);
        setStreamUrl(ls.stream_url);
        setTitle(ls.title);
        setStatus(ls.status);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateLiveStream({
      platform,
      stream_url: streamUrl,
      title,
      status
    });
    await logAdminActivity('UPDATED_LIVE_STREAM', { status, title });
    setSaving(false);
    alert('Live stream status updated successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-surface-200 pb-4">
        <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">Live Broadcast Control Panel</h1>
        <p className="text-xs text-surface-500 mt-1">Manage official YouTube/Kick stream embed links, stream title, and live broadcast state.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-card max-w-2xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="block font-semibold mb-1">Broadcast Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StreamStatus)}
              className="w-full px-3 py-2 border rounded-lg font-bold text-xs"
            >
              <option value="upcoming">Upcoming Broadcast</option>
              <option value="live">🔴 LIVE NOW (Broadcasting Active)</option>
              <option value="ended">Ended</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Stream Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as StreamPlatform)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="youtube">YouTube Live</option>
              <option value="kick">Kick.com Stream</option>
              <option value="custom">Custom Iframe URL</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Stream URL / Share Link *</label>
            <input
              type="text"
              placeholder="e.g. https://www.youtube.com/watch?v=live_stream_rex"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 border rounded-lg text-xs font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Broadcast Title *</label>
            <input
              type="text"
              placeholder="e.g. REX BGMI PRO CHAMPIONSHIP — GRAND FINALS DAY 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 border rounded-lg text-xs font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs"
          >
            <Radio className="w-4 h-4" /> Save Broadcast Settings
          </button>

        </form>
      </div>
    </div>
  );
};

