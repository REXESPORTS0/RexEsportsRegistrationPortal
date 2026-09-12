import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getLocalDb, saveLocalDb } from './mockStorage';
import { Tournament } from '../types';

export async function getTournamentDetails(): Promise<Tournament> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .single();
    if (!error && data) return data as Tournament;
  }
  return getLocalDb().tournament;
}

export async function updateTournament(updates: Partial<Tournament>): Promise<Tournament> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('tournaments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', updates.id)
      .select()
      .single();
    if (!error && data) return data as Tournament;
  }

  const db = getLocalDb();
  db.tournament = { ...db.tournament, ...updates, updated_at: new Date().toISOString() };
  saveLocalDb(db);
  return db.tournament;
}

export async function getOverviewStats() {
  const db = getLocalDb();
  let teams = db.teams;
  let rounds = db.rounds;
  let idps = db.idps;
  let stream = db.liveStreams[0];

  if (isSupabaseConfigured) {
    const { data: dbTeams } = await supabase.from('teams').select('status');
    if (dbTeams) teams = dbTeams as any;

    const { data: dbRounds } = await supabase.from('rounds').select('*');
    if (dbRounds) rounds = dbRounds as any;

    const { data: dbIdps } = await supabase.from('idps').select('*');
    if (dbIdps) idps = dbIdps as any;

    const { data: dbStream } = await supabase.from('live_streams').select('*').single();
    if (dbStream) stream = dbStream as any;
  }

  return {
    totalTeams: teams.length,
    pending: teams.filter(t => t.status === 'pending').length,
    approved: teams.filter(t => t.status === 'approved').length,
    rejected: teams.filter(t => t.status === 'rejected').length,
    qualified: teams.filter(t => t.status === 'qualified').length,
    eliminated: teams.filter(t => t.status === 'eliminated').length,
    activeRounds: rounds.filter(r => r.status === 'ongoing').length,
    publishedIdps: idps.filter(i => i.is_published).length,
    streamStatus: stream ? stream.status : 'ended',
    streamTitle: stream ? stream.title : 'No stream active'
  };
}
