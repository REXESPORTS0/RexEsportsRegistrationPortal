import React, { useState, useEffect } from 'react';
import { getAdminActivities } from '../../services/adminService';
import { AdminActivity } from '../../types';
import { Activity } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const AdminActivityLogPage: React.FC = () => {
  const [activities, setActivities] = useState<AdminActivity[]>([]);

  useEffect(() => {
    getAdminActivities().then(setActivities);
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-surface-200 pb-4">
        <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">Admin Operational Activity Audit Log</h1>
        <p className="text-xs text-surface-500 mt-1">Immutable audit log recording admin approvals, IDP publications, room detail entries, and settings changes.</p>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 shadow-card overflow-hidden">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-surface-50 text-surface-600 border-b border-surface-200 font-semibold uppercase">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Admin Email</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 text-surface-800">
            {activities.map(act => (
              <tr key={act.id} className="hover:bg-surface-50">
                <td className="py-3 px-4 font-mono text-surface-500">{formatDateTime(act.created_at)}</td>
                <td className="py-3 px-4 font-semibold">{act.admin_email}</td>
                <td className="py-3 px-4 font-bold text-brand-600">{act.action}</td>
                <td className="py-3 px-4 font-mono text-[11px] text-surface-700">{JSON.stringify(act.details)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

