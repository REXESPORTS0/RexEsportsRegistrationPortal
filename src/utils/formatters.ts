import { TeamStatus, StreamStatus, AnnouncementPriority } from '../types';

export function formatDateTime(isoString?: string): string {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch (e) {
    return isoString;
  }
}

export function formatDateOnly(isoString?: string): string {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch (e) {
    return isoString;
  }
}

export function formatTimeOnly(isoString?: string): string {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch (e) {
    return isoString;
  }
}

export function getTeamStatusBadge(status: TeamStatus): { label: string; className: string } {
  switch (status) {
    case 'approved':
      return { label: 'Confirmed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'pending':
      return { label: 'Pending Approval', className: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'rejected':
      return { label: 'Rejected', className: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'qualified':
      return { label: 'Qualified', className: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'eliminated':
      return { label: 'Eliminated', className: 'bg-slate-100 text-slate-600 border-slate-200' };
    case 'disqualified':
      return { label: 'Disqualified', className: 'bg-red-100 text-red-800 border-red-200' };
    case 'withdrawn':
      return { label: 'Withdrawn', className: 'bg-slate-100 text-slate-500 border-slate-200' };
    default:
      return { label: status, className: 'bg-slate-50 text-slate-700 border-slate-200' };
  }
}

export function getStreamStatusBadge(status: StreamStatus): { label: string; className: string } {
  switch (status) {
    case 'live':
      return { label: '🔴 LIVE NOW', className: 'bg-rose-600 text-white animate-pulse border-rose-700' };
    case 'upcoming':
      return { label: 'Upcoming', className: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'ended':
      return { label: 'Ended', className: 'bg-slate-100 text-slate-600 border-slate-200' };
  }
}

export function getPriorityBadge(priority: AnnouncementPriority): { label: string; className: string } {
  if (priority === 'urgent') {
    return { label: 'URGENT', className: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold' };
  }
  return { label: 'NORMAL', className: 'bg-slate-100 text-slate-600 border-slate-200' };
}
