-- REX BGMI TOURNAMENT PLATFORM SCHEMA
-- Production PostgreSQL & Supabase Database Configuration

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TOURNAMENTS
CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  rules TEXT,
  logo_url TEXT,
  banner_url TEXT,
  is_registration_open BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active' CHECK (status IN ('upcoming', 'active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TEAMS
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  logo_url TEXT,
  captain_name TEXT NOT NULL,
  captain_ign TEXT NOT NULL,
  captain_uid TEXT NOT NULL,
  captain_contact TEXT NOT NULL,
  captain_email TEXT,
  team_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'qualified', 'eliminated', 'disqualified', 'withdrawn')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_tournament ON public.teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_teams_status ON public.teams(status);
CREATE INDEX IF NOT EXISTS idx_teams_code ON public.teams(team_code);

-- 3. PLAYERS
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  player_number INT NOT NULL CHECK (player_number BETWEEN 1 AND 5),
  ign TEXT NOT NULL,
  uid TEXT NOT NULL,
  is_captain BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_players_team ON public.players(team_id);

-- 4. ROUNDS
CREATE TABLE IF NOT EXISTS public.rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round_number INT NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rounds_tournament ON public.rounds(tournament_id);

-- 5. GROUPS
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_groups_round ON public.groups(round_id);

-- 6. TEAM ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.team_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  slot_number INT,
  points INT DEFAULT 0,
  matches_played INT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'qualified', 'eliminated')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, round_id)
);

CREATE INDEX IF NOT EXISTS idx_assignments_team ON public.team_assignments(team_id);
CREATE INDEX IF NOT EXISTS idx_assignments_round_group ON public.team_assignments(round_id, group_id);

-- 7. IDPS (Instruction & Data Sheets)
CREATE TABLE IF NOT EXISTS public.idps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT DEFAULT 'pdf',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_idps_round_group ON public.idps(round_id, group_id);

-- 8. SCHEDULES
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  match_number INT NOT NULL,
  match_name TEXT NOT NULL,
  date_time TIMESTAMPTZ NOT NULL,
  map_name TEXT NOT NULL,
  lobby_number TEXT DEFAULT '1',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedules_round_group ON public.schedules(round_id, group_id);

-- 9. ROOM DETAILS
CREATE TABLE IF NOT EXISTS public.room_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID UNIQUE NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  room_id TEXT NOT NULL,
  room_password TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_room_details_schedule ON public.room_details(schedule_id);
CREATE INDEX IF NOT EXISTS idx_room_details_published ON public.room_details(is_published);

-- 10. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  target_type TEXT DEFAULT 'all' CHECK (target_type IN ('all', 'round', 'group')),
  round_id UUID REFERENCES public.rounds(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_target ON public.announcements(target_type, round_id, group_id);

-- 11. LIVE STREAMS
CREATE TABLE IF NOT EXISTS public.live_streams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  platform TEXT DEFAULT 'youtube' CHECK (platform IN ('youtube', 'kick', 'custom')),
  stream_url TEXT NOT NULL,
  embed_url TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'ended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. ADMIN ACTIVITY LOG
CREATE TABLE IF NOT EXISTS public.admin_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES (No sensitive keys)
CREATE POLICY "Public tournaments read" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Public rounds read" ON public.rounds FOR SELECT USING (true);
CREATE POLICY "Public groups read" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Public schedules read" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Public global announcements read" ON public.announcements FOR SELECT USING (target_type = 'all');
CREATE POLICY "Public live streams read" ON public.live_streams FOR SELECT USING (true);

-- PUBLIC TEAM REGISTRATION
CREATE POLICY "Public register team" ON public.teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Public register players" ON public.players FOR INSERT WITH CHECK (true);

-- PUBLIC CONFIRMED TEAMS VIEW (EXCLUDES team_code, captain_contact, captain_email)
CREATE OR REPLACE VIEW public.public_confirmed_teams AS
SELECT 
  t.id,
  t.tournament_id,
  t.team_name,
  t.logo_url,
  t.captain_name,
  t.captain_ign,
  t.status,
  t.created_at,
  ta.round_id,
  ta.group_id,
  r.name AS round_name,
  g.group_name AS group_name
FROM public.teams t
LEFT JOIN public.team_assignments ta ON t.id = ta.team_id
LEFT JOIN public.rounds r ON ta.round_id = r.id
LEFT JOIN public.groups g ON ta.group_id = g.id
WHERE t.status IN ('approved', 'qualified');

-- ===================================================
-- SECURE TEAM CODE RPC FUNCTION
-- Returns Team data ONLY if input_code matches exactly.
-- NEVER exposes team_code in public queries or API lists!
-- ===================================================
CREATE OR REPLACE FUNCTION public.verify_team_code(input_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_team RECORD;
  v_players JSONB;
  v_assignment RECORD;
  v_idp RECORD;
  v_schedules JSONB;
  v_room_details JSONB;
  v_announcements JSONB;
  v_result JSONB;
BEGIN
  -- 1. Find team by code
  SELECT id, tournament_id, team_name, logo_url, captain_name, captain_ign, captain_uid, captain_contact, captain_email, status, created_at
  INTO v_team
  FROM public.teams
  WHERE UPPER(TRIM(team_code)) = UPPER(TRIM(input_code));

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid Team Code');
  END IF;

  -- 2. Fetch players
  SELECT jsonb_agg(jsonb_build_object('id', id, 'player_number', player_number, 'ign', ign, 'uid', uid, 'is_captain', is_captain))
  INTO v_players
  FROM public.players
  WHERE team_id = v_team.id;

  -- 3. Fetch latest active assignment
  SELECT ta.id, ta.round_id, ta.group_id, ta.slot_number, r.name as round_name, r.round_number, g.group_name
  INTO v_assignment
  FROM public.team_assignments ta
  JOIN public.rounds r ON ta.round_id = r.id
  JOIN public.groups g ON ta.group_id = g.id
  WHERE ta.team_id = v_team.id
  ORDER BY r.round_number DESC
  LIMIT 1;

  -- 4. Fetch IDP for assigned Round + Group
  IF v_assignment.round_id IS NOT NULL AND v_assignment.group_id IS NOT NULL THEN
    SELECT id, title, file_url, file_type, updated_at
    INTO v_idp
    FROM public.idps
    WHERE round_id = v_assignment.round_id 
      AND group_id = v_assignment.group_id 
      AND is_published = true
    ORDER BY updated_at DESC
    LIMIT 1;
    
    -- Fetch schedules for round + group
    SELECT jsonb_agg(jsonb_build_object(
      'id', s.id,
      'match_number', s.match_number,
      'match_name', s.match_name,
      'date_time', s.date_time,
      'map_name', s.map_name,
      'lobby_number', s.lobby_number,
      'notes', s.notes
    ))
    INTO v_schedules
    FROM public.schedules s
    WHERE s.round_id = v_assignment.round_id AND s.group_id = v_assignment.group_id
    ORDER BY s.match_number ASC;

    -- Fetch published room details for round + group
    SELECT jsonb_agg(jsonb_build_object(
      'schedule_id', rd.schedule_id,
      'match_number', s.match_number,
      'room_id', rd.room_id,
      'room_password', rd.room_password,
      'published_at', rd.published_at
    ))
    INTO v_room_details
    FROM public.room_details rd
    JOIN public.schedules s ON rd.schedule_id = s.id
    WHERE rd.round_id = v_assignment.round_id 
      AND rd.group_id = v_assignment.group_id
      AND rd.is_published = true;

    -- Fetch targeted announcements
    SELECT jsonb_agg(jsonb_build_object(
      'id', a.id,
      'title', a.title,
      'content', a.content,
      'priority', a.priority,
      'created_at', a.created_at
    ))
    INTO v_announcements
    FROM public.announcements a
    WHERE a.target_type = 'all'
       OR (a.target_type = 'round' AND a.round_id = v_assignment.round_id)
       OR (a.target_type = 'group' AND a.group_id = v_assignment.group_id)
    ORDER BY a.created_at DESC;

  END IF;

  v_result := jsonb_build_object(
    'success', true,
    'team', jsonb_build_object(
      'id', v_team.id,
      'team_name', v_team.team_name,
      'logo_url', v_team.logo_url,
      'captain_name', v_team.captain_name,
      'captain_ign', v_team.captain_ign,
      'captain_uid', v_team.captain_uid,
      'status', v_team.status,
      'created_at', v_team.created_at
    ),
    'players', COALESCE(v_players, '[]'::jsonb),
    'assignment', CASE WHEN v_assignment.round_id IS NOT NULL THEN jsonb_build_object(
      'round_id', v_assignment.round_id,
      'group_id', v_assignment.group_id,
      'round_name', v_assignment.round_name,
      'round_number', v_assignment.round_number,
      'group_name', v_assignment.group_name,
      'slot_number', v_assignment.slot_number
    ) ELSE NULL END,
    'idp', CASE WHEN v_idp.id IS NOT NULL THEN jsonb_build_object(
      'id', v_idp.id,
      'title', v_idp.title,
      'file_url', v_idp.file_url,
      'file_type', v_idp.file_type,
      'updated_at', v_idp.updated_at
    ) ELSE NULL END,
    'schedules', COALESCE(v_schedules, '[]'::jsonb),
    'room_details', COALESCE(v_room_details, '[]'::jsonb),
    'announcements', COALESCE(v_announcements, '[]'::jsonb)
  );

  RETURN v_result;
END;
$$;

-- SEED DEFAULT TOURNAMENT
INSERT INTO public.tournaments (id, name, description, rules, is_registration_open, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'REX BGMI PRO CHAMPIONSHIP 2026',
  'The flagship BGMI esports tournament with top tier squads competing for a 500,000 INR prize pool.',
  'Standard BGMI tournament rules apply. No hacks, emulators, or teaming allowed.',
  true,
  'active'
) ON CONFLICT (id) DO NOTHING;
