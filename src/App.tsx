import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AdminAuthProvider } from './context/AdminAuthContext';
import { TeamAuthProvider } from './context/TeamAuthContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { TeamLayout } from './layouts/TeamLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { TournamentDetailsPage } from './pages/public/TournamentDetailsPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ConfirmedTeamsPage } from './pages/public/ConfirmedTeamsPage';
import { MatchSchedulePage } from './pages/public/MatchSchedulePage';
import { LiveBroadcastPage } from './pages/public/LiveBroadcastPage';
import { RulesPage } from './pages/public/RulesPage';
import { AnnouncementsPage } from './pages/public/AnnouncementsPage';

// Team Portal Pages
import { TeamDashboardPage } from './pages/team/TeamDashboardPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminRegistrationsPage } from './pages/admin/AdminRegistrationsPage';
import { AdminTeamsPage } from './pages/admin/AdminTeamsPage';
import { AdminPlayersPage } from './pages/admin/AdminPlayersPage';
import { AdminRoundsPage } from './pages/admin/AdminRoundsPage';
import { AdminGroupsPage } from './pages/admin/AdminGroupsPage';
import { AdminAssignmentsPage } from './pages/admin/AdminAssignmentsPage';
import { AdminIdpPage } from './pages/admin/AdminIdpPage';
import { AdminSchedulesPage } from './pages/admin/AdminSchedulesPage';
import { AdminRoomDetailsPage } from './pages/admin/AdminRoomDetailsPage';
import { AdminAnnouncementsPage } from './pages/admin/AdminAnnouncementsPage';
import { AdminLiveBroadcastPage } from './pages/admin/AdminLiveBroadcastPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminActivityLogPage } from './pages/admin/AdminActivityLogPage';

export const App: React.FC = () => {
  return (
    <Router>
      <AdminAuthProvider>
        <TeamAuthProvider>
          <Routes>
            
            {/* PUBLIC WEBSITE ROUTES */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="tournament" element={<TournamentDetailsPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="teams" element={<ConfirmedTeamsPage />} />
              <Route path="schedule" element={<MatchSchedulePage />} />
              <Route path="live" element={<LiveBroadcastPage />} />
              <Route path="rules" element={<RulesPage />} />
              <Route path="announcements" element={<AnnouncementsPage />} />
            </Route>

            {/* COMPETITOR TEAM PORTAL ROUTES */}
            <Route
              path="/team/*"
              element={
                <TeamLayout>
                  <Routes>
                    <Route index element={<TeamDashboardPage />} />
                  </Routes>
                </TeamLayout>
              }
            />

            {/* ORGANIZER ADMIN PANEL ROUTES */}
            <Route
              path="/admin/*"
              element={
                <AdminLayout>
                  <Routes>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="registrations" element={<AdminRegistrationsPage />} />
                    <Route path="teams" element={<AdminTeamsPage />} />
                    <Route path="players" element={<AdminPlayersPage />} />
                    <Route path="rounds" element={<AdminRoundsPage />} />
                    <Route path="groups" element={<AdminGroupsPage />} />
                    <Route path="assignments" element={<AdminAssignmentsPage />} />
                    <Route path="idps" element={<AdminIdpPage />} />
                    <Route path="schedules" element={<AdminSchedulesPage />} />
                    <Route path="room-details" element={<AdminRoomDetailsPage />} />
                    <Route path="announcements" element={<AdminAnnouncementsPage />} />
                    <Route path="live" element={<AdminLiveBroadcastPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                    <Route path="activity" element={<AdminActivityLogPage />} />
                  </Routes>
                </AdminLayout>
              }
            />

            {/* FALLBACK CATCH-ALL */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </TeamAuthProvider>
      </AdminAuthProvider>
    </Router>
  );
};
