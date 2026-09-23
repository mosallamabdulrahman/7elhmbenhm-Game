-- Migration: Add pit_active to teams, update tactical tools to [scan, shield, pit], and support pre-game radar

-- 1. Add pit_active column to teams table
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS pit_active boolean DEFAULT false;

-- 2. Update existing active teams tools
UPDATE public.teams
SET tools = array['scan', 'shield', 'pit']
WHERE tools = array['radar_scan', 'shield', 'extra_strike'];

-- 3. Update create_game_room function
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
  v_fixed_tools text[] := array['scan', 'shield', 'pit'];
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
      timer_seconds integer, image_duration integer, media_play_count integer,
      show_question_first boolean
    )
  loop
    insert into public.room_questions (
      room_id, category_id, category_name, question_text, difficulty,
      strikes, points, position, media_url, media_type, question_bank_id,
      timer_seconds, image_duration, media_play_count, show_question_first
    )
    values (
      v_room_id, v_question.category_id, v_question.category_name,
      v_question.question_text, v_question.difficulty, v_question.strikes,
      v_question.points, v_question.position, v_question.media_url, v_question.media_type,
      v_question.question_bank_id,
      coalesce(v_question.timer_seconds, 60),
      v_question.image_duration,
      v_question.media_play_count,
      coalesce(v_question.show_question_first, false)
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

-- 4. Update restart_game_room function
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
  v_fixed_tools text[] := array['scan', 'shield', 'pit'];
begin
  select * into v_source from public.game_rooms where id = p_source_room_id;
  if not found then
    raise exception 'الغرفة الأصلية غير موجودة';
  end if;

  insert into public.game_rooms (
    judge_id, game_name, team_1_name, team_2_name, selected_categories,
    team_1_tools, team_2_tools, status
  )
  values (
    v_source.judge_id, v_source.game_name, trim(p_team_1_name), trim(p_team_2_name),
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
      timer_seconds, image_duration, media_play_count, show_question_first
    )
    values (
      v_room_id, v_src_question.category_id, v_src_question.category_name,
      v_src_question.question_text, v_src_question.difficulty, v_src_question.strikes,
      v_src_question.points, v_src_question.position, v_src_question.media_url,
      v_src_question.media_type, v_src_question.question_bank_id,
      coalesce(v_src_question.timer_seconds, 60),
      v_src_question.image_duration,
      v_src_question.media_play_count,
      coalesce(v_src_question.show_question_first, false)
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

-- 5. Update use_team_tool function
CREATE OR REPLACE FUNCTION public.use_team_tool(
  p_room_id uuid,
  p_team_index integer,
  p_tool text,
  p_cell_index integer DEFAULT NULL::integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_team public.teams%rowtype;
  v_enemy public.teams%rowtype;
  v_enemy_board jsonb;
  v_cells jsonb := '[]'::jsonb;
  v_row integer;
  v_col integer;
  v_scan_row integer;
  v_scan_col integer;
  v_index integer;
  v_unit text;
begin
  select team.* into v_team
  from public.teams team
  join public.game_rooms room on room.id = team.room_id
  where team.room_id = p_room_id
    and team.team_index = p_team_index
    and room.judge_id = auth.uid()
    and room.status = 'playing'
  for update of team;

  if v_team.id is null
    or not (p_tool = any(v_team.tools))
    or p_tool = any(v_team.used_tools) then
    raise exception 'Tool is unavailable';
  end if;

  if p_tool = 'pit' then
    if exists (
      select 1 from public.game_rooms
      where id = p_room_id and active_question_id is not null
    ) then
      raise exception 'يجب تفعيل الحفرة قبل فتح السؤال.';
    end if;

    update public.teams
    set pit_active = true,
        used_tools = array_append(used_tools, p_tool)
    where id = v_team.id;

    v_cells := jsonb_build_object('tool', p_tool, 'pit_active', true);

  elsif p_tool = 'shield' then
    if exists (
      select 1 from public.game_rooms
      where id = p_room_id and active_question_id is not null
    ) then
      raise exception 'يجب تفعيل الدرع قبل فتح السؤال.';
    end if;

    update public.teams
    set shield_active = true,
        used_tools = array_append(used_tools, p_tool)
    where id = v_team.id;

    v_cells := jsonb_build_object('tool', p_tool, 'shield_active', true);

  elsif p_tool = 'scan' then
    select * into v_enemy
    from public.teams
    where room_id = p_room_id
      and team_index <> p_team_index;

    select board into v_enemy_board
    from public.team_boards
    where team_id = v_enemy.id;

    for v_index in 0..35 loop
      v_unit := v_enemy_board ->> v_index;
      v_cells := v_cells || jsonb_build_array(
        jsonb_build_object(
          'cell_index', v_index,
          'unit_type', v_unit
        )
      );
    end loop;

    update public.teams
    set used_tools = array_append(used_tools, p_tool)
    where id = v_team.id;

    v_cells := jsonb_build_object('tool', p_tool, 'cells', v_cells, 'duration_seconds', 10);

  elsif p_tool = 'extra_strike' then
    update public.teams
    set available_strikes = available_strikes + 1,
        used_tools = array_append(used_tools, p_tool)
    where id = v_team.id;
    v_cells := jsonb_build_object('tool', p_tool, 'strikes_added', 1);

  elsif p_tool = 'radar_scan' then
    if p_cell_index is null or p_cell_index not between 0 and 35 then
      raise exception 'Choose a valid radar cell';
    end if;

    select * into v_enemy
    from public.teams
    where room_id = p_room_id
      and team_index <> p_team_index;

    select board into v_enemy_board
    from public.team_boards
    where team_id = v_enemy.id;

    v_row := p_cell_index / 6;
    v_col := p_cell_index % 6;

    for v_scan_row in greatest(v_row - 1, 0)..least(v_row + 1, 5) loop
      for v_scan_col in greatest(v_col - 1, 0)..least(v_col + 1, 5) loop
        v_index := v_scan_row * 6 + v_scan_col;
        v_unit := v_enemy_board ->> v_index;
        v_cells := v_cells || jsonb_build_array(
          jsonb_build_object(
            'cell_index', v_index,
            'unit_type', v_unit
          )
        );
      end loop;
    end loop;

    update public.teams
    set used_tools = array_append(used_tools, p_tool)
    where id = v_team.id;

    v_cells := jsonb_build_object('tool', p_tool, 'cells', v_cells);

  else
    raise exception 'Unknown tool: %', p_tool;
  end if;

  insert into public.combat_events (
    room_id,
    event_type,
    actor_team_index,
    result,
    metadata
  )
  values (
    p_room_id,
    'tool_used',
    p_team_index,
    p_tool,
    jsonb_build_object('tool', p_tool)
  );

  return v_cells;
end;
$function$;

-- 6. Update execute_strike function
CREATE OR REPLACE FUNCTION public.execute_strike(
  p_room_id uuid,
  p_attacker_team_index integer,
  p_cell_index integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_room         game_rooms%ROWTYPE;
  v_attacker     teams%ROWTYPE;
  v_target       teams%ROWTYPE;
  v_target_board jsonb;
  v_cell         TEXT;
  v_unit         TEXT;
  v_result       TEXT;
  v_points_delta integer := 0;
  v_stolen_points integer := 0;
  v_event_json   jsonb;
BEGIN
  SELECT * INTO v_room FROM game_rooms WHERE id = p_room_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'الغرفة غير موجودة.';
  END IF;

  IF auth.role() != 'service_role' AND v_room.judge_id != auth.uid() THEN
    RAISE EXCEPTION 'Only the referee can execute a strike.';
  END IF;

  SELECT * INTO v_attacker FROM teams
    WHERE room_id = p_room_id AND team_index = p_attacker_team_index FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'الفريق المهاجم غير موجود.'; END IF;

  SELECT * INTO v_target FROM teams
    WHERE room_id = p_room_id AND team_index != p_attacker_team_index FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'الفريق المستهدف غير موجود.'; END IF;

  SELECT to_jsonb(ce.*) INTO v_event_json
  FROM combat_events ce
  WHERE ce.room_id = p_room_id
    AND ce.target_team_index = v_target.team_index
    AND ce.cell_index = p_cell_index
    AND ce.event_type = 'strike'
  ORDER BY ce.created_at DESC
  LIMIT 1;

  IF v_event_json IS NOT NULL THEN
    RETURN v_event_json;
  END IF;

  IF v_attacker.available_strikes <= 0 THEN
    RAISE EXCEPTION 'لا توجد ضربات متاحة.';
  END IF;

  SELECT board INTO v_target_board FROM team_boards WHERE team_id = v_target.id FOR UPDATE;
  IF v_target_board IS NULL THEN
    RAISE EXCEPTION 'خريطة الفريق المستهدف غير موجودة.';
  END IF;

  v_cell := v_target_board ->> p_cell_index;
  v_unit := nullif(trim(both '"' from coalesce(v_cell, '')), '');

  IF v_cell IS NULL OR v_cell = 'null' THEN
    v_result := 'miss';
    v_unit := NULL;

  ELSIF v_unit = 'mine' THEN
    IF v_attacker.shield_active THEN
      v_result := 'blocked';
      UPDATE teams SET shield_active = false WHERE id = v_attacker.id;
    ELSE
      v_result := 'mine';
      v_points_delta := -250;
      UPDATE teams SET score = greatest(score - 250, 0) WHERE id = v_attacker.id;
      UPDATE team_boards
        SET board = jsonb_set(board, ARRAY[p_cell_index::TEXT], 'null'::jsonb), updated_at = now()
        WHERE team_id = v_target.id;
    END IF;

  ELSE
    IF v_target.shield_active THEN
      v_result := 'blocked';
      UPDATE teams SET shield_active = false WHERE id = v_target.id;
    ELSE
      v_result := 'hit';
      v_points_delta := - (CASE v_unit
        WHEN 'infantry' THEN 20
        WHEN 'armored' THEN 100
        WHEN 'tank' THEN 200
        WHEN 'aircraft' THEN 400
        WHEN 'submarine' THEN 500
        ELSE 150
      END);
      
      UPDATE teams SET score = greatest(score + v_points_delta, 0) WHERE id = v_target.id;
      UPDATE team_boards
        SET board = jsonb_set(board, ARRAY[p_cell_index::TEXT], 'null'::jsonb), updated_at = now()
        WHERE team_id = v_target.id;

      IF v_attacker.pit_active = true THEN
        v_stolen_points := abs(v_points_delta);
        UPDATE teams SET score = score + v_stolen_points, pit_active = false WHERE id = v_attacker.id;
      END IF;
    END IF;
  END IF;

  UPDATE teams SET available_strikes = available_strikes - 1 WHERE id = v_attacker.id;

  INSERT INTO combat_events
    (room_id, event_type, actor_team_index, target_team_index, cell_index, result, unit_type, points_delta, metadata)
  VALUES
    (p_room_id, 'strike', p_attacker_team_index, v_target.team_index,
     p_cell_index, v_result, v_unit, v_points_delta,
     jsonb_build_object('pit_stolen_points', v_stolen_points))
  RETURNING to_jsonb(combat_events.*) INTO v_event_json;

  RETURN v_event_json;
END;
$function$;

-- 7. Create execute_pregame_radar function
CREATE OR REPLACE FUNCTION public.execute_pregame_radar(
  p_room_id uuid,
  p_team_index integer,
  p_cell_index integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_room public.game_rooms%rowtype;
  v_enemy public.teams%rowtype;
  v_enemy_board jsonb;
  v_cells jsonb := '[]'::jsonb;
  v_row integer;
  v_col integer;
  v_scan_row integer;
  v_scan_col integer;
  v_index integer;
  v_unit text;
  v_event_json jsonb;
begin
  select * into v_room from public.game_rooms where id = p_room_id;
  if not found or (auth.role() != 'service_role' and v_room.judge_id != auth.uid()) then
    raise exception 'Referee permission required';
  end if;

  if p_cell_index is null or p_cell_index not between 0 and 35 then
    raise exception 'Choose a valid radar cell';
  end if;

  select * into v_enemy
  from public.teams
  where room_id = p_room_id and team_index <> p_team_index;

  select board into v_enemy_board
  from public.team_boards
  where team_id = v_enemy.id;

  v_row := p_cell_index / 6;
  v_col := p_cell_index % 6;

  for v_scan_row in greatest(v_row - 1, 0)..least(v_row + 1, 5) loop
    for v_scan_col in greatest(v_col - 1, 0)..least(v_col + 1, 5) loop
      v_index := v_scan_row * 6 + v_scan_col;
      v_unit := v_enemy_board ->> v_index;
      v_cells := v_cells || jsonb_build_array(
        jsonb_build_object(
          'cell_index', v_index,
          'unit_type', v_unit
        )
      );
    end loop;
  end loop;

  insert into public.combat_events (
    room_id,
    event_type,
    actor_team_index,
    target_team_index,
    result,
    metadata
  )
  values (
    p_room_id,
    'radar_reveal',
    p_team_index,
    v_enemy.team_index,
    'pregame_radar',
    jsonb_build_object('cells', v_cells, 'center_cell', p_cell_index)
  )
  returning to_jsonb(combat_events.*) into v_event_json;

  return jsonb_build_object(
    'target_team_index', v_enemy.team_index,
    'cells', v_cells,
    'event', v_event_json
  );
end;
$function$;
