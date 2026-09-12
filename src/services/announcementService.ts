import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getLocalDb, saveLocalDb } from './mockStorage';
import { Announcement, AnnouncementTarget, AnnouncementPriority } from '../types';
import { generateUuid } from '../utils/codeGenerator';

export async function getAnnouncements(targetType?: string, roundId?: string, groupId?: string): Promise<Announcement[]> {
  const db = getLocalDb();
  let announcements = db.announcements;

  if (isSupabaseConfigured) {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (data) announcements = data as Announcement[];
  }

  if (targetType) {
    announcements = announcements.filter(a => a.target_type === targetType);
  }
  if (roundId) {
    announcements = announcements.filter(a => a.round_id === roundId);
  }
  if (groupId) {
    announcements = announcements.filter(a => a.group_id === groupId);
  }

  return announcements.map(a => {
    const round = db.rounds.find(r => r.id === a.round_id);
    const group = db.groups.find(g => g.id === a.group_id);
    return {
      ...a,
      round_name: round ? round.name : undefined,
      group_name: group ? group.group_name : undefined
    };
  });
}

export async function createAnnouncement(data: {
  target_type: AnnouncementTarget;
  round_id?: string;
  group_id?: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
}): Promise<Announcement> {
  const db = getLocalDb();
  const round = data.round_id ? db.rounds.find(r => r.id === data.round_id) : undefined;
  const group = data.group_id ? db.groups.find(g => g.id === data.group_id) : undefined;

  const newAnn: Announcement = {
    id: generateUuid(),
    tournament_id: '00000000-0000-0000-0000-000000000001',
    target_type: data.target_type,
    round_id: data.round_id,
    group_id: data.group_id,
    title: data.title.trim(),
    content: data.content.trim(),
    priority: data.priority,
    created_at: new Date().toISOString()
  };

  db.announcements.unshift(newAnn);
  saveLocalDb(db);

  if (isSupabaseConfigured) {
    await supabase.from('announcements').insert(newAnn);
  }

  return {
    ...newAnn,
    round_name: round?.name,
    group_name: group?.group_name
  };
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  const db = getLocalDb();
  db.announcements = db.announcements.filter(a => a.id !== id);
  saveLocalDb(db);

  if (isSupabaseConfigured) {
    await supabase.from('announcements').delete().eq('id', id);
  }
  return true;
}
