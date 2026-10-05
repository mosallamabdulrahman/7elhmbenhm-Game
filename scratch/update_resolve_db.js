const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function main() {
  await c.connect();
  console.log('--- Updating resolve_room_question with awarded_team_index & question_id metadata ---');
  await c.query(`
CREATE OR REPLACE FUNCTION public.resolve_room_question(p_room_id uuid, p_question_id uuid, p_winner_team_index integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_room game_rooms%ROWTYPE;
  v_q room_questions%ROWTYPE;
  v_points integer;
BEGIN
  SELECT * INTO v_room FROM game_rooms WHERE id = p_room_id;
  IF NOT FOUND OR v_room.judge_id != auth.uid() THEN
    RAISE EXCEPTION 'Only the referee can resolve a question.';
  END IF;

  SELECT * INTO v_q FROM room_questions
    WHERE id = p_question_id AND room_id = p_room_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'السؤال غير موجود.'; END IF;

  v_points := coalesce(v_q.points, 200);

  -- 1. Update room_questions with awarded_team_index
  UPDATE room_questions
    SET is_used = true,
        answered_correctly = (p_winner_team_index IS NOT NULL),
        awarded_team_index = p_winner_team_index
    WHERE id = p_question_id;

  -- 2. Award points directly to the winning team if one was selected
  IF p_winner_team_index IS NOT NULL AND p_winner_team_index IN (1, 2) THEN
    UPDATE teams
      SET score = coalesce(score, 0) + v_points
      WHERE room_id = p_room_id AND team_index = p_winner_team_index;
  END IF;

  -- 3. Reset active question
  UPDATE game_rooms SET active_question_id = NULL WHERE id = p_room_id;

  -- 4. Record combat event with question_id & winner_team_index
  INSERT INTO combat_events
    (room_id, event_type, actor_team_index, result, metadata)
  VALUES
    (p_room_id, 'question_resolved', p_winner_team_index, NULL,
     jsonb_build_object('question_id', p_question_id, 'winner_team_index', p_winner_team_index, 'points', v_points));

  -- 5. Toggle turn to the other team
  UPDATE game_rooms
    SET current_turn = CASE WHEN current_turn = 1 THEN 2 ELSE 1 END
    WHERE id = p_room_id;
END;
$function$;
  `);
  console.log('✓ resolve_room_question successfully updated in DB.');
  await c.end();
}

main().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
