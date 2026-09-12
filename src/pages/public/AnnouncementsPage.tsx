import React, { useState, useEffect } from 'react';
import { getAnnouncements } from '../../services/announcementService';
import { Announcement } from '../../types';
import { Bell, AlertTriangle, Calendar } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { formatDateTime } from '../../utils/formatters';
import { EmptyState } from '../../components/common/EmptyState';

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    getAnnouncements('all').then(setAnnouncements);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="border-b border-surface-200 pb-6">
        <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">Official Announcements</h1>
        <p className="text-sm text-surface-500 mt-1">Realtime broadcast updates, schedule modifications, and tournament news.</p>
      </div>

      {announcements.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Public Announcements"
          description="There are currently no active public announcements published by organizers."
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-white p-6 rounded-xl border border-surface-200 shadow-card space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {ann.priority === 'urgent' && <Badge variant="urgent">URGENT</Badge>}
                  <h3 className="text-base font-bold text-surface-900">{ann.title}</h3>
                </div>
                <span className="text-xs text-surface-400 shrink-0">{formatDateTime(ann.created_at)}</span>
              </div>

              <p className="text-xs text-surface-700 leading-relaxed whitespace-pre-line">{ann.content}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

