import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { 
  LayoutDashboard, ClipboardList, Users, UserCheck, Layers, Grid, 
  UserPlus, FileUp, Calendar, Key, Bell, Radio, Settings, Activity, 
  LogOut, Menu, X, Shield, ExternalLink, Trophy 
} from 'lucide-react';

export const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isAdminAuthenticated, adminEmail, logout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAdminAuthenticated) {
    return <AdminLoginPage />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Registrations', path: '/admin/registrations', icon: ClipboardList },
    { name: 'Teams', path: '/admin/teams', icon: Users },
    { name: 'Players', path: '/admin/players', icon: UserCheck },
    { name: 'Rounds', path: '/admin/rounds', icon: Layers },
    { name: 'Groups', path: '/admin/groups', icon: Grid },
    { name: 'Team Assignments', path: '/admin/assignments', icon: UserPlus },
    { name: 'IDP Management', path: '/admin/idps', icon: FileUp },
    { name: 'Schedules', path: '/admin/schedules', icon: Calendar },
    { name: 'Room Details', path: '/admin/room-details', icon: Key },
    { name: 'Announcements', path: '/admin/announcements', icon: Bell },
    { name: 'Live Broadcast', path: '/admin/live', icon: Radio },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'Activity Log', path: '/admin/activity', icon: Activity },
  ];

  const isActive = (path: string) => {
    if (path === '/admin/dashboard' && (location.pathname === '/admin' || location.pathname === '/admin/dashboard')) return true;
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col font-sans">
      
      {/* Top Admin Header */}
      <header className="bg-surface-900 text-white sticky top-0 z-40 border-b border-surface-800">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left Brand & Mobile Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 lg:hidden"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <Link to="/admin/dashboard" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-sm sm:text-base tracking-tight block leading-none text-white">REX ADMIN PANEL</span>
                  <span className="text-[10px] text-surface-400 block mt-0.5 font-mono">Operations & Control</span>
                </div>
              </Link>
            </div>

            {/* Right Admin Controls */}
            <div className="flex items-center gap-3">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-xs font-medium text-surface-300 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Website
              </a>

              <div className="hidden md:block text-right">
                <p className="text-xs font-medium text-surface-200 leading-none">{adminEmail}</p>
                <p className="text-[10px] text-emerald-400 mt-0.5">● Organizer Authorized</p>
              </div>

              <button
                onClick={() => {
                  logout();
                  navigate('/admin');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>

          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-surface-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 pt-16 lg:pt-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col justify-between p-4 overflow-y-auto">
            <div className="space-y-1">
              <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-surface-400 mb-2">Management Suite</p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                      active
                        ? 'bg-brand-50 text-brand-700 font-semibold border-l-4 border-brand-600'
                        : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-brand-600' : 'text-surface-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-surface-200 text-center">
              <p className="text-[11px] font-medium text-surface-400">REX BGMI Engine v1.0</p>
            </div>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-20 bg-surface-900/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Admin View Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>

      </div>

    </div>
  );
};

