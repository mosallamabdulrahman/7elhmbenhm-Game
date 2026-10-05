const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function main() {
  await c.connect();

  console.log('--- 1. Updating fn_teams_score_init to 0 ---');
  await c.query(`
CREATE OR REPLACE FUNCTION public.fn_teams_score_init()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.score := 0;
  NEW.points := 0;
  RETURN NEW;
END;
$function$;
  `);
  console.log('✓ fn_teams_score_init updated.');

  console.log('--- 2. Updating create_game_room to initialize 0 points/score ---');
  await c.query(`
CREATE OR REPLACE FUNCTION public.create_game_room(p_game_name text, p_team_1_name text, p_team_2_name text, p_selected_categories text[], p_questions jsonb)
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
  values (v_room_id, 1, trim(p_team_1_name), 0, 0, v_fixed_tools)
  returning id into v_team_1_id;

  insert into public.teams (room_id, team_index, name, points, score, tools)
  values (v_room_id, 2, trim(p_team_2_name), 0, 0, v_fixed_tools)
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
      v_question.question_text, v_question.difficulty, coalesce(v_question.strikes, 1),
      coalesce(v_question.points, 200), v_question.position, v_question.media_url, v_question.media_type,
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
  `);
  console.log('✓ create_game_room updated.');

  console.log('--- 3. Updating resolve_room_question to award 1 point ---');
  await c.query(`
CREATE OR REPLACE FUNCTION public.resolve_room_question(p_room_id uuid, p_question_id uuid, p_winner_team_index integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_room game_rooms%ROWTYPE;
  v_q room_questions%ROWTYPE;
BEGIN
  SELECT * INTO v_room FROM game_rooms WHERE id = p_room_id;
  IF NOT FOUND OR v_room.judge_id != auth.uid() THEN
    RAISE EXCEPTION 'Only the referee can resolve a question.';
  END IF;

  SELECT * INTO v_q FROM room_questions
    WHERE id = p_question_id AND room_id = p_room_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'السؤال غير موجود.'; END IF;

  -- 1. Mark question as used and record awarded team index
  UPDATE room_questions
    SET is_used = true,
        answered_correctly = (p_winner_team_index IS NOT NULL AND p_winner_team_index IN (1, 2)),
        awarded_team_index = CASE WHEN p_winner_team_index IN (1, 2) THEN p_winner_team_index ELSE NULL END
    WHERE id = p_question_id;

  -- 2. Award exactly 1 point to the winning team if chosen
  IF p_winner_team_index IS NOT NULL AND p_winner_team_index IN (1, 2) THEN
    UPDATE teams
      SET score = coalesce(score, 0) + 1
      WHERE room_id = p_room_id AND team_index = p_winner_team_index;
  END IF;

  -- 3. Reset active question
  UPDATE game_rooms SET active_question_id = NULL WHERE id = p_room_id;

  -- 4. Record combat event with question_id & winner_team_index
  INSERT INTO combat_events
    (room_id, event_type, actor_team_index, result, metadata)
  VALUES
    (p_room_id, 'question_resolved', p_winner_team_index, NULL,
     jsonb_build_object('question_id', p_question_id, 'winner_team_index', p_winner_team_index, 'points', 1));

  -- 5. Toggle turn to the other team
  UPDATE game_rooms
    SET current_turn = CASE WHEN current_turn = 1 THEN 2 ELSE 1 END
    WHERE id = p_room_id;

  -- 6. Check if game is complete
  PERFORM public.finalize_room_if_complete(p_room_id);
END;
$function$;
  `);
  console.log('✓ resolve_room_question updated.');

  console.log('--- 4. Updating finalize_room_if_complete (ends only after 30 questions, highest score wins) ---');
  await c.query(`
CREATE OR REPLACE FUNCTION public.finalize_room_if_complete(p_room_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_room     game_rooms%ROWTYPE;
  v_t1       teams%ROWTYPE;
  v_t2       teams%ROWTYPE;
  v_q_left   BIGINT;
  v_winner   INT := NULL;
BEGIN
  SELECT * INTO v_room FROM game_rooms WHERE id = p_room_id;
  IF NOT FOUND OR v_room.status != 'playing' THEN RETURN; END IF;

  SELECT * INTO v_t1 FROM teams WHERE room_id = p_room_id AND team_index = 1;
  SELECT * INTO v_t2 FROM teams WHERE room_id = p_room_id AND team_index = 2;

  -- Count remaining unanswered questions
  SELECT COUNT(*) INTO v_q_left
    FROM room_questions WHERE room_id = p_room_id AND is_used = false;

  -- If there are still questions remaining, DO NOT FINISH THE GAME
  IF v_q_left > 0 THEN
    RETURN;
  END IF;

  -- All questions have been answered -> Determine winner by highest score
  IF coalesce(v_t1.score, 0) > coalesce(v_t2.score, 0) THEN
    v_winner := 1;
  ELSIF coalesce(v_t2.score, 0) > coalesce(v_t1.score, 0) THEN
    v_winner := 2;
  ELSE
    v_winner := NULL; -- Draw
  END IF;

  UPDATE game_rooms
    SET status = 'finished', winner_team_index = v_winner, finished_reason = 'completed'
    WHERE id = p_room_id;
END;
$function$;
  `);
  console.log('✓ finalize_room_if_complete updated.');

  await c.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
