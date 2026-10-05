const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

// Simulate buildRoomQuestions from lib/game-data.ts
const shuffle = (rows) => {
  const copy = [...rows];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const buildQuestionsForTest = (categories, questionRows) => {
  return categories.flatMap((category) => {
    const categoryRows = questionRows.filter(q => q.category_id === category.id && q.is_active !== false);
    const easy = shuffle(categoryRows.filter(q => q.difficulty === 'easy'));
    const medium = shuffle(categoryRows.filter(q => q.difficulty === 'medium'));
    const hard = shuffle(categoryRows.filter(q => q.difficulty === 'hard'));
    const picked = [];
    while (easy.length && picked.length < 2) picked.push(easy.pop());
    while (medium.length && picked.length < 4) picked.push(medium.pop());
    while (hard.length && picked.length < 5) picked.push(hard.pop());
    while (categoryRows.length && picked.length < 5) {
      const q = categoryRows.pop();
      if (!picked.some(p => p.id === q.id)) picked.push(q);
    }

    let pos = 0;
    return picked.map(q => {
      pos++;
      return {
        question_bank_id: q.id,
        category_id: category.id,
        category_name: category.name,
        question_text: q.question_text,
        answer_text: q.answer_text,
        difficulty: q.difficulty,
        strikes: 1,
        points: q.points || (q.difficulty === 'hard' ? 600 : q.difficulty === 'medium' ? 400 : 200),
        timer_seconds: q.timer_seconds || 60,
        position: pos, // 1 to 5 per category!
      };
    });
  });
};

function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

async function runFullVerification() {
  await c.connect();
  console.log('=== TEST 1: FETCH DATA & BUILD 30 QUESTIONS ===');

  const catRes = await c.query("SELECT id, name FROM question_categories WHERE is_active = true LIMIT 6");
  const cats = catRes.rows;
  console.log(`Fetched ${cats.length} categories.`);

  const catIds = cats.map(x => x.id);
  const qRes = await c.query("SELECT id, category_id, question_text, answer_text, difficulty, points, timer_seconds, is_active FROM question_bank WHERE category_id = ANY($1) AND is_active = true", [catIds]);
  console.log(`Fetched ${qRes.rows.length} candidate questions from bank.`);

  const questions = buildQuestionsForTest(cats, qRes.rows);
  console.log(`Built questions count: ${questions.length}`);

  // Verify all categories have exactly 5 questions with positions 1..5
  for (const cat of cats) {
    const catQs = questions.filter(q => q.category_id === cat.id);
    console.log(`Category "${cat.name}": ${catQs.length} questions, positions: ${catQs.map(q => q.position).join(', ')}`);
    if (catQs.length !== 5) throw new Error(`Category ${cat.name} does not have 5 questions!`);
    const posValid = catQs.every((q, i) => q.position === i + 1);
    if (!posValid) throw new Error(`Positions in ${cat.name} are invalid: ${catQs.map(q => q.position)}`);
  }
  console.log('✓ TEST 1 PASSED: Exactly 5 questions per category, positions 1-5.');

  console.log('\n=== TEST 2: CREATE ROOM VIA SQL RPC (NO CONSTRAINT ERRORS) ===');
  const userRes = await c.query("SELECT id FROM auth.users LIMIT 1");
  const judgeId = userRes.rows[0]?.id;

  await c.query('BEGIN');
  await c.query(`SELECT set_config('request.jwt.claim.sub', $1, true)`, [judgeId]);
  await c.query(`SELECT set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: judgeId })]);

  const rpcRes = await c.query(`
    SELECT public.create_game_room(
      p_game_name => 'غرفة اختبار شامل',
      p_team_1_name => 'كتائب الفرسان',
      p_team_2_name => 'صقور النخبة',
      p_selected_categories => $1::text[],
      p_questions => $2::jsonb
    ) as result;
  `, [catIds, JSON.stringify(questions)]);

  const result = rpcRes.rows[0]?.result;
  const roomId = result.room_id;
  console.log('✓ Room created successfully! Room ID:', roomId);

  // Check room_questions count in DB
  const rqCount = await c.query("SELECT count(*) FROM room_questions WHERE room_id = $1", [roomId]);
  console.log('✓ DB room_questions row count:', rqCount.rows[0]?.count);
  if (Number(rqCount.rows[0]?.count) !== 30) {
    throw new Error(`Expected 30 room_questions, found ${rqCount.rows[0]?.count}`);
  }

  await c.query("UPDATE game_rooms SET status = 'playing' WHERE id = $1", [roomId]);

  const roomCheck = await c.query("SELECT status FROM game_rooms WHERE id = $1", [roomId]);
  console.log('✓ Room status in DB:', roomCheck.rows[0]?.status);

  const teamsCheck = await c.query("SELECT team_index, name, points, score, is_ready FROM teams WHERE room_id = $1 ORDER BY team_index", [roomId]);
  console.log('✓ Teams in DB:', teamsCheck.rows);

  console.log('\n=== TEST 4: DETERMINISTIC 30-BOX MAPPING & SEQUENTIAL RULES ===');
  const dbQuestionsRes = await c.query("SELECT id, room_id, category_id, category_name, question_text, position, is_used FROM room_questions WHERE room_id = $1", [roomId]);
  const dbQuestions = dbQuestionsRes.rows;

  const sorted30 = [...dbQuestions].sort((a, b) => {
    const hashA = hashString(`${a.category_id || ""}_${a.position || 0}_${a.id}`);
    const hashB = hashString(`${b.category_id || ""}_${b.position || 0}_${b.id}`);
    return hashA - hashB;
  });

  console.log(`Boxes mapped: 30 cells.`);
  console.log(`Box #1: [${sorted30[0].category_name}] ${sorted30[0].question_text.slice(0, 30)}...`);
  console.log(`Box #2: [${sorted30[1].category_name}] ${sorted30[1].question_text.slice(0, 30)}...`);
  console.log(`Box #30: [${sorted30[29].category_name}] ${sorted30[29].question_text.slice(0, 30)}...`);

  // Verify nextPendingBoxNumber is initially 1
  let nextPending = sorted30.findIndex(q => !q.is_used) + 1;
  console.log(`Initial Next Pending Box: #${nextPending}`);
  if (nextPending !== 1) throw new Error('Box 1 should be active initially!');

  console.log('\n=== TEST 5: ANSWER BOX #1 & VERIFY RESOLUTION & SCORE UPDATE ===');
  const q1 = sorted30[0];
  // Select question
  await c.query("SELECT public.select_room_question($1, $2, NULL)", [roomId, q1.id]);
  console.log(`✓ Selected Question #${q1.id}`);

  // Resolve question: Team 1 wins
  await c.query("SELECT public.resolve_room_question($1, $2, 1)", [roomId, q1.id]);
  await c.query("SELECT public.grant_team_points($1, 1, 400)", [roomId]);
  console.log(`✓ Resolved Question #1 (Team 1 won, awarded 400 points)`);

  // Verify DB state after resolution
  const q1Updated = await c.query("SELECT is_used, answered_correctly FROM room_questions WHERE id = $1", [q1.id]);
  console.log('✓ Question #1 state in DB:', q1Updated.rows[0]);
  if (!q1Updated.rows[0]?.is_used) throw new Error('Question 1 was not marked is_used!');

  const team1Score = await c.query("SELECT name, score, points FROM teams WHERE room_id = $1 AND team_index = 1", [roomId]);
  console.log('✓ Team 1 updated score:', team1Score.rows[0]);
  if (team1Score.rows[0]?.score !== 4400) throw new Error('Score not updated correctly!');

  // Re-check nextPendingBoxNumber: should now be 2!
  const dbQuestionsRes2 = await c.query("SELECT id, room_id, category_id, category_name, question_text, position, is_used FROM room_questions WHERE room_id = $1", [roomId]);
  const sorted30After = [...dbQuestionsRes2.rows].sort((a, b) => {
    const hashA = hashString(`${a.category_id || ""}_${a.position || 0}_${a.id}`);
    const hashB = hashString(`${b.category_id || ""}_${b.position || 0}_${b.id}`);
    return hashA - hashB;
  });
  const nextPendingAfter = sorted30After.findIndex(q => !q.is_used) + 1;
  console.log(`✓ Next Pending Box after resolving Box #1: #${nextPendingAfter}`);
  if (nextPendingAfter !== 2) throw new Error('Box 2 should now be active!');

  console.log('\n=== CLEANUP TEST ROOM ===');
  await c.query("DELETE FROM game_rooms WHERE id = $1", [roomId]);
  await c.query('COMMIT');
  console.log('✓ Cleaned up test room.');

  await c.end();
  console.log('\n==========================================');
  console.log('>>> ALL TESTS PASSED WITH 100% SUCCESS <<<');
  console.log('==========================================');
}

runFullVerification().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
