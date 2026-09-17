-- Migration: Add timer_seconds to room_questions and update room creation functions
-- 1. Add timer_seconds to room_questions table
ALTER TABLE public.room_questions 
ADD COLUMN IF NOT EXISTS timer_seconds INTEGER DEFAULT 60;

-- 2. Backfill existing room_questions from question_bank
UPDATE public.room_questions rq
SET timer_seconds = qb.timer_seconds
FROM public.question_bank qb
WHERE rq.question_bank_id = qb.id AND qb.timer_seconds IS NOT NULL;

-- 3. Update create_game_room function to accept and insert timer_seconds
CREATE OR REPLACE FUNCTION public.create_game_room(
  p_game_name text,
  p_team_1_name text,
  p_team_2_name text,
  p_selected_categories text[],
  p_questions jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_room_id uuid;
  v_team_1_id uuid;
  v_team_2_id uuid;
  v_token_1 uuid;
  v_token_2 uuid;
  v_question_id uuid;
  v_question record;
  v_fixed_tools text[] := array['radar_scan', 'shield', 'extra_strike'];
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if char_length(trim(p_team_1_name)) < 2 or char_length(trim(p_team_2_name)) < 2 then
    raise exception 'Both team names are required';
  end if;

  if lower(trim(p_team_1_name)) = lower(trim(p_team_2_name)) then
    raise exception 'Team names must be different';
  end if;

  if cardinality(p_selected_categories) <> 6 then
    raise exception 'Exactly six categories are required';
  end if;

  if jsonb_array_length(p_questions) < 1 then
    raise exception 'At least one question is required';
  end if;

  insert into public.game_rooms (
    judge_id, game_name, team_1_name, team_2_name, selected_categories,
    team_1_tools, team_2_tools, status
  )
  values (
    auth.uid(), nullif(trim(p_game_name), ''), trim(p_team_1_name), trim(p_team_2_name),
    p_selected_categories, v_fixed_tools, v_fixed_tools, 'setup'
  )
  returning id into v_room_id;

  insert into public.teams (room_id, team_index, name, points, score, tools)
  values (v_room_id, 1, trim(p_team_1_name), 4000, 1000, v_fixed_tools)
  returning id into v_team_1_id;

  insert into public.teams (room_id, team_index, name, points, score, tools)
  values (v_room_id, 2, trim(p_team_2_name), 4000, 1000, v_fixed_tools)
  returning id into v_team_2_id;

  insert into public.team_access_tokens (team_id) values (v_team_1_id)
  returning access_token into v_token_1;
  insert into public.team_access_tokens (team_id) values (v_team_2_id)
  returning access_token into v_token_2;

  insert into public.team_boards (team_id, board)
  select t.id, (select jsonb_agg(null::jsonb) from generate_series(1, 36))
  from public.teams t
  where t.room_id = v_room_id;

  for v_question in
    select *
    from jsonb_to_recordset(p_questions) as q(
      category_id text, category_name text, question_text text, answer_text text,
      difficulty text, strikes integer, points integer, position integer,
      media_url text, media_type text, answer_image_url text, question_bank_id uuid,
      timer_seconds integer
    )
  loop
    insert into public.room_questions (
      room_id, category_id, category_name, question_text, difficulty,
      strikes, points, position, media_url, media_type, question_bank_id,
      timer_seconds
    )
    values (
      v_room_id, v_question.category_id, v_question.category_name,
      v_question.question_text, v_question.difficulty, v_question.strikes,
      v_question.points, v_question.position, v_question.media_url, v_question.media_type,
      v_question.question_bank_id,
      coalesce(v_question.timer_seconds, 60)
    )
    returning id into v_question_id;

    insert into public.room_question_answers (question_id, answer_text, answer_image_url, timer_seconds)
    values (v_question_id, v_question.answer_text, v_question.answer_image_url, coalesce(v_question.timer_seconds, 60));
  end loop;

  return jsonb_build_object(
    'room_id', v_room_id,
    'team_1_token', v_token_1,
    'team_2_token', v_token_2
  );
end;
$function$;

-- 4. Update restart_game_room function to copy timer_seconds
CREATE OR REPLACE FUNCTION public.restart_game_room(
  p_source_room_id uuid,
  p_team_1_name text,
  p_team_2_name text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_source game_rooms%rowtype;
  v_room_id uuid;
  v_team_1_id uuid;
  v_team_2_id uuid;
  v_token_1 uuid;
  v_token_2 uuid;
  v_question_id uuid;
  v_src_question record;
  v_fixed_tools text[] := array['radar_scan', 'shield', 'extra_strike'];
begin
  select * into v_source from public.game_rooms where id = p_source_room_id;
  if not found or v_source.judge_id != auth.uid() then
    raise exception 'Only the referee who owns this game can restart it';
  end if;

  if char_length(trim(p_team_1_name)) < 2 or char_length(trim(p_team_2_name)) < 2 then
    raise exception 'Both team names are required';
  end if;

  if lower(trim(p_team_1_name)) = lower(trim(p_team_2_name)) then
    raise exception 'Team names must be different';
  end if;

  insert into public.game_rooms (
    judge_id, game_name, team_1_name, team_2_name, selected_categories,
    team_1_tools, team_2_tools, status
  )
  values (
    auth.uid(), v_source.game_name, trim(p_team_1_name), trim(p_team_2_name),
    v_source.selected_categories, v_fixed_tools, v_fixed_tools, 'setup'
  )
  returning id into v_room_id;

  insert into public.teams (room_id, team_index, name, points, score, tools)
  values (v_room_id, 1, trim(p_team_1_name), 4000, 1000, v_fixed_tools)
  returning id into v_team_1_id;

  insert into public.teams (room_id, team_index, name, points, score, tools)
  values (v_room_id, 2, trim(p_team_2_name), 4000, 1000, v_fixed_tools)
  returning id into v_team_2_id;

  insert into public.team_access_tokens (team_id) values (v_team_1_id)
  returning access_token into v_token_1;
  insert into public.team_access_tokens (team_id) values (v_team_2_id)
  returning access_token into v_token_2;

  insert into public.team_boards (team_id, board)
  select t.id, (select jsonb_agg(null::jsonb) from generate_series(1, 36))
  from public.teams t
  where t.room_id = v_room_id;

  for v_src_question in
    select rq.*, rqa.answer_text, rqa.answer_image_url
    from public.room_questions rq
    left join public.room_question_answers rqa on rqa.question_id = rq.id
    where rq.room_id = p_source_room_id
    order by rq.position
  loop
    insert into public.room_questions (
      room_id, category_id, category_name, question_text, difficulty,
      strikes, points, position, media_url, media_type, question_bank_id,
      timer_seconds
    )
    values (
      v_room_id, v_src_question.category_id, v_src_question.category_name,
      v_src_question.question_text, v_src_question.difficulty, v_src_question.strikes,
      v_src_question.points, v_src_question.position, v_src_question.media_url,
      v_src_question.media_type, v_src_question.question_bank_id,
      coalesce(v_src_question.timer_seconds, 60)
    )
    returning id into v_question_id;

    insert into public.room_question_answers (question_id, answer_text, answer_image_url, timer_seconds)
    values (v_question_id, v_src_question.answer_text, v_src_question.answer_image_url, coalesce(v_src_question.timer_seconds, 60));
  end loop;

  return jsonb_build_object(
    'room_id', v_room_id,
    'team_1_token', v_token_1,
    'team_2_token', v_token_2
  );
end;
$function$;
