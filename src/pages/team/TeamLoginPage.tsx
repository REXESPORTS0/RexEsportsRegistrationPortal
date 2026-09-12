import React, { useState } from 'react';
import { useTeamAuth } from '../../context/TeamAuthContext';
import { Lock, ArrowRight, ShieldCheck, AlertCircle, Key, Copy, Check } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const TeamLoginPage: React.FC = () => {
  const { loginWithCode, loading, error } = useTeamAuth();
  const [code, setCode] = useState('');
  const [localErr, setLocalErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErr(null);
    if (!code.trim()) {
      setLocalErr('Please enter your 10-character Team Access Code');
      return;
    }

    const success = await loginWithCode(code.trim());
    if (!success) {
      setLocalErr(error || 'Invalid or revoked Team Code. Please check with tournament organizers.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-50 font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-surface-200 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto border border-brand-200">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 tracking-tight">Competitor Team Portal</h2>
          <p className="text-xs text-surface-500 max-w-xs mx-auto">
            Enter your approved private Team Access Code to view your match schedules, round IDP, and room credentials.
          </p>
        </div>

        {(localErr || error) && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{localErr || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5 uppercase tracking-wider">
              Private Team Access Code
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                placeholder="e.g. REX-7K4P9X"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={12}
                className="w-full pl-10 pr-4 py-3 border border-surface-300 rounded-xl text-base font-mono font-bold tracking-widest text-surface-900 uppercase focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-sm"
              />
            </div>
            <p className="text-[11px] text-surface-400 mt-1">Provided by organizers upon team registration approval.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-card transition-all text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <LoadingSpinner size="sm" text="Verifying Code..." />
            ) : (
              <>
                Access Team Dashboard
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-surface-100 text-center text-xs text-surface-400">
          <p>Don't have a code yet? <a href="/register" className="text-brand-600 font-semibold hover:underline">Register your squad</a></p>
        </div>

      </div>
    </div>
  );
};

