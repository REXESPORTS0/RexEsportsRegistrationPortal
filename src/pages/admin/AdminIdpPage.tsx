import React, { useState, useEffect } from 'react';
import { getAllIdps, uploadAndPublishIdp, deleteIdp } from '../../services/idpService';
import { getRoundsAndGroups } from '../../services/teamService';
import { logAdminActivity } from '../../services/adminService';
import { IdpDocument, Round, Group } from '../../types';
import { FileUp, Upload, Trash2, Eye, ExternalLink } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { formatDateTime } from '../../utils/formatters';

export const AdminIdpPage: React.FC = () => {
  const [idps, setIdps] = useState<IdpDocument[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [selectedRound, setSelectedRound] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState('');

  async function load() {
    const data = await getAllIdps();
    const rg = await getRoundsAndGroups();
    setIdps(data);
    setRounds(rg.rounds);
    setGroups(rg.groups);
    if (rg.rounds.length > 0 && !selectedRound) setSelectedRound(rg.rounds[0].id);
  }

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRound || !selectedGroup || !title.trim()) return;

    setSubmitting(true);
    const res = await uploadAndPublishIdp(selectedRound, selectedGroup, title, file, externalUrl);
    if (res.success) {
      await logAdminActivity('PUBLISHED_IDP', { round_id: selectedRound, group_id: selectedGroup, title });
      setTitle('');
      setFile(null);
      setExternalUrl('');
      load();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this IDP document?')) {
      await deleteIdp(id);
      await logAdminActivity('DELETED_IDP', { id });
      load();
    }
  };

  return (
    <div className="space-y-8">
      
      <div className="border-b border-surface-200 pb-4">
        <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">Round + Group IDP Document Manager</h1>
        <p className="text-xs text-surface-500 mt-1">
          Upload Instruction & Match Data Sheets (PDFs) bound strictly to Round + Group. Files are uploaded to Supabase Storage and updated in real time for authorized teams.
        </p>
      </div>

      {/* Upload Form */}
      <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-surface-900 flex items-center gap-2">
          <FileUp className="w-4 h-4 text-brand-600" /> Upload & Publish New IDP Document
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          
          <div>
            <label className="block font-semibold text-surface-700 mb-1">1. Select Round *</label>
            <select
              value={selectedRound}
              onChange={(e) => {
                setSelectedRound(e.target.value);
                setSelectedGroup('');
              }}
              required
              className="w-full px-3 py-2 border border-surface-300 rounded-lg text-xs"
            >
              <option value="">Select Round...</option>
              {rounds.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-surface-700 mb-1">2. Select Group *</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              required
              className="w-full px-3 py-2 border border-surface-300 rounded-lg text-xs"
            >
              <option value="">Select Group...</option>
              {groups.filter(g => g.round_id === selectedRound).map(g => (
                <option key={g.id} value={g.id}>{g.group_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-surface-700 mb-1">3. Document Title *</label>
            <input
              type="text"
              placeholder="e.g. Round 3 Group A Instructions"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-surface-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-surface-700 mb-1">4. PDF File (Storage Upload)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-surface-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
            />
          </div>

          <div className="sm:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg shadow-xs text-xs flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" /> Publish IDP to Group
            </button>
          </div>

        </form>
      </div>

      {/* Published IDPs Table */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-card overflow-hidden">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-surface-50 text-surface-600 border-b border-surface-200 font-semibold uppercase">
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Target Stage</th>
              <th className="py-3 px-4">Last Published</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 text-surface-800">
            {idps.map(idp => (
              <tr key={idp.id} className="hover:bg-surface-50">
                <td className="py-3 px-4 font-bold text-surface-900">{idp.title}</td>
                <td className="py-3 px-4 font-semibold text-brand-600">{idp.round_name} • {idp.group_name}</td>
                <td className="py-3 px-4 text-surface-500">{formatDateTime(idp.updated_at)}</td>
                <td className="py-3 px-4"><Badge variant="success" size="sm">Published</Badge></td>
                <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                  <a
                    href={idp.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-surface-100 rounded text-surface-700 hover:bg-surface-200"
                    title="View Document"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(idp.id)}
                    className="p-1.5 bg-rose-50 text-rose-700 rounded hover:bg-rose-100"
                    title="Delete IDP"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

