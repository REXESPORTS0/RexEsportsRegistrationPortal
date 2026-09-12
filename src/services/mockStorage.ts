import { 
  Tournament, Team, Player, Round, Group, TeamAssignment, 
  IdpDocument, Schedule, RoomDetail, Announcement, LiveStream, AdminActivity 
} from '../types';
import { generateTeamCode } from '../utils/codeGenerator';

const STORAGE_KEY = 'REX_BGMI_TOURNAMENT_DB_V1';

export interface LocalDatabase {
  tournament: Tournament;
  teams: Team[];
  players: Player[];
  rounds: Round[];
  groups: Group[];
  assignments: TeamAssignment[];
  idps: IdpDocument[];
  schedules: Schedule[];
  roomDetails: RoomDetail[];
  announcements: Announcement[];
  liveStreams: LiveStream[];
  adminActivity: AdminActivity[];
}

const DEFAULT_TOURNAMENT_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_ROUND_3_ID = 'round-003-id';
const DEFAULT_GROUP_A_ID = 'group-00a-id';
const DEFAULT_GROUP_B_ID = 'group-00b-id';

const initialDb: LocalDatabase = {
  tournament: {
    id: DEFAULT_TOURNAMENT_ID,
    name: 'REX BGMI PRO CHAMPIONSHIP 2026',
    description: 'Official Premier BGMI Esports Tournament with ₹500,000 Prize Pool.',
    rules: `1. All players must use registered IGN and UID.\n2. Emulators, hacks, and teaming up will result in immediate disqualification.\n3. Room credentials will be published in Team Portal 15 minutes before match start.\n4. Teams must take screenshot of match results for verification.`,
    is_registration_open: true,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  rounds: [
    { id: 'round-001-id', tournament_id: DEFAULT_TOURNAMENT_ID, round_number: 1, name: 'Round 1 (Qualifiers)', status: 'completed', created_at: new Date().toISOString() },
    { id: 'round-002-id', tournament_id: DEFAULT_TOURNAMENT_ID, round_number: 2, name: 'Round 2 (Quarter Finals)', status: 'completed', created_at: new Date().toISOString() },
    { id: DEFAULT_ROUND_3_ID, tournament_id: DEFAULT_TOURNAMENT_ID, round_number: 3, name: 'Round 3 (Semi Finals)', status: 'ongoing', created_at: new Date().toISOString() },
    { id: 'round-004-id', tournament_id: DEFAULT_TOURNAMENT_ID, round_number: 4, name: 'Grand Finals', status: 'upcoming', created_at: new Date().toISOString() },
  ],
  groups: [
    { id: DEFAULT_GROUP_A_ID, round_id: DEFAULT_ROUND_3_ID, group_name: 'Group A', created_at: new Date().toISOString() },
    { id: DEFAULT_GROUP_B_ID, round_id: DEFAULT_ROUND_3_ID, group_name: 'Group B', created_at: new Date().toISOString() },
    { id: 'group-00c-id', round_id: DEFAULT_ROUND_3_ID, group_name: 'Group C', created_at: new Date().toISOString() },
  ],
  teams: [
    {
      id: 'team-godlike-id',
      tournament_id: DEFAULT_TOURNAMENT_ID,
      team_name: 'GodLike Esports',
      captain_name: 'Chetan Chandgude',
      captain_ign: 'GodL Kronten',
      captain_uid: '5123456789',
      captain_contact: '+919876543210',
      captain_email: 'godlike@esports.com',
      team_code: 'REX-7K4P9X',
      status: 'approved',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'team-soul-id',
      tournament_id: DEFAULT_TOURNAMENT_ID,
      team_name: 'iQOO SOUL',
      captain_name: 'Naman Mathur',
      captain_ign: 'SOUL Mortal',
      captain_uid: '5987654321',
      captain_contact: '+919876543211',
      captain_email: 'soul@esports.com',
      team_code: 'REX-9M2N4B',
      status: 'approved',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'team-blind-id',
      tournament_id: DEFAULT_TOURNAMENT_ID,
      team_name: 'Blind Esports',
      captain_name: 'Vikram Singh',
      captain_ign: 'Blind Joker',
      captain_uid: '5443322110',
      captain_contact: '+919876543212',
      team_code: 'REX-3X8Y1Z',
      status: 'pending',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  players: [
    { id: 'p1', team_id: 'team-godlike-id', player_number: 1, ign: 'GodL Kronten', uid: '5123456789', is_captain: true },
    { id: 'p2', team_id: 'team-godlike-id', player_number: 2, ign: 'GodL Jonathan', uid: '5123456790', is_captain: false },
    { id: 'p3', team_id: 'team-godlike-id', player_number: 3, ign: 'GodL Neyoo', uid: '5123456791', is_captain: false },
    { id: 'p4', team_id: 'team-godlike-id', player_number: 4, ign: 'GodL Zgod', uid: '5123456792', is_captain: false },

    { id: 'p5', team_id: 'team-soul-id', player_number: 1, ign: 'SOUL Mortal', uid: '5987654321', is_captain: true },
    { id: 'p6', team_id: 'team-soul-id', player_number: 2, ign: 'SOUL Mavi', uid: '5987654322', is_captain: false },
    { id: 'p7', team_id: 'team-soul-id', player_number: 3, ign: 'SOUL Viper', uid: '5987654323', is_captain: false },
    { id: 'p8', team_id: 'team-soul-id', player_number: 4, ign: 'SOUL Regaltos', uid: '5987654324', is_captain: false },

    { id: 'p9', team_id: 'team-blind-id', player_number: 1, ign: 'Blind Joker', uid: '5443322110', is_captain: true },
    { id: 'p10', team_id: 'team-blind-id', player_number: 2, ign: 'Blind Max', uid: '5443322111', is_captain: false },
    { id: 'p11', team_id: 'team-blind-id', player_number: 3, ign: 'Blind Apex', uid: '5443322112', is_captain: false },
    { id: 'p12', team_id: 'team-blind-id', player_number: 4, ign: 'Blind Venom', uid: '5443322113', is_captain: false },
  ],
  assignments: [
    {
      id: 'assign-godlike-id',
      team_id: 'team-godlike-id',
      round_id: DEFAULT_ROUND_3_ID,
      group_id: DEFAULT_GROUP_A_ID,
      slot_number: 1,
      points: 45,
      matches_played: 3,
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 'assign-soul-id',
      team_id: 'team-soul-id',
      round_id: DEFAULT_ROUND_3_ID,
      group_id: DEFAULT_GROUP_B_ID,
      slot_number: 1,
      points: 38,
      matches_played: 3,
      status: 'active',
      created_at: new Date().toISOString()
    }
  ],
  idps: [
    {
      id: 'idp-r3-g-a',
      tournament_id: DEFAULT_TOURNAMENT_ID,
      round_id: DEFAULT_ROUND_3_ID,
      group_id: DEFAULT_GROUP_A_ID,
      title: 'Round 3 Group A Match Instruction Sheet',
      file_path: 'idp/round-3/group-a/R3_Group_A_Instructions.pdf',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_type: 'pdf',
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  schedules: [
    {
      id: 'sched-m1-r3a',
      tournament_id: DEFAULT_TOURNAMENT_ID,
      round_id: DEFAULT_ROUND_3_ID,
      group_id: DEFAULT_GROUP_A_ID,
      match_number: 1,
      match_name: 'Match 1 - Erangel',
      date_time: new Date(Date.now() + 3600000 * 2).toISOString(),
      map_name: 'Erangel',
      lobby_number: 'Lobby 1',
      notes: 'Teams must join 10 minutes prior to match time.',
      created_at: new Date().toISOString()
    },
    {
      id: 'sched-m2-r3a',
      tournament_id: DEFAULT_TOURNAMENT_ID,
      round_id: DEFAULT_ROUND_3_ID,
      group_id: DEFAULT_GROUP_A_ID,
      match_number: 2,
      match_name: 'Match 2 - Miramar',
      date_time: new Date(Date.now() + 3600000 * 4).toISOString(),
      map_name: 'Miramar',
      lobby_number: 'Lobby 1',
      notes: 'Aggressive points multiplier match.',
      created_at: new Date().toISOString()
    }
  ],
  roomDetails: [
    {
      id: 'room-m1-r3a',
      schedule_id: 'sched-m1-r3a',
      round_id: DEFAULT_ROUND_3_ID,
      group_id: DEFAULT_GROUP_A_ID,
      room_id: '8910452',
      room_password: 'REX99',
      is_published: true,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
  ],
  announcements: [
    {
      id: 'ann-1',
      tournament_id: DEFAULT_TOURNAMENT_ID,
      target_type: 'all',
      title: 'Welcome to REX BGMI Pro Championship 2026',
      content: 'Round 3 Semi Finals are now underway. Ensure your team captains check the Team Portal for IDPs and match schedules.',
      priority: 'urgent',
      created_at: new Date().toISOString()
    },
    {
      id: 'ann-2',
      tournament_id: DEFAULT_TOURNAMENT_ID,
      target_type: 'group',
      round_id: DEFAULT_ROUND_3_ID,
      group_id: DEFAULT_GROUP_A_ID,
      title: 'Round 3 Group A Slot Check',
      content: 'All Group A teams must confirm their presence in discord channel #group-a-checkin by 6:30 PM.',
      priority: 'normal',
      created_at: new Date().toISOString()
    }
  ],
  liveStreams: [
    {
      id: 'stream-1',
      tournament_id: DEFAULT_TOURNAMENT_ID,
      platform: 'youtube',
      stream_url: 'https://www.youtube.com/watch?v=live_stream_rex',
      embed_url: 'https://www.youtube.com/embed/jfKfPfyJRdk',
      title: '🔴 REX BGMI PRO CHAMPIONSHIP - ROUND 3 SEMI FINALS',
      status: 'live',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  adminActivity: [
    {
      id: 'act-1',
      admin_email: 'admin@rexesports.com',
      action: 'APPROVED_TEAM',
      details: { team_name: 'GodLike Esports', team_code: 'REX-7K4P9X' },
      created_at: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
      id: 'act-2',
      admin_email: 'admin@rexesports.com',
      action: 'PUBLISHED_IDP',
      details: { round_name: 'Round 3', group_name: 'Group A', title: 'Round 3 Group A Match Instruction Sheet' },
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ]
};

export function getLocalDb(): LocalDatabase {
  if (typeof window === 'undefined') return initialDb;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDb));
    return initialDb;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return initialDb;
  }
}

export function saveLocalDb(db: LocalDatabase): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    // Trigger window custom event for local realtime synchronization across tabs
    window.dispatchEvent(new Event('rex_db_updated'));
  }
}
