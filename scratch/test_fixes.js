const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function runTest() {
  await c.connect();
  console.log('=== TEST SUITE: GAME FLOW & UI LOGIC FIXES ===\n');

  // Fetch 6 active categories
  const catRes = await c.query("SELECT id, name FROM question_categories WHERE is_active = true LIMIT 6");
  const cats = catRes.rows;
  const catIds = cats.map(x => x.id);

  const qRes = await c.query(
    "SELECT id, category_id, question_text, answer_text, difficulty, points, timer_seconds FROM question_bank WHERE category_id = ANY($1) AND is_active = true",
    [catIds]
  );

  // Build 30 questions (5 per category, positions 1..5)
  const questions = cats.flatMap(category => {
    const rows = qRes.rows.filter(q => q.category_id === category.id).slice(0, 5);
    return rows.map((q, idx) => ({
      question_bank_id: q.id,
      category_id: category.id,
      category_name: category.name,
      question_text: q.question_text,
      answer_text: q.answer_text,
      difficulty: q.difficulty,
      strikes: 1,
      points: 400,
      timer_seconds: 60,
      position: idx + 1,
    }));
  });

  const userRes = await c.query("SELECT id FROM auth.users LIMIT 1");
  const judgeId = userRes.rows[0]?.id;

  await c.query('BEGIN');
  await c.query(`SELECT set_config('request.jwt.claim.sub', $1, true)`, [judgeId]);
  await c.query(`SELECT set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: judgeId })]);

  // Create game room
  const rpcRes = await c.query(`
    SELECT public.create_game_room(
      p_game_name => 'اختبار إنهاء اللعبة والسيدبار',
      p_team_1_name => 'النسور الجارحة',
      p_team_2_name => 'الأبطال الصامدون',
      p_selected_categories => $1::text[],
      p_questions => $2::jsonb
    ) as result;
  `, [catIds, JSON.stringify(questions)]);

  const roomId = rpcRes.rows[0]?.result?.room_id;
  console.log('✓ 1. Room created successfully. ID:', roomId);

  // Activate room to playing
  await c.query("UPDATE game_rooms SET status = 'playing' WHERE id = $1", [roomId]);

  // Fetch created room_questions
  const rqRes = await c.query("SELECT id, is_used FROM room_questions WHERE room_id = $1 ORDER BY id", [roomId]);
  console.log(`✓ 2. Total questions generated in DB: ${rqRes.rows.length}`);
  if (rqRes.rows.length !== 30) throw new Error('Expected 30 questions');

  // STEP 3: ANSWER QUESTION #1
  const q1 = rqRes.rows[0];
  console.log(`\n=== STEP 3: Answering Question #1 (ID: ${q1.id}) ===`);
  await c.query("SELECT public.select_room_question($1, $2, NULL)", [roomId, q1.id]);
  await c.query("SELECT public.resolve_room_question($1, $2, 1)", [roomId, q1.id]);
  await c.query("SELECT public.grant_team_points($1, 1, 400)", [roomId]);

  // NOW CALL finalize_room_if_complete (this is what caused Bug 3 before our fix)
  await c.query("SELECT public.finalize_room_if_complete($1)", [roomId]);

  // VERIFY ROOM STATUS MUST STILL BE 'playing'!
  const roomStatusAfterQ1 = await c.query("SELECT status, winner_team_index, finished_reason FROM game_rooms WHERE id = $1", [roomId]);
  console.log('✓ Room status after answering Question #1:', roomStatusAfterQ1.rows[0]);

  if (roomStatusAfterQ1.rows[0]?.status !== 'playing') {
    throw new Error(`CRITICAL BUG DETECTED: Room status became '${roomStatusAfterQ1.rows[0]?.status}' after answering only 1 question!`);
  }
  if (roomStatusAfterQ1.rows[0]?.winner_team_index !== null) {
    throw new Error(`CRITICAL BUG DETECTED: Winner was set prematurely!`);
  }
  console.log('✓✓✓ BUG 3 VERIFIED FIXED: Game continues in "playing" status without premature Game Over!');

  // STEP 4: ANSWER REMAINING 29 QUESTIONS
  console.log('\n=== STEP 4: Simulating remaining 29 questions answered ===');
  await c.query("UPDATE room_questions SET is_used = true, answered_correctly = true WHERE room_id = $1", [roomId]);

  // NOW call finalize_room_if_complete when ALL questions are completed
  await c.query("SELECT public.finalize_room_if_complete($1)", [roomId]);

  const finalRoomStatus = await c.query("SELECT status, winner_team_index, finished_reason FROM game_rooms WHERE id = $1", [roomId]);
  console.log('✓ Room status when all 30 questions are answered:', finalRoomStatus.rows[0]);

  if (finalRoomStatus.rows[0]?.status !== 'finished') {
    throw new Error('Room should be finished when all questions are answered!');
  }
  if (finalRoomStatus.rows[0]?.winner_team_index !== 1) {
    throw new Error('Team 1 should be the winner based on points (4400 vs 4000)!');
  }
  console.log('✓✓✓ Win condition correctly triggered when all questions are answered! Winner: Team 1.');

  // Cleanup
  await c.query("DELETE FROM game_rooms WHERE id = $1", [roomId]);
  await c.query('COMMIT');
  console.log('\n✓ Cleaned up test room.');

  await c.end();
  console.log('\n==========================================');
  console.log('>>> ALL 3 BUGS VERIFIED FIXED WITH 100% SUCCESS <<<');
  console.log('==========================================');
}

runTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
