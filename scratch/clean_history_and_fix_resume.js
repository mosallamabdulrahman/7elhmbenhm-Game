const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function main() {
  await c.connect();

  console.log('--- 1. Delete all game history for all users ---');
  await c.query(`DELETE FROM combat_events`);
  await c.query(`DELETE FROM team_boards`);
  await c.query(`DELETE FROM team_access_tokens`);
  await c.query(`DELETE FROM room_question_answers`);
  await c.query(`DELETE FROM room_questions`);
  await c.query(`DELETE FROM teams`);
  await c.query(`DELETE FROM game_rooms`);
  console.log('✓ Cleared all previous game rooms and history for all users.');

  console.log('--- 2. Update restart_game_room to use 0 points, 0 score, and 30s timers ---');
  await c.query(`
CREATE OR REPLACE FUNCTION public.restart_game_room(p_source_room_id uuid, p_team_1_name text, p_team_2_name text)
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
    v_source.selected_categories, v_fixed_tools, v_fixed_tools, 'playing'
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
      timer_seconds, image_duration, media_play_count, show_question_first,
      is_used, answered_correctly, awarded_team_index
    )
    values (
      v_room_id, v_src_question.category_id, v_src_question.category_name,
      v_src_question.question_text, v_src_question.difficulty, v_src_question.strikes,
      coalesce(v_src_question.points, 200), v_src_question.position, v_src_question.media_url,
      v_src_question.media_type, v_src_question.question_bank_id,
      30, -- 30s timer
      v_src_question.image_duration,
      v_src_question.media_play_count,
      coalesce(v_src_question.show_question_first, false),
      false, null, null
    )
    returning id into v_question_id;

    insert into public.room_question_answers (question_id, answer_text, answer_image_url, timer_seconds)
    values (v_question_id, v_src_question.answer_text, v_src_question.answer_image_url, 30);
  end loop;

  return jsonb_build_object(
    'room_id', v_room_id,
    'team_1_token', v_token_1,
    'team_2_token', v_token_2
  );
end;
$function$;
  `);
  console.log('✓ restart_game_room updated.');

  console.log('--- 3. Update resume_game_room to resume directly to playing ---');
  await c.query(`
CREATE OR REPLACE FUNCTION public.resume_game_room(p_room_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_room game_rooms%rowtype;
begin
  select * into v_room from public.game_rooms where id = p_room_id;
  if not found or v_room.judge_id != auth.uid() then
    raise exception 'Only the referee who owns this game can resume it';
  end if;

  update public.game_rooms
  set status = 'playing',
      abandoned_by = null,
      winner_team_index = null,
      finished_reason = null
  where id = p_room_id;
end;
$function$;
  `);
  console.log('✓ resume_game_room updated.');

  await c.end();
}

main().catch(err => { console.error(err); process.exit(1); });
