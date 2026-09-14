import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getLocalDb, saveLocalDb } from './mockStorage';
import { Schedule, RoomDetail } from '../types';
import { generateUuid } from '../utils/codeGenerator';

export async function getSchedules(roundId?: string, groupId?: string): Promise<Schedule[]> {
  const db = getLocalDb();
  let schedules = db.schedules;
  let supabaseRounds: any[] = [];
  let supabaseGroups: any[] = [];
  let supabaseRooms: any[] = [];

  if (isSupabaseConfigured) {
    const { data: sData } = await supabase.from('schedules').select('*').order('match_number', { ascending: true });
    const { data: rData } = await supabase.from('rounds').select('*');
    const { data: gData } = await supabase.from('groups').select('*');
    const { data: roomData } = await supabase.from('room_details').select('*');

    if (sData) schedules = sData as Schedule[];
    if (rData) supabaseRounds = rData;
    if (gData) supabaseGroups = gData;
    if (roomData) supabaseRooms = roomData;
  }

  if (roundId) {
    schedules = schedules.filter(s => s.round_id === roundId);
  }
  if (groupId) {
    schedules = schedules.filter(s => s.group_id === groupId);
  }

  const allRounds = isSupabaseConfigured && supabaseRounds.length > 0 ? supabaseRounds : db.rounds;
  const allGroups = isSupabaseConfigured && supabaseGroups.length > 0 ? supabaseGroups : db.groups;
  const allRooms = isSupabaseConfigured && supabaseRooms.length > 0 ? supabaseRooms : db.roomDetails;

  return schedules.map(s => {
    const round = allRounds.find(r => r.id === s.round_id);
    const group = allGroups.find(g => g.id === s.group_id);
    const room = allRooms.find(r => r.schedule_id === s.id);
    return {
      ...s,
      round_name: round ? round.name : 'Round',
      group_name: group ? group.group_name : 'Group',
      room_detail: room
    };
  });
}

export async function createSchedule(data: {
  round_id: string;
  group_id: string;
  match_number: number;
  match_name: string;
  date_time: string;
  map_name: string;
  lobby_number?: string;
  notes?: string;
}): Promise<Schedule> {
  const db = getLocalDb();
  const round = db.rounds.find(r => r.id === data.round_id);
  const group = db.groups.find(g => g.id === data.group_id);

  const newSchedule: Schedule = {
    id: generateUuid(),
    tournament_id: '00000000-0000-0000-0000-000000000001',
    round_id: data.round_id,
    group_id: data.group_id,
    match_number: data.match_number,
    match_name: data.match_name.trim(),
    date_time: data.date_time,
    map_name: data.map_name.trim(),
    lobby_number: data.lobby_number?.trim() || 'Lobby 1',
    notes: data.notes?.trim(),
    created_at: new Date().toISOString()
  };

  db.schedules.push(newSchedule);
  saveLocalDb(db);

  if (isSupabaseConfigured) {
    await supabase.from('tournaments').upsert(db.tournament);
    if (round) await supabase.from('rounds').upsert(round);
    if (group) await supabase.from('groups').upsert(group);
    const { error } = await supabase.from('schedules').insert(newSchedule);
    if (error) console.error('Error inserting schedule in Supabase:', error);
  }

  return {
    ...newSchedule,
    round_name: round ? round.name : 'Round',
    group_name: group ? group.group_name : 'Group'
  };
}

export async function deleteSchedule(scheduleId: string): Promise<boolean> {
  const db = getLocalDb();
  db.schedules = db.schedules.filter(s => s.id !== scheduleId);
  db.roomDetails = db.roomDetails.filter(rd => rd.schedule_id !== scheduleId);
  saveLocalDb(db);

  if (isSupabaseConfigured) {
    await supabase.from('schedules').delete().eq('id', scheduleId);
  }
  return true;
}

export async function publishRoomDetails(
  scheduleId: string,
  roomId: string,
  roomPassword: string
): Promise<RoomDetail> {
  const db = getLocalDb();
  const schedule = db.schedules.find(s => s.id === scheduleId);
  if (!schedule) throw new Error('Schedule match not found');

  const existingIdx = db.roomDetails.findIndex(rd => rd.schedule_id === scheduleId);
  const now = new Date().toISOString();

  const newRoomDetail: RoomDetail = {
    id: existingIdx >= 0 ? db.roomDetails[existingIdx].id : generateUuid(),
    schedule_id: scheduleId,
    round_id: schedule.round_id,
    group_id: schedule.group_id,
    room_id: roomId.trim(),
    room_password: roomPassword.trim(),
    is_published: true,
    published_at: now,
    created_at: existingIdx >= 0 ? db.roomDetails[existingIdx].created_at : now,
    match_number: schedule.match_number
  };

  if (existingIdx >= 0) {
    db.roomDetails[existingIdx] = newRoomDetail;
  } else {
    db.roomDetails.unshift(newRoomDetail);
  }

  saveLocalDb(db);

  if (isSupabaseConfigured) {
    await supabase.from('room_details').upsert(newRoomDetail);
  }

  return newRoomDetail;
}

export async function unpublishRoomDetails(scheduleId: string): Promise<boolean> {
  const db = getLocalDb();
  const room = db.roomDetails.find(rd => rd.schedule_id === scheduleId);
  if (room) {
    room.is_published = false;
    saveLocalDb(db);
  }

  if (isSupabaseConfigured) {
    await supabase.from('room_details').update({ is_published: false }).eq('schedule_id', scheduleId);
  }
  return true;
}
