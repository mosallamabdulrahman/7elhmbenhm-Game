const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function main() {
  await c.connect();

  console.log('--- 1. Updating select_room_question (removing strike requirement) ---');
  await c.query(`
CREATE OR REPLACE FUNCTION public.select_room_question(p_room_id uuid, p_question_id uuid, p_team_index integer DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
declare
  v_room public.game_rooms%rowtype;
  v_is_judge boolean;
begin
  select * into v_room
  from public.game_rooms
  where id = p_room_id
  for update;

  v_is_judge := v_room.judge_id = auth.uid();

  if v_room.status <> 'playing' or v_room.active_question_id is not null then
    raise exception 'A question cannot be selected now';
  end if;

  -- Strikes requirement completely removed per new game rules

  if not v_is_judge then
    if p_team_index not in (1, 2) or p_team_index <> v_room.current_turn then
      raise exception 'It is not this team turn';
    end if;

    if not exists (
      select 1 from public.teams
      where room_id = p_room_id
        and team_index = p_team_index
        and member_id = auth.uid()
    ) then
      raise exception 'Team membership required';
    end if;
  end if;

  if not exists (
    select 1 from public.room_questions
    where id = p_question_id
      and room_id = p_room_id
      and is_used = false
  ) then
    raise exception 'Question is unavailable';
  end if;

  update public.room_questions
  set selected_by_team = coalesce(p_team_index, v_room.current_turn)
  where id = p_question_id;

  update public.game_rooms
  set active_question_id = p_question_id
  where id = p_room_id;

  insert into public.combat_events (
    room_id,
    event_type,
    actor_team_index,
    metadata
  )
  values (
    p_room_id,
    'question_selected',
    coalesce(p_team_index, v_room.current_turn),
    jsonb_build_object('question_id', p_question_id)
  );
end;
$function$;
  `);
  console.log('✓ select_room_question updated.');

  console.log('--- 2. Updating resolve_room_question (no strikes awarded) ---');
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

  UPDATE room_questions
    SET is_used = true, answered_correctly = (p_winner_team_index IS NOT NULL)
    WHERE id = p_question_id;
  UPDATE game_rooms SET active_question_id = NULL WHERE id = p_room_id;

  -- No strikes awarded; purely trivia & score game
  INSERT INTO combat_events
    (room_id, event_type, actor_team_index, result, metadata)
  VALUES
    (p_room_id, 'question_resolved', p_winner_team_index, NULL,
     jsonb_build_object('winner_team_index', p_winner_team_index));

  UPDATE game_rooms
    SET current_turn = CASE WHEN current_turn = 1 THEN 2 ELSE 1 END
    WHERE id = p_room_id;
END;
$function$;
  `);
  console.log('✓ resolve_room_question updated.');

  console.log('--- 3. Clearing any leftover available_strikes ---');
  await c.query("UPDATE teams SET available_strikes = 0 WHERE available_strikes > 0");
  console.log('✓ available_strikes reset to 0.');

  await c.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
