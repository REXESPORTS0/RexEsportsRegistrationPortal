import React, { useState, useEffect } from 'react';
import { getTournamentDetails, updateTournament } from '../../services/tournamentService';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { logAdminActivity } from '../../services/adminService';
import { Tournament } from '../../types';
import { Settings, Save, Lock, Check } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { updatePasscode } = useAdminAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [rules, setRules] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  const [newPasscode, setNewPasscode] = useState('');
  const [passcodeSaved, setPasscodeSaved] = useState(false);

  useEffect(() => {
    getTournamentDetails().then(t => {
      if (t) {
        setTournament(t);
        setName(t.name);
        setDesc(t.description);
        setRules(t.rules);
        setIsOpen(t.is_registration_open);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tournament) {
      await updateTournament({
        id: tournament.id,
        name,
        description: desc,
        rules,
        is_registration_open: isOpen
      });
      await logAdminActivity('UPDATED_TOURNAMENT_SETTINGS', { name, registration_open: isOpen });
      alert('Tournament settings updated!');
    }
  };

  const handleChangePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasscode.trim()) {
      updatePasscode(newPasscode.trim());
      logAdminActivity('CHANGED_ADMIN_PASSCODE');
      setPasscodeSaved(true);
      setNewPasscode('');
      setTimeout(() => setPasscodeSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="border-b border-surface-200 pb-4">
        <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">Tournament & Security Settings</h1>
        <p className="text-xs text-surface-500 mt-1">Configure global tournament rules, toggle squad registration open/close, and update your private Admin Passcode.</p>
      </div>

      {/* CHANGE ADMIN PASSCODE FORM */}
      <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-surface-900 flex items-center gap-2 border-b border-surface-100 pb-3">
          <Lock className="w-4 h-4 text-brand-600" />
          Update Private Admin Passcode / Password
        </h3>

        {passcodeSaved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Admin Passcode updated successfully! Use your new passcode for future logins.</span>
          </div>
        )}

        <form onSubmit={handleChangePasscode} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">New Admin Passcode *</label>
            <input
              type="password"
              placeholder="Enter new strong passcode"
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
              required
              className="w-full px-3 py-2 border border-surface-300 rounded-lg text-xs"
            />
          </div>

          <button type="submit" className="px-4 py-2 bg-surface-900 hover:bg-black text-white font-bold rounded-lg text-xs">
            Save New Passcode
          </button>
        </form>
      </div>

      {/* TOURNAMENT DETAILS & RULES FORM */}
      <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-surface-900 flex items-center gap-2 border-b border-surface-100 pb-3">
          <Settings className="w-4 h-4 text-brand-600" />
          Global Tournament Details & Rulebook Editor
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="block font-semibold mb-1">Tournament Title</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border rounded-lg font-bold" />
          </div>

          <div>
            <label className="block font-semibold mb-1">Overview Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg" />
          </div>

          <div>
            <label className="block font-semibold mb-1">Squad Registration Portal Status</label>
            <label className="flex items-center gap-2 cursor-pointer font-bold text-surface-800">
              <input type="checkbox" checked={isOpen} onChange={(e) => setIsOpen(e.target.checked)} className="w-4 h-4 text-brand-600 rounded" />
              Public Registration Open
            </label>
          </div>

          <div>
            <label className="block font-semibold mb-1">Official Rulebook Content</label>
            <textarea value={rules} onChange={(e) => setRules(e.target.value)} rows={6} className="w-full px-3 py-2 border rounded-lg font-mono text-xs" />
          </div>

          <button type="submit" className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg text-xs flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Global Settings
          </button>
        </form>
      </div>
    </div>
  );
};
