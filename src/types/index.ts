export type TeamStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'qualified'
  | 'eliminated'
  | 'disqualified'
  | 'withdrawn';

export type RoundStatus = 'upcoming' | 'ongoing' | 'completed';
export type AnnouncementPriority = 'normal' | 'urgent';
export type AnnouncementTarget = 'all' | 'round' | 'group';
export type StreamPlatform = 'youtube' | 'kick' | 'custom';
export type StreamStatus = 'upcoming' | 'live' | 'ended';

export interface Tournament {
  id: string;
  name: string;
  description: string;
  rules: string;
  logo_url?: string;
  banner_url?: string;
  is_registration_open: boolean;
  status: 'upcoming' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  team_id: string;
  player_number: number; // 1: Captain/P1, 2: P2, 3: P3, 4: P4, 5: Sub
  ign: string;
  uid: string;
  is_captain: boolean;
  created_at?: string;
}

export interface Team {
  id: string;
  tournament_id: string;
  team_name: string;
  logo_url?: string;
  captain_name: string;
  captain_ign: string;
  captain_uid: string;
  captain_contact: string;
  captain_email?: string;
  team_code: string; // Random secure code (REX-7K4P9X)
  status: TeamStatus;
  created_at: string;
  updated_at: string;
  players?: Player[];
  assignment?: {
    round_id: string;
    group_id: string;
    round_name: string;
    group_name: string;
    slot_number?: number;
  };
}

export interface PlayerInput {
  ign: string;
  uid: string;
  is_captain?: boolean;
}

export interface TeamRegistrationInput {
  team_name: string;
  logo_file?: File | null;
  captain_name: string;
  captain_ign: string;
  captain_uid: string;
  captain_contact: string;
  captain_email?: string;
  players: PlayerInput[]; // Array of 3 or 4 additional players (p2, p3, p4, optional sub)
}

export interface Round {
  id: string;
  tournament_id: string;
  round_number: number;
  name: string;
  status: RoundStatus;
  created_at: string;
  groups_count?: number;
}

export interface Group {
  id: string;
  round_id: string;
  group_name: string;
  created_at: string;
  teams_count?: number;
}

export interface TeamAssignment {
  id: string;
  team_id: string;
  round_id: string;
  group_id: string;
  slot_number?: number;
  points?: number;
  matches_played?: number;
  status: 'active' | 'qualified' | 'eliminated';
  created_at: string;
  team?: Team;
  round?: Round;
  group?: Group;
}

export interface IdpDocument {
  id: string;
  tournament_id: string;
  round_id: string;
  group_id: string;
  title: string;
  file_path: string;
  file_url: string;
  file_type: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  round_name?: string;
  group_name?: string;
}

export interface Schedule {
  id: string;
  tournament_id: string;
  round_id: string;
  group_id: string;
  match_number: number;
  match_name: string;
  date_time: string;
  map_name: string;
  lobby_number: string;
  notes?: string;
  created_at: string;
  round_name?: string;
  group_name?: string;
  room_detail?: RoomDetail;
}

export interface RoomDetail {
  id: string;
  schedule_id: string;
  round_id: string;
  group_id: string;
  room_id: string;
  room_password: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  match_number?: number;
}

export interface Announcement {
  id: string;
  tournament_id: string;
  target_type: AnnouncementTarget;
  round_id?: string;
  group_id?: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  created_at: string;
  round_name?: string;
  group_name?: string;
}

export interface LiveStream {
  id: string;
  tournament_id: string;
  platform: StreamPlatform;
  stream_url: string;
  embed_url: string;
  title: string;
  status: StreamStatus;
  created_at: string;
  updated_at: string;
}

export interface AdminActivity {
  id: string;
  admin_email: string;
  action: string;
  details: Record<string, any>;
  created_at: string;
}

export interface TeamPortalData {
  team: {
    id: string;
    team_name: string;
    logo_url?: string;
    captain_name: string;
    captain_ign: string;
    captain_uid: string;
    status: TeamStatus;
    created_at: string;
  };
  players: Player[];
  assignment: {
    round_id: string;
    group_id: string;
    round_name: string;
    round_number: number;
    group_name: string;
    slot_number?: number;
  } | null;
  idp: {
    id: string;
    title: string;
    file_url: string;
    file_type: string;
    updated_at: string;
  } | null;
  schedules: Schedule[];
  room_details: RoomDetail[];
  announcements: Announcement[];
}
