-- ==============================================================================
-- Migration: 2026-09-13
-- 1. Create group "ولا كلمة" in category_groups and link wla_kelma category
-- 2. Make answer_text optional (nullable with default '') in question_bank and room_question_answers
-- 3. Create support_messages table with Row Level Security (RLS)
-- 4. Create cancel_team_strikes function for referee to cancel accidentally awarded strikes
-- ==============================================================================

-- 1. Ensure "ولا كلمة" exists as a group
INSERT INTO public.category_groups (id, name)
VALUES (
  'd6a55dbb-85dd-4245-985e-e3d7e5d1e000',
  'ولا كلمة'
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Link wla_kelma category to the new group
UPDATE public.question_categories
SET group_id = 'd6a55dbb-85dd-4245-985e-e3d7e5d1e000'
WHERE id = 'wla_kelma';

-- 2. Make answer_text optional in question_bank and room_question_answers
ALTER TABLE public.question_bank ALTER COLUMN answer_text DROP NOT NULL;
ALTER TABLE public.question_bank ALTER COLUMN answer_text SET DEFAULT '';

ALTER TABLE public.room_question_answers ALTER COLUMN answer_text DROP NOT NULL;
ALTER TABLE public.room_question_answers ALTER COLUMN answer_text SET DEFAULT '';

-- 3. Create support_messages table
CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.game_rooms(id) ON DELETE SET NULL,
  sender_role TEXT NOT NULL DEFAULT 'referee',
  sender_name TEXT,
  sender_email TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  page_url TEXT,
  status TEXT NOT NULL DEFAULT 'unread',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure columns exist if table was already created
ALTER TABLE public.support_messages ADD COLUMN IF NOT EXISTS sender_email TEXT;
ALTER TABLE public.support_messages ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE public.support_messages ADD COLUMN IF NOT EXISTS page_url TEXT;
ALTER TABLE public.support_messages ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.support_messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert support_messages" ON public.support_messages;
CREATE POLICY "Allow public insert support_messages" ON public.support_messages
  FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin manage support_messages" ON public.support_messages;
CREATE POLICY "Allow admin manage support_messages" ON public.support_messages
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_messages TO authenticated, anon, service_role;

-- 4. Create cancel_team_strikes RPC
CREATE OR REPLACE FUNCTION public.cancel_team_strikes(
  p_room_id uuid,
  p_team_index integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room game_rooms%ROWTYPE;
  v_team teams%ROWTYPE;
BEGIN
  SELECT * INTO v_room FROM game_rooms WHERE id = p_room_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'الغرفة غير موجودة.';
  END IF;

  IF auth.role() != 'service_role' AND v_room.judge_id != auth.uid() THEN
    RAISE EXCEPTION 'الحكم فقط يملك صلاحية إلغاء الضربات.';
  END IF;

  SELECT * INTO v_team FROM teams
  WHERE room_id = p_room_id AND team_index = p_team_index FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'الفريق غير موجود.';
  END IF;

  UPDATE public.teams
  SET available_strikes = 0,
      updated_at = now()
  WHERE id = v_team.id;

  INSERT INTO public.combat_events (
    room_id,
    event_type,
    actor_team_index,
    result,
    metadata
  ) VALUES (
    p_room_id,
    'strike_cancelled',
    p_team_index,
    'cancelled',
    jsonb_build_object('action', 'strike_cancelled', 'team_index', p_team_index)
  );

  RETURN jsonb_build_object(
    'ok', true,
    'team_index', p_team_index,
    'available_strikes', 0
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_team_strikes(uuid, integer) TO authenticated, service_role, anon;
