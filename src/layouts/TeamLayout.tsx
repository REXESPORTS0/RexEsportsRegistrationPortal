import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTeamAuth } from '../context/TeamAuthContext';
import { Trophy, LogOut, RefreshCw, ShieldAlert, CheckCircle2, User, FileText, Calendar, Key, Bell, Radio } from 'lucide-react';
import { TeamLoginPage } from '../pages/team/TeamLoginPage';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const TeamLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { activeTeamCode, teamPortalData, loading, logoutTeam, refreshPortalData } = useTeamAuth();
  const navigate = useNavigate();

  if (!activeTeamCode || !teamPortalData) {
    return <TeamLoginPage />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
        <LoadingSpinner text="Authenticating Team Access Code..." size="lg" />
      </div>
    );
  }

  const { team, assignment } = teamPortalData;

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col font-sans">
      
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-surface-200 sticky top-0 z-30 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                  <Trophy className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm sm:text-base text-surface-900">REX TEAM PORTAL</span>
              </Link>
            </div>

            {/* Team Identity Badge */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-surface-100 border border-surface-200 rounded-lg">
                <img 
                  src={team.logo_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=120&q=80'} 
                  alt={team.team_name} 
                  className="w-6 h-6 rounded-md object-cover"
                />
                <div className="text-left">
                  <p className="text-xs font-bold text-surface-900 leading-none">{team.team_name}</p>
                  <p className="text-[10px] text-surface-500 mt-0.5">Code: <span className="font-mono text-brand-600 font-semibold">{activeTeamCode}</span></p>
                </div>
              </div>

              <button
                onClick={refreshPortalData}
                className="p-2 text-surface-500 hover:text-surface-900 hover:bg-surface-100 rounded-lg transition-colors"
                title="Refresh Realtime Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  logoutTeam();
                  navigate('/team');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-surface-200 py-4 text-center text-xs text-surface-500">
        <p>Private Competitor Dashboard • Keep your Team Access Code confidential.</p>
      </footer>

    </div>
  );
};

