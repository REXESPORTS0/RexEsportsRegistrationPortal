import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getLocalDb, saveLocalDb } from './mockStorage';
import { AdminActivity } from '../types';
import { generateUuid } from '../utils/codeGenerator';

export async function logAdminActivity(action: string, details: Record<string, any> = {}): Promise<void> {
  const db = getLocalDb();
  const adminEmail = localStorage.getItem('REX_ADMIN_EMAIL') || 'admin@rexesports.com';
  const newActivity: AdminActivity = {
    id: generateUuid(),
    admin_email: adminEmail,
    action,
    details,
    created_at: new Date().toISOString()
  };

  db.adminActivity.unshift(newActivity);
  saveLocalDb(db);

  if (isSupabaseConfigured) {
    await supabase.from('admin_activity').insert(newActivity);
  }
}

export async function getAdminActivities(): Promise<AdminActivity[]> {
  const db = getLocalDb();
  let activities = db.adminActivity;

  if (isSupabaseConfigured) {
    const { data } = await supabase.from('admin_activity').select('*').order('created_at', { ascending: false }).limit(100);
    if (data) activities = data as AdminActivity[];
  }

  return activities;
}
