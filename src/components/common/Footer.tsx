import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Trophy, ExternalLink, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-900 text-surface-400 border-t border-surface-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Trophy className="w-4 h-4" />
              </div>
              <span>REX ESPORTS</span>
            </div>
            <p className="text-xs leading-relaxed text-surface-400">
              Official Battlegrounds Mobile India (BGMI) tournament management and live esports platform. Production-ready tournament operations.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs uppercase font-semibold tracking-wider text-surface-200 mb-3">Public Website</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/tournament" className="hover:text-white transition-colors">Tournament Overview</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Squad Registration</Link></li>
              <li><Link to="/teams" className="hover:text-white transition-colors">Confirmed Teams</Link></li>
              <li><Link to="/schedule" className="hover:text-white transition-colors">Match Schedule</Link></li>
            </ul>
          </div>

          {/* Col 3: Competitor Portal & Help */}
          <div>
            <h4 className="text-xs uppercase font-semibold tracking-wider text-surface-200 mb-3">Competitor Hub</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/team" className="hover:text-white transition-colors flex items-center gap-1">Team Portal Login</Link></li>
              <li><Link to="/live" className="hover:text-white transition-colors flex items-center gap-1">Live Broadcast</Link></li>
              <li><Link to="/rules" className="hover:text-white transition-colors">Rulebook & Scoring</Link></li>
              <li><Link to="/announcements" className="hover:text-white transition-colors">Official Announcements</Link></li>
            </ul>
          </div>

          {/* Col 4: Admin Access */}
          <div>
            <h4 className="text-xs uppercase font-semibold tracking-wider text-surface-200 mb-3">Organizer Panel</h4>
            <p className="text-xs leading-relaxed text-surface-400 mb-3">
              Secure tournament operations, IDP publication, match management and room credentials.
            </p>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-200 text-xs font-medium border border-surface-700 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-brand-400" />
              Organizer Login
            </Link>
          </div>

        </div>

        <div className="pt-8 border-t border-surface-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-surface-500 gap-4">
          <p>© 2026 REX Esports Organization. All rights reserved.</p>
          <p className="flex items-center gap-1">
            BGMI Tournament Platform powered by Supabase & Realtime
          </p>
        </div>
      </div>
    </footer>
  );
};

