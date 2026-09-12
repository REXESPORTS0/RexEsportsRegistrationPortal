import React, { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Shield, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAdminAuth();
  const [passcode, setPasscode] = useState('');
  const [email, setEmail] = useState('admin@rexesports.com');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const success = login(passcode, email);
    if (!success) {
      setError('Invalid organizer credentials or passcode.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-surface-50 font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-surface-200 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-surface-900 text-white flex items-center justify-center mx-auto shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 tracking-tight">Organizer Admin Portal</h2>
          <p className="text-xs text-surface-500 max-w-xs mx-auto">
            Authorized portal for tournament directors and referees.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5 uppercase tracking-wider">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5 uppercase tracking-wider">
              Admin Password / Passcode
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="password"
                placeholder="Enter private admin password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-surface-900 hover:bg-black text-white font-bold rounded-xl shadow-card transition-all text-sm flex items-center justify-center gap-2"
          >
            Authenticate Admin Session
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
