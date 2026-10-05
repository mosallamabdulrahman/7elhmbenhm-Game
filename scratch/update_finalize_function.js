const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function main() {
  await c.connect();

  const sql = `
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

  -- 1. Check if any team has 0 or negative score
  IF v_t1.score <= 0 AND v_t2.score <= 0 THEN
    v_winner := NULL;
  ELSIF v_t1.score <= 0 THEN
    v_winner := 2;
  ELSIF v_t2.score <= 0 THEN
    v_winner := 1;
  ELSE
    -- 2. Count remaining unanswered questions
    SELECT COUNT(*) INTO v_q_left
      FROM room_questions WHERE room_id = p_room_id AND is_used = false;

    -- If there are still questions remaining, DO NOT FINISH THE GAME
    IF v_q_left > 0 THEN
      RETURN;
    END IF;

    -- All questions have been answered -> Determine winner by highest score
    IF v_t1.score > v_t2.score THEN
      v_winner := 1;
    ELSIF v_t2.score > v_t1.score THEN
      v_winner := 2;
    ELSE
      v_winner := NULL; -- Draw
    END IF;
  END IF;

  UPDATE game_rooms
    SET status = 'finished', winner_team_index = v_winner, finished_reason = 'completed'
    WHERE id = p_room_id;
END;
$function$;
`;

  await c.query(sql);
  console.log('✓ Successfully updated public.finalize_room_if_complete in Supabase DB!');

  // Verify the updated definition
  const func = await c.query(`
    SELECT routine_name, routine_definition
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name = 'finalize_room_if_complete'
  `);
  console.log('New definition:');
  console.log(func.rows[0]?.routine_definition);

  await c.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
