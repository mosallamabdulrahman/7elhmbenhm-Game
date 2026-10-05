const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function main() {
  await c.connect();

  console.log('--- 1. Update all existing questions to 30 seconds timer ---');
  await c.query(`UPDATE question_bank SET timer_seconds = 30`);
  await c.query(`UPDATE room_questions SET timer_seconds = 30`);
  await c.query(`UPDATE room_question_answers SET timer_seconds = 30`);
  console.log('✓ Updated existing rows in question_bank, room_questions, and room_question_answers to 30s');

  console.log('--- 2. Set default 30 on columns ---');
  await c.query(`ALTER TABLE question_bank ALTER COLUMN timer_seconds SET DEFAULT 30`);
  await c.query(`ALTER TABLE room_questions ALTER COLUMN timer_seconds SET DEFAULT 30`);
  await c.query(`ALTER TABLE room_question_answers ALTER COLUMN timer_seconds SET DEFAULT 30`);
  console.log('✓ Column defaults set to 30');

  console.log('--- 3. Update create_game_room function to enforce 30 seconds ---');
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
      30, -- Fixed 30 seconds for all questions
      v_question.image_duration,
      v_question.media_play_count,
      coalesce(v_question.show_question_first, false)
    )
    returning id into v_question_id;

    insert into public.room_question_answers (question_id, answer_text, answer_image_url, timer_seconds)
    values (v_question_id, v_question.answer_text, v_question.answer_image_url, 30);
  end loop;

  return jsonb_build_object(
    'room_id', v_room_id,
    'team_1_token', v_token_1,
    'team_2_token', v_token_2
  );
end;
$function$;
  `);
  console.log('✓ create_game_room updated with 30s timer');

  await c.end();
}

main().catch(err => { console.error(err); process.exit(1); });
