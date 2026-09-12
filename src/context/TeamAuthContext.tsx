import React, { createContext, useContext, useState, useEffect } from 'react';
import { TeamPortalData } from '../types';
import { verifyTeamCode } from '../services/teamService';

interface TeamAuthContextType {
  activeTeamCode: string | null;
  teamPortalData: TeamPortalData | null;
  loading: boolean;
  error: string | null;
  loginWithCode: (code: string) => Promise<boolean>;
  refreshPortalData: () => Promise<void>;
  logoutTeam: () => void;
}

const TeamAuthContext = createContext<TeamAuthContextType>({
  activeTeamCode: null,
  teamPortalData: null,
  loading: false,
  error: null,
  loginWithCode: async () => false,
  refreshPortalData: async () => {},
  logoutTeam: () => {},
});

export const TeamAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTeamCode, setActiveTeamCode] = useState<string | null>(() => {
    return localStorage.getItem('REX_TEAM_CODE');
  });
  const [teamPortalData, setTeamPortalData] = useState<TeamPortalData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await verifyTeamCode(code);
      if (res.success && res.data) {
        setTeamPortalData(res.data);
        setActiveTeamCode(code.toUpperCase());
        localStorage.setItem('REX_TEAM_CODE', code.toUpperCase());
        setLoading(false);
        return true;
      } else {
        setError(res.error || 'Invalid Team Code');
        setTeamPortalData(null);
        setLoading(false);
        return false;
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed');
      setLoading(false);
      return false;
    }
  };

  useEffect(() => {
    if (activeTeamCode) {
      loadData(activeTeamCode);
    }
  }, [activeTeamCode]);

  const loginWithCode = async (code: string): Promise<boolean> => {
    return await loadData(code);
  };

  const refreshPortalData = async () => {
    if (activeTeamCode) {
      await loadData(activeTeamCode);
    }
  };

  const logoutTeam = () => {
    setActiveTeamCode(null);
    setTeamPortalData(null);
    localStorage.removeItem('REX_TEAM_CODE');
  };

  return (
    <TeamAuthContext.Provider value={{ activeTeamCode, teamPortalData, loading, error, loginWithCode, refreshPortalData, logoutTeam }}>
      {children}
    </TeamAuthContext.Provider>
  );
};

export const useTeamAuth = () => useContext(TeamAuthContext);

