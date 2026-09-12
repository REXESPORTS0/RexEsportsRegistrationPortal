import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getLocalDb, saveLocalDb } from './mockStorage';
import { Team, TeamRegistrationInput, Player, TeamPortalData, Round, Group, TeamAssignment, Schedule, RoomDetail, Announcement } from '../types';
import { generateTeamCode, generateUuid } from '../utils/codeGenerator';

export async function registerTeam(input: TeamRegistrationInput): Promise<{ success: boolean; team?: Team; team_code?: string; error?: string }> {
  const teamCode = generateTeamCode('REX');
  const now = new Date().toISOString();
  const teamId = generateUuid();

  let logoUrl = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=120&q=80';

  if (input.logo_file && isSupabaseConfigured) {
    const fileExt = input.logo_file.name.split('.').pop();
    const filePath = `team-logos/${teamId}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(filePath, input.logo_file, { upsert: true });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(filePath);
      logoUrl = publicUrlData.publicUrl;
    }
  }

  // AUTO-APPROVED DIRECTLY UPON SUBMISSION
  const newTeam: Team = {
    id: teamId,
    tournament_id: '00000000-0000-0000-0000-000000000001',
    team_name: input.team_name.trim(),
    logo_url: logoUrl,
    captain_name: input.captain_name.trim(),
    captain_ign: input.captain_ign.trim(),
    captain_uid: input.captain_uid.trim(),
    captain_contact: input.captain_contact.trim(),
    captain_email: input.captain_email?.trim(),
    team_code: teamCode,
    status: 'approved', // Auto-approved directly!
    created_at: now,
    updated_at: now
  };

  const players: Player[] = [
    {
      id: generateUuid(),
      team_id: teamId,
      player_number: 1,
      ign: input.captain_ign.trim(),
      uid: input.captain_uid.trim(),
      is_captain: true,
      created_at: now
    },
    ...input.players.map((p, idx) => ({
      id: generateUuid(),
      team_id: teamId,
      player_number: idx + 2,
      ign: p.ign.trim(),
      uid: p.uid.trim(),
      is_captain: false,
      created_at: now
    }))
  ];

  if (isSupabaseConfigured) {
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .insert([newTeam])
      .select()
      .single();

    if (teamError) {
      return { success: false, error: teamError.message };
    }

    const { error: playerError } = await supabase
      .from('players')
      .insert(players);

    if (playerError) {
      return { success: false, error: playerError.message };
    }

    return { success: true, team: teamData as Team, team_code: teamCode };
  }

  // Local Storage Fallback
  const db = getLocalDb();
  db.teams.unshift(newTeam);
  db.players.push(...players);
  saveLocalDb(db);

  return { success: true, team: newTeam, team_code: teamCode };
}

export async function getConfirmedTeams(search?: string, roundId?: string, groupId?: string): Promise<Team[]> {
  const db = getLocalDb();
  let confirmed = db.teams.filter(t => t.status === 'approved' || t.status === 'qualified');

  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('public_confirmed_teams').select('*');
    if (!error && data) confirmed = data as any;
  }

  let safeTeams: Team[] = confirmed.map(t => ({
    id: t.id,
    tournament_id: t.tournament_id,
    team_name: t.team_name,
    logo_url: t.logo_url,
    captain_name: t.captain_name,
    captain_ign: t.captain_ign,
    captain_uid: '••••••••',
    captain_contact: '••••••••••',
    captain_email: undefined,
    team_code: 'REDACTED',
    status: t.status,
    created_at: t.created_at,
    updated_at: t.updated_at,
    players: db.players.filter(p => p.team_id === t.id).map(p => ({
      ...p,
      uid: '••••••••'
    })),
    assignment: (() => {
      const ta = db.assignments.find(a => a.team_id === t.id);
      if (!ta) return undefined;
      const round = db.rounds.find(r => r.id === ta.round_id);
      const group = db.groups.find(g => g.id === ta.group_id);
      return {
        round_id: ta.round_id,
        group_id: ta.group_id,
        round_name: round ? round.name : 'Round',
        group_name: group ? group.group_name : 'Group',
        slot_number: ta.slot_number
      };
    })()
  }));

  if (search && search.trim()) {
    const query = search.trim().toLowerCase();
    safeTeams = safeTeams.filter(t => t.team_name.toLowerCase().includes(query) || t.captain_ign.toLowerCase().includes(query));
  }

  if (roundId) {
    safeTeams = safeTeams.filter(t => t.assignment?.round_id === roundId);
  }
  if (groupId) {
    safeTeams = safeTeams.filter(t => t.assignment?.group_id === groupId);
  }

  return safeTeams;
}

export async function getAllRegistrations(statusFilter?: string): Promise<Team[]> {
  const db = getLocalDb();
  let teams = db.teams;

  if (isSupabaseConfigured) {
    const { data } = await supabase.from('teams').select('*').order('created_at', { ascending: false });
    if (data) teams = data as Team[];
  }

  if (statusFilter && statusFilter !== 'all') {
    teams = teams.filter(t => t.status === statusFilter);
  }

  return teams.map(t => ({
    ...t,
    players: db.players.filter(p => p.team_id === t.id),
    assignment: (() => {
      const ta = db.assignments.find(a => a.team_id === t.id);
      if (!ta) return undefined;
      const round = db.rounds.find(r => r.id === ta.round_id);
      const group = db.groups.find(g => g.id === ta.group_id);
      return {
        round_id: ta.round_id,
        group_id: ta.group_id,
        round_name: round ? round.name : 'Round',
        group_name: group ? group.group_name : 'Group',
        slot_number: ta.slot_number
      };
    })()
  }));
}

export async function updateTeamStatus(teamId: string, status: Team['status']): Promise<{ success: boolean; team_code?: string; error?: string }> {
  const db = getLocalDb();
  const team = db.teams.find(t => t.id === teamId);
  if (!team) return { success: false, error: 'Team not found' };

  if (!team.team_code || team.team_code === 'REDACTED') {
    team.team_code = generateTeamCode('REX');
  }

  team.status = status;
  team.updated_at = new Date().toISOString();

  if (isSupabaseConfigured) {
    await supabase
      .from('teams')
      .update({ status, team_code: team.team_code, updated_at: team.updated_at })
      .eq('id', teamId);
  }

  saveLocalDb(db);
  return { success: true, team_code: team.team_code };
}

export async function updateTeamDetails(teamId: string, updates: Partial<Team>): Promise<boolean> {
  const db = getLocalDb();
  const idx = db.teams.findIndex(t => t.id === teamId);
  if (idx >= 0) {
    db.teams[idx] = { ...db.teams[idx], ...updates, updated_at: new Date().toISOString() };
    saveLocalDb(db);
  }

  if (isSupabaseConfigured) {
    await supabase.from('teams').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', teamId);
  }

  return true;
}

export async function deleteTeam(teamId: string): Promise<boolean> {
  const db = getLocalDb();
  db.teams = db.teams.filter(t => t.id !== teamId);
  db.players = db.players.filter(p => p.team_id !== teamId);
  db.assignments = db.assignments.filter(a => a.team_id !== teamId);
  saveLocalDb(db);

  if (isSupabaseConfigured) {
    await supabase.from('teams').delete().eq('id', teamId);
  }

  return true;
}

export async function regenerateTeamCode(teamId: string): Promise<{ success: boolean; new_code?: string }> {
  const newCode = generateTeamCode('REX');
  const db = getLocalDb();
  const team = db.teams.find(t => t.id === teamId);
  if (team) {
    team.team_code = newCode;
    team.updated_at = new Date().toISOString();
    saveLocalDb(db);
  }

  if (isSupabaseConfigured) {
    await supabase.from('teams').update({ team_code: newCode, updated_at: new Date().toISOString() }).eq('id', teamId);
  }

  return { success: true, new_code: newCode };
}

export async function verifyTeamCode(inputCode: string): Promise<{ success: boolean; data?: TeamPortalData; error?: string }> {
  const cleanCode = inputCode.trim().toUpperCase();

  if (isSupabaseConfigured) {
    const { data, error } = await supabase.rpc('verify_team_code', { input_code: cleanCode });
    if (!error && data && data.success) {
      return { success: true, data: data as TeamPortalData };
    }
  }

  const db = getLocalDb();
  const team = db.teams.find(t => t.team_code.toUpperCase() === cleanCode);

  if (!team) {
    return { success: false, error: 'Invalid Team Access Code. Check your code or verify status with organizers.' };
  }

  const players = db.players.filter(p => p.team_id === team.id);
  const ta = db.assignments.find(a => a.team_id === team.id);
  const round = ta ? db.rounds.find(r => r.id === ta.round_id) : null;
  const group = ta ? db.groups.find(g => g.id === ta.group_id) : null;

  let idp = null;
  let schedules: Schedule[] = [];
  let roomDetails: RoomDetail[] = [];
  let announcements: Announcement[] = [];

  if (ta && round && group) {
    const foundIdp = db.idps.find(i => i.round_id === ta.round_id && i.group_id === ta.group_id && i.is_published);
    if (foundIdp) {
      idp = {
        id: foundIdp.id,
        title: foundIdp.title,
        file_url: foundIdp.file_url,
        file_type: foundIdp.file_type,
        updated_at: foundIdp.updated_at
      };
    }

    schedules = db.schedules
      .filter(s => s.round_id === ta.round_id && s.group_id === ta.group_id)
      .sort((a, b) => a.match_number - b.match_number);

    roomDetails = db.roomDetails.filter(rd => rd.round_id === ta.round_id && rd.group_id === ta.group_id && rd.is_published);

    announcements = db.announcements.filter(a => 
      a.target_type === 'all' ||
      (a.target_type === 'round' && a.round_id === ta.round_id) ||
      (a.target_type === 'group' && a.group_id === ta.group_id)
    );
  } else {
    announcements = db.announcements.filter(a => a.target_type === 'all');
  }

  return {
    success: true,
    data: {
      team: {
        id: team.id,
        team_name: team.team_name,
        logo_url: team.logo_url,
        captain_name: team.captain_name,
        captain_ign: team.captain_ign,
        captain_uid: team.captain_uid,
        status: team.status,
        created_at: team.created_at
      },
      players,
      assignment: ta && round && group ? {
        round_id: ta.round_id,
        group_id: ta.group_id,
        round_name: round.name,
        round_number: round.round_number,
        group_name: group.group_name,
        slot_number: ta.slot_number
      } : null,
      idp,
      schedules,
      room_details: roomDetails,
      announcements
    }
  };
}

export async function assignTeamToGroup(teamId: string, roundId: string, groupId: string, slotNumber?: number): Promise<boolean> {
  const db = getLocalDb();
  const existingIdx = db.assignments.findIndex(a => a.team_id === teamId && a.round_id === roundId);
  const newAssign: TeamAssignment = {
    id: generateUuid(),
    team_id: teamId,
    round_id: roundId,
    group_id: groupId,
    slot_number: slotNumber || 1,
    points: 0,
    matches_played: 0,
    status: 'active',
    created_at: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    db.assignments[existingIdx] = newAssign;
  } else {
    db.assignments.push(newAssign);
  }

  saveLocalDb(db);

  if (isSupabaseConfigured) {
    await supabase.from('team_assignments').upsert(newAssign);
  }

  return true;
}

export async function autoAssignTeamsToGroups(roundId: string): Promise<{ assignedCount: number }> {
  const db = getLocalDb();
  const roundGroups = db.groups.filter(g => g.round_id === roundId);
  if (roundGroups.length === 0) return { assignedCount: 0 };

  const approvedTeams = db.teams.filter(t => t.status === 'approved' || t.status === 'qualified');
  let count = 0;

  approvedTeams.forEach((t, idx) => {
    const existing = db.assignments.find(a => a.team_id === t.id && a.round_id === roundId);
    if (!existing) {
      const targetGroup = roundGroups[idx % roundGroups.length];
      const groupAssignmentsCount = db.assignments.filter(a => a.round_id === roundId && a.group_id === targetGroup.id).length;
      const slotNum = (groupAssignmentsCount % 20) + 1;

      db.assignments.push({
        id: generateUuid(),
        team_id: t.id,
        round_id: roundId,
        group_id: targetGroup.id,
        slot_number: slotNum,
        points: 0,
        matches_played: 0,
        status: 'active',
        created_at: new Date().toISOString()
      });

      count++;
    }
  });

  saveLocalDb(db);
  return { assignedCount: count };
}

export async function getRoundsAndGroups(): Promise<{ rounds: Round[]; groups: Group[] }> {
  const db = getLocalDb();
  let rounds = db.rounds;
  let groups = db.groups;

  if (isSupabaseConfigured) {
    const { data: rData } = await supabase.from('rounds').select('*').order('round_number', { ascending: true });
    const { data: gData } = await supabase.from('groups').select('*');
    if (rData) rounds = rData as Round[];
    if (gData) groups = gData as Group[];
  }

  return { rounds, groups };
}

export async function createRound(name: string, roundNumber: number): Promise<Round> {
  const db = getLocalDb();
  const newRound: Round = {
    id: generateUuid(),
    tournament_id: '00000000-0000-0000-0000-000000000001',
    round_number: roundNumber,
    name,
    status: 'upcoming',
    created_at: new Date().toISOString()
  };
  db.rounds.push(newRound);
  saveLocalDb(db);

  if (isSupabaseConfigured) {
    await supabase.from('rounds').insert(newRound);
  }
  return newRound;
}

export async function updateRound(roundId: string, name: string, status: Round['status']): Promise<boolean> {
  const db = getLocalDb();
  const round = db.rounds.find(r => r.id === roundId);
  if (round) {
    round.name = name;
    round.status = status;
    saveLocalDb(db);
  }

  if (isSupabaseConfigured) {
    await supabase.from('rounds').update({ name, status }).eq('id', roundId);
  }

  return true;
}

export async function deleteRound(roundId: string): Promise<boolean> {
  const db = getLocalDb();
  db.rounds = db.rounds.filter(r => r.id !== roundId);
  db.groups = db.groups.filter(g => g.round_id !== roundId);
  db.assignments = db.assignments.filter(a => a.round_id !== roundId);
  db.schedules = db.schedules.filter(s => s.round_id !== roundId);
  db.idps = db.idps.filter(i => i.round_id !== roundId);
  saveLocalDb(db);

  if (isSupabaseConfigured) {
    await supabase.from('rounds').delete().eq('id', roundId);
  }

  return true;
}

export async function createGroup(roundId: string, groupName: string): Promise<Group> {
  const db = getLocalDb();
  const newGroup: Group = {
    id: generateUuid(),
    round_id: roundId,
    group_name: groupName,
    created_at: new Date().toISOString()
  };
  db.groups.push(newGroup);
  saveLocalDb(db);

  if (isSupabaseConfigured) {
    await supabase.from('groups').insert(newGroup);
  }
  return newGroup;
}

export async function updateGroup(groupId: string, groupName: string): Promise<boolean> {
  const db = getLocalDb();
  const group = db.groups.find(g => g.id === groupId);
  if (group) {
    group.group_name = groupName;
    saveLocalDb(db);
  }

  if (isSupabaseConfigured) {
    await supabase.from('groups').update({ group_name: groupName }).eq('id', groupId);
  }

  return true;
}

export async function deleteGroup(groupId: string): Promise<boolean> {
  const db = getLocalDb();
  db.groups = db.groups.filter(g => g.id !== groupId);
  db.assignments = db.assignments.filter(a => a.group_id !== groupId);
  db.schedules = db.schedules.filter(s => s.group_id !== groupId);
  db.idps = db.idps.filter(i => i.group_id !== groupId);
  saveLocalDb(db);

  if (isSupabaseConfigured) {
    await supabase.from('groups').delete().eq('id', groupId);
  }

  return true;
}

export async function updatePlayer(playerId: string, ign: string, uid: string): Promise<boolean> {
  const db = getLocalDb();
  const p = db.players.find(player => player.id === playerId);
  if (p) {
    p.ign = ign.trim();
    p.uid = uid.trim();
    saveLocalDb(db);
  }

  if (isSupabaseConfigured) {
    await supabase.from('players').update({ ign: ign.trim(), uid: uid.trim() }).eq('id', playerId);
  }

  return true;
}
