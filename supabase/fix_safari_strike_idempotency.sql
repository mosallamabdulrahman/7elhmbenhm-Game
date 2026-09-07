-- Migration: Fix Safari aggressive caching & strike duplicate key error
-- Makes execute_strike idempotent and returns the created combat_event jsonb directly to the caller.

DROP FUNCTION IF EXISTS public.execute_strike(uuid, integer, integer);

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
  v_event_json   jsonb;
BEGIN
  SELECT * INTO v_room FROM game_rooms WHERE id = p_room_id;
  IF NOT FOUND OR v_room.judge_id != auth.uid() THEN
    RAISE EXCEPTION 'Only the referee can execute a strike.';
  END IF;

  SELECT * INTO v_attacker FROM teams
    WHERE room_id = p_room_id AND team_index = p_attacker_team_index FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'الفريق المهاجم غير موجود.'; END IF;

  SELECT * INTO v_target FROM teams
    WHERE room_id = p_room_id AND team_index != p_attacker_team_index FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'الفريق المستهدف غير موجود.'; END IF;

  -- 1. Idempotency check: if cell was ALREADY struck on target's board, return existing event safely
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

  -- 2. Validate attacker has strikes available
  IF v_attacker.available_strikes <= 0 THEN
    RAISE EXCEPTION 'لا توجد ضربات متاحة.';
  END IF;

  SELECT board INTO v_target_board FROM team_boards WHERE team_id = v_target.id FOR UPDATE;
  IF v_target_board IS NULL THEN
    v_target_board := v_target.board;
  END IF;
  IF v_target_board IS NULL THEN RAISE EXCEPTION 'خريطة الفريق المستهدف غير موجودة.'; END IF;

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
      UPDATE teams SET score = score - 250 WHERE id = v_attacker.id;
      UPDATE team_boards
        SET board = jsonb_set(board, ARRAY[p_cell_index::TEXT], 'null'::jsonb), updated_at = now()
        WHERE team_id = v_target.id;
      UPDATE teams
        SET board = jsonb_set(board, ARRAY[p_cell_index::TEXT], 'null'::jsonb)
        WHERE id = v_target.id AND board IS NOT NULL;
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
      UPDATE teams SET score = score + v_points_delta WHERE id = v_target.id;
      UPDATE team_boards
        SET board = jsonb_set(board, ARRAY[p_cell_index::TEXT], 'null'::jsonb), updated_at = now()
        WHERE team_id = v_target.id;
      UPDATE teams
        SET board = jsonb_set(board, ARRAY[p_cell_index::TEXT], 'null'::jsonb)
        WHERE id = v_target.id AND board IS NOT NULL;
    END IF;
  END IF;

  UPDATE teams SET available_strikes = available_strikes - 1 WHERE id = v_attacker.id;

  INSERT INTO combat_events
    (room_id, event_type, actor_team_index, target_team_index, cell_index, result, unit_type, points_delta, metadata)
  VALUES
    (p_room_id, 'strike', p_attacker_team_index, v_target.team_index,
     p_cell_index, v_result, v_unit, v_points_delta, '{}'::jsonb)
  RETURNING to_jsonb(combat_events.*) INTO v_event_json;

  RETURN v_event_json;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.execute_strike(uuid, integer, integer) TO authenticated, service_role, anon;
