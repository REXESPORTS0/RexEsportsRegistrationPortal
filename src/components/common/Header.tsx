import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X, Radio, Lock, Trophy } from 'lucide-react';

export const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Tournament', path: '/tournament' },
    { name: 'Register', path: '/register', highlight: true },
    { name: 'Confirmed Teams', path: '/teams' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Live Broadcast', path: '/live', isLive: true },
    { name: 'Rules', path: '/rules' },
    { name: 'Announcements', path: '/announcements' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-surface-200 shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm group-hover:bg-brand-700 transition-colors">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-surface-900 tracking-tight block leading-none">REX ESPORTS</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-brand-600 block mt-0.5">BGMI Championship</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isActive(link.path)
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : link.highlight
                    ? 'bg-brand-600 text-white hover:bg-brand-700 font-semibold shadow-xs'
                    : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
                }`}
              >
                {link.isLive && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />}
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Portal & Admin Shortcuts */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/team"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-surface-300 rounded-lg text-xs font-semibold text-surface-800 hover:bg-surface-50 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-brand-600" />
              Team Portal
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-surface-500 hover:text-surface-900 hover:bg-surface-100 transition-colors"
              title="Organizer Admin Panel"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/team"
              className="px-2.5 py-1.5 border border-surface-300 rounded-lg text-xs font-semibold text-surface-800 hover:bg-surface-50"
            >
              Team Portal
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-surface-600 hover:text-surface-900 hover:bg-surface-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-surface-200 bg-white px-4 pt-3 pb-6 space-y-1 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.path)
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : link.highlight
                  ? 'bg-brand-600 text-white font-semibold text-center'
                  : 'text-surface-700 hover:bg-surface-100'
              }`}
            >
              <div className="flex items-center gap-2">
                {link.isLive && <Radio className="w-4 h-4 text-rose-500 animate-pulse" />}
                {link.name}
              </div>
            </Link>
          ))}
          <div className="pt-3 mt-2 border-t border-surface-100 flex items-center justify-between">
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="text-xs text-surface-500 hover:text-surface-900 flex items-center gap-1 py-1"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

