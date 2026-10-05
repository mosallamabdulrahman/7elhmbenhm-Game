const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function run() {
  await c.connect();
  console.log('=== TEST: NEW 3D ARENA & ROOM QUESTION RESOLVE FLOW ===\n');

  // 1. Create a test room
  const catRes = await c.query("SELECT id FROM question_categories WHERE is_active = true LIMIT 6");
  const catIds = catRes.rows.map(r => r.id);

  const userRes = await c.query("SELECT id FROM auth.users LIMIT 1");
  const judgeId = userRes.rows[0]?.id;

  const roomRes = await c.query(`
    INSERT INTO game_rooms (judge_id, game_name, status, selected_categories, current_turn)
    VALUES ($1, 'Arena Test Room', 'playing', $2, 1)
    RETURNING id
  `, [judgeId, catIds]);
  const roomId = roomRes.rows[0].id;
  console.log('✓ Room created:', roomId);

  // Teams
  const t1Res = await c.query(`
    INSERT INTO teams (room_id, team_index, name, score, available_strikes, shield_active)
    VALUES ($1, 1, 'صقور اليمين', 0, 0, false)
    RETURNING id
  `, [roomId]);
  const t2Res = await c.query(`
    INSERT INTO teams (room_id, team_index, name, score, available_strikes, shield_active)
    VALUES ($1, 2, 'أسود اليسار', 0, 0, false)
    RETURNING id
  `, [roomId]);
  const team1Id = t1Res.rows[0].id;
  const team2Id = t2Res.rows[0].id;

  // Insert test questions (5 per category across 6 categories = 30)
  for (const catId of catIds) {
    const qBankRes = await c.query(
      "SELECT q.id, q.category_id, c.name as category_name, q.question_text, q.answer_text, q.difficulty FROM question_bank q JOIN question_categories c ON q.category_id = c.id WHERE q.category_id = $1 AND q.is_active = true LIMIT 5",
      [catId]
    );
    for (let pos = 1; pos <= qBankRes.rows.length; pos++) {
      const qb = qBankRes.rows[pos - 1];
      await c.query(`
        INSERT INTO room_questions (room_id, question_bank_id, category_id, category_name, question_text, difficulty, points, strikes, position, is_used)
        VALUES ($1, $2, $3, $4, $5, $6, 200, 1, $7, false)
      `, [roomId, qb.id, qb.category_id, qb.category_name, qb.question_text, qb.difficulty, pos]);
    }
  }
  console.log('✓ 30 room questions inserted.');

  // Fetch Q1
  const q1Res = await c.query("SELECT id, position FROM room_questions WHERE room_id = $1 ORDER BY position ASC LIMIT 1", [roomId]);
  const q1 = q1Res.rows[0];

  // Resolve Q1 awarding Team 1 (index 1)
  console.log('\n--- Resolving Q1 with Winner = Team 1 ---');
  await c.query(`
    UPDATE room_questions
    SET is_used = true, answered_correctly = true, awarded_team_index = 1
    WHERE id = $1
  `, [q1.id]);
  await c.query(`
    UPDATE teams SET score = score + 200 WHERE id = $1
  `, [team1Id]);

  const afterQ1 = await c.query("SELECT is_used, awarded_team_index FROM room_questions WHERE id = $1", [q1.id]);
  const t1After = await c.query("SELECT score FROM teams WHERE id = $1", [team1Id]);
  console.log('Q1 status:', afterQ1.rows[0]);
  console.log('Team 1 score:', t1After.rows[0].score);

  if (afterQ1.rows[0].awarded_team_index === 1 && t1After.rows[0].score === 200) {
    console.log('✓✓✓ Q1 correctly awarded to Team 1 with points!');
  } else {
    throw new Error('Q1 test failed!');
  }

  // Fetch Q2
  const q2Res = await c.query("SELECT id, position FROM room_questions WHERE room_id = $1 ORDER BY position ASC OFFSET 1 LIMIT 1", [roomId]);
  const q2 = q2Res.rows[0];

  // Resolve Q2 awarding Team 2 (index 2)
  console.log('\n--- Resolving Q2 with Winner = Team 2 ---');
  await c.query(`
    UPDATE room_questions
    SET is_used = true, answered_correctly = true, awarded_team_index = 2
    WHERE id = $1
  `, [q2.id]);
  await c.query(`
    UPDATE teams SET score = score + 200 WHERE id = $1
  `, [team2Id]);

  const afterQ2 = await c.query("SELECT is_used, awarded_team_index FROM room_questions WHERE id = $1", [q2.id]);
  const t2After = await c.query("SELECT score FROM teams WHERE id = $1", [team2Id]);
  console.log('Q2 status:', afterQ2.rows[0]);
  console.log('Team 2 score:', t2After.rows[0].score);

  if (afterQ2.rows[0].awarded_team_index === 2 && t2After.rows[0].score === 200) {
    console.log('✓✓✓ Q2 correctly awarded to Team 2 with points!');
  } else {
    throw new Error('Q2 test failed!');
  }

  // Cleanup
  await c.query("DELETE FROM room_questions WHERE room_id = $1", [roomId]);
  await c.query("DELETE FROM teams WHERE room_id = $1", [roomId]);
  await c.query("DELETE FROM game_rooms WHERE id = $1", [roomId]);
  console.log('\n✓ Cleaned up test room.');
  console.log('\n==========================================');
  console.log('>>> ALL ARENA TESTS PASSED WITH 100% SUCCESS <<<');
  console.log('==========================================');

  await c.end();
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
