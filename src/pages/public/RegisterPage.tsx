import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { registerTeam } from '../../services/teamService';
import { useTeamAuth } from '../../context/TeamAuthContext';
import { validateTeamName, validateIGN, validateUID, validateContact, validateEmail } from '../../utils/validators';
import { ShieldCheck, Upload, User, Phone, Mail, Trophy, AlertCircle, CheckCircle2, Plus, Trash2, Key, Copy, Check, ArrowRight } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithCode } = useTeamAuth();

  const [submitting, setSubmitting] = useState(false);
  const [successTeam, setSuccessTeam] = useState<any>(null);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Form State
  const [teamName, setTeamName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [captainName, setCaptainName] = useState('');
  const [captainIgn, setCaptainIgn] = useState('');
  const [captainUid, setCaptainUid] = useState('');
  const [captainContact, setCaptainContact] = useState('');
  const [captainEmail, setCaptainEmail] = useState('');

  // Players 2, 3, 4, and optional Sub (Player 5)
  const [players, setPlayers] = useState([
    { ign: '', uid: '' }, // Player 2
    { ign: '', uid: '' }, // Player 3
    { ign: '', uid: '' }, // Player 4
  ]);

  const [hasSub, setHasSub] = useState(false);
  const [subPlayer, setSubPlayer] = useState({ ign: '', uid: '' });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handlePlayerChange = (index: number, field: 'ign' | 'uid', value: string) => {
    const updated = [...players];
    updated[index][field] = value;
    setPlayers(updated);
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    const tErr = validateTeamName(teamName);
    if (tErr) errs.teamName = tErr;

    if (!captainName.trim()) errs.captainName = 'Captain full name is required';

    const ignErr = validateIGN(captainIgn, 'Captain IGN');
    if (ignErr) errs.captainIgn = ignErr;

    const uidErr = validateUID(captainUid, 'Captain UID');
    if (uidErr) errs.captainUid = uidErr;

    const cErr = validateContact(captainContact);
    if (cErr) errs.captainContact = cErr;

    const eErr = validateEmail(captainEmail);
    if (eErr) errs.captainEmail = eErr;

    players.forEach((p, idx) => {
      const pNum = idx + 2;
      const pIgnErr = validateIGN(p.ign, `Player ${pNum} IGN`);
      if (pIgnErr) errs[`player_${pNum}_ign`] = pIgnErr;

      const pUidErr = validateUID(p.uid, `Player ${pNum} UID`);
      if (pUidErr) errs[`player_${pNum}_uid`] = pUidErr;
    });

    if (hasSub) {
      const subIgnErr = validateIGN(subPlayer.ign, 'Substitute IGN');
      if (subIgnErr) errs.sub_ign = subIgnErr;

      const subUidErr = validateUID(subPlayer.uid, 'Substitute UID');
      if (subUidErr) errs.sub_uid = subUidErr;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);

    const playerList = players.map(p => ({ ign: p.ign, uid: p.uid }));
    if (hasSub && subPlayer.ign && subPlayer.uid) {
      playerList.push({ ign: subPlayer.ign, uid: subPlayer.uid });
    }

    try {
      const res = await registerTeam({
        team_name: teamName,
        logo_file: logoFile,
        captain_name: captainName,
        captain_ign: captainIgn,
        captain_uid: captainUid,
        captain_contact: captainContact,
        captain_email: captainEmail,
        players: playerList
      });

      if (res.success && res.team && res.team_code) {
        setSuccessTeam(res.team);
        setGeneratedCode(res.team_code);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 }
        });
      } else {
        setGeneralError(res.error || 'Failed to submit registration. Please try again.');
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'Network error occurred during registration.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyCodeToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleEnterPortal = async () => {
    if (generatedCode) {
      await loginWithCode(generatedCode);
      navigate('/team');
    }
  };

  if (successTeam && generatedCode) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
        
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider inline-block">
            ● REGISTRATION CONFIRMED & AUTO-APPROVED
          </span>
          <h2 className="text-3xl font-extrabold text-surface-900 tracking-tight">Welcome to REX BGMI Championship!</h2>
          <p className="text-surface-600 text-sm leading-relaxed max-w-lg mx-auto">
            Your squad <strong className="text-surface-900">{successTeam.team_name}</strong> has been registered and automatically confirmed.
          </p>
        </div>

        {/* TEAM ACCESS CODE DISPLAY BOX */}
        <div className="p-6 bg-brand-50 border-2 border-brand-300 rounded-2xl space-y-4 shadow-card text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-brand-700 uppercase tracking-widest">
            <Key className="w-4 h-4 text-brand-600" />
            Your Private Team Access Code
          </div>

          <div className="py-2 bg-white border border-brand-200 rounded-xl">
            <span className="text-3xl sm:text-4xl font-mono font-extrabold text-brand-900 tracking-widest block">
              {generatedCode}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={copyCodeToClipboard}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copiedCode ? 'Team Code Copied!' : 'Copy Team Code'}
            </button>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 text-left space-y-1">
            <p className="font-bold flex items-center gap-1 text-amber-900">
              ⚠️ IMPORTANT INSTRUCTIONS:
            </p>
            <p>• Save or take a screenshot of your Team Code <strong>({generatedCode})</strong> now.</p>
            <p>• Do NOT share this code with anyone outside your squad.</p>
            <p>• Use this code to log into the Team Portal at <strong>/team</strong> for match schedules & room details.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleEnterPortal}
            className="w-full sm:w-auto px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm shadow-card flex items-center justify-center gap-2"
          >
            Access Team Portal Now
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/teams')}
            className="w-full sm:w-auto px-6 py-3 border border-surface-300 hover:bg-surface-100 text-surface-800 font-semibold rounded-xl text-sm"
          >
            View Confirmed Teams List
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title */}
      <div className="border-b border-surface-200 pb-6 mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">Official Squad Registration</h1>
        <p className="text-sm text-surface-500 mt-1">
          Complete squad details to enter REX BGMI Pro Championship 2026. Teams are auto-approved instantly!
        </p>
      </div>

      {generalError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: TEAM INFORMATION */}
        <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-card space-y-6">
          <div className="border-b border-surface-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-surface-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-brand-600" />
              1. Team Information
            </h3>
            <span className="text-xs text-surface-400 font-medium">* Required</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Team Name */}
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                Team Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. GodLike Esports"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  errors.teamName ? 'border-rose-300 bg-rose-50/50' : 'border-surface-300'
                }`}
              />
              {errors.teamName && <p className="text-xs text-rose-600 mt-1">{errors.teamName}</p>}
            </div>

            {/* Team Logo Upload */}
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                Team Logo (Optional)
              </label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Preview" className="w-12 h-12 rounded-lg object-cover border border-surface-300" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-surface-100 border border-surface-200 flex items-center justify-center text-surface-400">
                    <Trophy className="w-6 h-6" />
                  </div>
                )}
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-surface-300 rounded-lg text-xs font-medium text-surface-700 hover:bg-surface-50 transition-colors">
                  <Upload className="w-4 h-4 text-brand-600" />
                  Choose File
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: CAPTAIN DETAILS */}
        <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-card space-y-6">
          <div className="border-b border-surface-100 pb-3">
            <h3 className="text-base font-bold text-surface-900 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-600" />
              2. Team Captain (Player 1)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                Captain Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Chetan Chandgude"
                value={captainName}
                onChange={(e) => setCaptainName(e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 ${
                  errors.captainName ? 'border-rose-300 bg-rose-50/50' : 'border-surface-300'
                }`}
              />
              {errors.captainName && <p className="text-xs text-rose-600 mt-1">{errors.captainName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                Captain BGMI IGN (In-Game Name) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. GodL Kronten"
                value={captainIgn}
                onChange={(e) => setCaptainIgn(e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 ${
                  errors.captainIgn ? 'border-rose-300 bg-rose-50/50' : 'border-surface-300'
                }`}
              />
              {errors.captainIgn && <p className="text-xs text-rose-600 mt-1">{errors.captainIgn}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                Captain BGMI UID (Character ID) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 5123456789"
                value={captainUid}
                onChange={(e) => setCaptainUid(e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-brand-500 ${
                  errors.captainUid ? 'border-rose-300 bg-rose-50/50' : 'border-surface-300'
                }`}
              />
              {errors.captainUid && <p className="text-xs text-rose-600 mt-1">{errors.captainUid}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                Captain WhatsApp Contact Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 9876543210"
                value={captainContact}
                onChange={(e) => setCaptainContact(e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 ${
                  errors.captainContact ? 'border-rose-300 bg-rose-50/50' : 'border-surface-300'
                }`}
              />
              {errors.captainContact && <p className="text-xs text-rose-600 mt-1">{errors.captainContact}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                Captain Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="captain@esports.com"
                value={captainEmail}
                onChange={(e) => setCaptainEmail(e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 ${
                  errors.captainEmail ? 'border-rose-300 bg-rose-50/50' : 'border-surface-300'
                }`}
              />
              {errors.captainEmail && <p className="text-xs text-rose-600 mt-1">{errors.captainEmail}</p>}
            </div>
          </div>
        </div>

        {/* SECTION 3: SQUAD ROSTER (PLAYERS 2, 3, 4) */}
        <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-card space-y-6">
          <div className="border-b border-surface-100 pb-3">
            <h3 className="text-base font-bold text-surface-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-600" />
              3. Starting Roster (Players 2, 3 & 4)
            </h3>
          </div>

          <div className="space-y-4">
            {players.map((player, idx) => {
              const pNum = idx + 2;
              return (
                <div key={pNum} className="p-4 bg-surface-50 rounded-xl border border-surface-200 space-y-3">
                  <span className="text-xs font-bold text-surface-700">Player {pNum}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder={`Player ${pNum} BGMI IGN *`}
                        value={player.ign}
                        onChange={(e) => handlePlayerChange(idx, 'ign', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-brand-500 ${
                          errors[`player_${pNum}_ign`] ? 'border-rose-300 bg-rose-50/50' : 'border-surface-300'
                        }`}
                      />
                      {errors[`player_${pNum}_ign`] && <p className="text-[11px] text-rose-600 mt-1">{errors[`player_${pNum}_ign`]}</p>}
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder={`Player ${pNum} BGMI UID *`}
                        value={player.uid}
                        onChange={(e) => handlePlayerChange(idx, 'uid', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg text-xs font-mono focus:ring-2 focus:ring-brand-500 ${
                          errors[`player_${pNum}_uid`] ? 'border-rose-300 bg-rose-50/50' : 'border-surface-300'
                        }`}
                      />
                      {errors[`player_${pNum}_uid`] && <p className="text-[11px] text-rose-600 mt-1">{errors[`player_${pNum}_uid`]}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: OPTIONAL SUBSTITUTE (PLAYER 5) */}
        <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-surface-900">4. Substitute Player (Optional)</h3>
            {!hasSub ? (
              <button
                type="button"
                onClick={() => setHasSub(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                <Plus className="w-4 h-4" /> Add Substitute
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setHasSub(false);
                  setSubPlayer({ ign: '', uid: '' });
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
              >
                <Trash2 className="w-4 h-4" /> Remove Substitute
              </button>
            )}
          </div>

          {hasSub && (
            <div className="p-4 bg-surface-50 rounded-xl border border-surface-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Sub Player BGMI IGN"
                  value={subPlayer.ign}
                  onChange={(e) => setSubPlayer({ ...subPlayer, ign: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-brand-500 ${
                    errors.sub_ign ? 'border-rose-300 bg-rose-50/50' : 'border-surface-300'
                  }`}
                />
                {errors.sub_ign && <p className="text-[11px] text-rose-600 mt-1">{errors.sub_ign}</p>}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Sub Player BGMI UID"
                  value={subPlayer.uid}
                  onChange={(e) => setSubPlayer({ ...subPlayer, uid: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg text-xs font-mono focus:ring-2 focus:ring-brand-500 ${
                    errors.sub_uid ? 'border-rose-300 bg-rose-50/50' : 'border-surface-300'
                  }`}
                />
                {errors.sub_uid && <p className="text-[11px] text-rose-600 mt-1">{errors.sub_uid}</p>}
              </div>
            </div>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-card transition-all text-sm flex items-center justify-center gap-2"
          >
            {submitting ? (
              <LoadingSpinner size="sm" text="Submitting Squad..." />
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                Submit Squad & Get Team Code
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
