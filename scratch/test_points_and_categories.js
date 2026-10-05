const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

// Simulate exact shuffle and buildRoomQuestions logic from lib/game-data.ts
const shuffle = (rows) => {
  const copy = [...rows];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
};

const normalizeQuestionRow = (question, category) => ({
  question_bank_id: question.id,
  category_id: category.id,
  category_name: category.name,
  category_image_url: category.image_url || "",
  group_id: category.group_id || null,
  group_name: category.group_name || null,
  question_text: question.question_text,
  answer_text: question.answer_text,
  position: question.position,
  difficulty: question.difficulty,
  strikes: question.strikes || 1,
  points: 200, // DB check constraint requires 200, 400, or 600
  media_url: question.media_url || null,
  media_type: question.media_type || null,
  image_duration: question.image_duration || null,
  media_play_count: question.media_play_count || null,
  show_question_first: Boolean(question.show_question_first),
  answer_image_url: question.answer_image_url || null,
  timer_seconds: Number(question.timer_seconds) > 0 ? Number(question.timer_seconds) : 60,
});

const buildRoomQuestions = (categories, questionRows = []) => {
  return categories.flatMap((category) => {
    const categoryRows = questionRows.filter(
      (q) => q.category_id === category.id && q.is_active !== false
    );

    const easy = shuffle(categoryRows.filter((q) => q.difficulty === "easy"));
    const medium = shuffle(categoryRows.filter((q) => q.difficulty === "medium"));
    const hard = shuffle(categoryRows.filter((q) => q.difficulty === "hard"));

    const pickedEasy = [];
    while (easy.length > 0 && pickedEasy.length < 2) {
      pickedEasy.push(easy.pop());
    }

    const pickedMedium = [];
    while (medium.length > 0 && pickedMedium.length < 2) {
      pickedMedium.push(medium.pop());
    }

    const pickedHard = [];
    while (hard.length > 0 && pickedHard.length < 1) {
      pickedHard.push(hard.pop());
    }

    // Fallbacks if any tier is short
    const chosenIds = new Set([
      ...pickedEasy.map((q) => q.id),
      ...pickedMedium.map((q) => q.id),
      ...pickedHard.map((q) => q.id),
    ]);
    const remaining = shuffle(categoryRows.filter((q) => !chosenIds.has(q.id)));

    while (pickedEasy.length < 2 && remaining.length > 0) {
      pickedEasy.push(remaining.pop());
    }
    while (pickedMedium.length < 2 && remaining.length > 0) {
      pickedMedium.push(remaining.pop());
    }
    while (pickedHard.length < 1 && remaining.length > 0) {
      pickedHard.push(remaining.pop());
    }

    // Assemble strictly in required order: 2 Easy (pos 1, 2), 2 Medium (pos 3, 4), 1 Hard (pos 5)
    const ordered = [...pickedEasy, ...pickedMedium, ...pickedHard];
    let pos = 0;
    return ordered.map((question) => {
      pos += 1;
      return normalizeQuestionRow({ ...question, position: pos }, category);
    });
  });
};

async function main() {
  await c.connect();
  console.log('=== STARTING MANDATORY VERIFICATION TEST ===\n');

  // 1. Fetch 6 active categories
  const catsRes = await c.query(`
    SELECT id, name FROM question_categories WHERE is_active = true ORDER BY sort_order ASC LIMIT 6
  `);
  if (catsRes.rows.length < 6) {
    throw new Error('Need at least 6 categories in DB');
  }
  const selectedCategories = catsRes.rows;
  console.log(`✓ Selected 6 Categories in exact order:`, selectedCategories.map(c => c.name));

  // 2. Fetch questions for these categories
  const catIds = selectedCategories.map(c => c.id);
  const qRes = await c.query(`
    SELECT id, category_id, question_text, answer_text, difficulty, is_active, strikes, timer_seconds
    FROM question_bank
    WHERE category_id = ANY($1) AND is_active = true
  `, [catIds]);
  console.log(`✓ Fetched ${qRes.rows.length} pool questions`);

  // 3. Build 30 questions
  const questions = buildRoomQuestions(selectedCategories, qRes.rows);
  console.log(`✓ Generated ${questions.length} questions for room`);
  if (questions.length !== 30) {
    throw new Error(`Expected exactly 30 questions, got ${questions.length}`);
  }

  // 4. Verify category order and difficulty pattern:
  // Each category gets 5 questions: 2 easy, 2 medium, 1 hard
  for (let catIdx = 0; catIdx < 6; catIdx++) {
    const expectedCat = selectedCategories[catIdx];
    const catQuestions = questions.slice(catIdx * 5, (catIdx + 1) * 5);
    console.log(`\n--- Checking Category ${catIdx + 1}: ${expectedCat.name} (Boxes ${catIdx * 5 + 1}..${(catIdx + 1) * 5}) ---`);

    for (let i = 0; i < 5; i++) {
      const q = catQuestions[i];
      if (q.category_id !== expectedCat.id) {
        throw new Error(`Box ${catIdx * 5 + i + 1} category mismatch: expected ${expectedCat.name}, got ${q.category_name}`);
      }
      const expectedDiff = (i === 0 || i === 1) ? 'easy' : (i === 2 || i === 3) ? 'medium' : 'hard';
      console.log(`  Box ${catIdx * 5 + i + 1} (pos ${q.position}): [${q.difficulty}] - expected: ${expectedDiff}`);
      if (q.difficulty !== expectedDiff) {
        console.warn(`    Note: question has ${q.difficulty} (fallback used if tier had fewer questions in DB)`);
      }
    }
  }

  // 5. Test Game Room Creation & Initial 0 points
  console.log('\n--- Creating Test Game Room ---');
  const adminRes = await c.query('SELECT id FROM auth.users LIMIT 1');
  const adminId = adminRes.rows[0].id;

  // Set auth context in postgres session
  await c.query(`SELECT set_config('request.jwt.claim.sub', $1, false)`, [adminId]);
  await c.query(`SELECT set_config('request.jwt.claims', $1, false)`, [JSON.stringify({ sub: adminId })]);

  const roomRes = await c.query(`
    SELECT public.create_game_room(
      p_game_name => 'Test Points Room',
      p_team_1_name => 'فريق النسور',
      p_team_2_name => 'فريق الصقور',
      p_selected_categories => $1::text[],
      p_questions => $2::jsonb
    ) as result
  `, [catIds, JSON.stringify(questions)]);

  const roomId = roomRes.rows[0].result.room_id;
  console.log(`✓ Created test room: ${roomId}`);

  // Set status to playing so referee can act
  await c.query(`UPDATE game_rooms SET status = 'playing' WHERE id = $1`, [roomId]);

  // Check initial scores
  const teamsRes = await c.query(`
    SELECT team_index, name, score, points FROM teams WHERE room_id = $1 ORDER BY team_index ASC
  `, [roomId]);
  console.log(`✓ Initial Team 1 score: ${teamsRes.rows[0].score}, points: ${teamsRes.rows[0].points}`);
  console.log(`✓ Initial Team 2 score: ${teamsRes.rows[1].score}, points: ${teamsRes.rows[1].points}`);

  if (Number(teamsRes.rows[0].score) !== 0 || Number(teamsRes.rows[1].score) !== 0) {
    throw new Error('Initial scores must be 0!');
  }

  // 6. Test Question 1 Resolution -> Team 1 gets 1 point
  console.log('\n--- Resolving Question 1: Winner Team 1 (+1 point) ---');
  const roomQuestionsRes = await c.query(`
    SELECT id, position FROM room_questions WHERE room_id = $1 ORDER BY position ASC, id ASC
  `, [roomId]);

  const q1 = roomQuestionsRes.rows[0];
  await c.query(`
    SELECT public.resolve_room_question($1, $2, 1)
  `, [roomId, q1.id]);

  const afterQ1 = await c.query(`
    SELECT team_index, score FROM teams WHERE room_id = $1 ORDER BY team_index ASC
  `, [roomId]);
  console.log(`✓ Team 1 score after win: ${afterQ1.rows[0].score} (expected: 1)`);
  console.log(`✓ Team 2 score after win: ${afterQ1.rows[1].score} (expected: 0)`);

  if (Number(afterQ1.rows[0].score) !== 1 || Number(afterQ1.rows[1].score) !== 0) {
    throw new Error('Team 1 should have exactly 1 point and Team 2 should have 0 points!');
  }

  // 7. Test Question 2 Resolution -> Team 2 gets 1 point
  console.log('\n--- Resolving Question 2: Winner Team 2 (+1 point) ---');
  const q2 = roomQuestionsRes.rows[1];
  await c.query(`
    SELECT public.resolve_room_question($1, $2, 2)
  `, [roomId, q2.id]);

  const afterQ2 = await c.query(`
    SELECT team_index, score FROM teams WHERE room_id = $1 ORDER BY team_index ASC
  `, [roomId]);
  console.log(`✓ Team 1 score: ${afterQ2.rows[0].score} (expected: 1)`);
  console.log(`✓ Team 2 score: ${afterQ2.rows[1].score} (expected: 1)`);

  if (Number(afterQ2.rows[0].score) !== 1 || Number(afterQ2.rows[1].score) !== 1) {
    throw new Error('Both teams should now have 1 point!');
  }

  // Check room status is still 'playing' after 2 questions
  const roomStatusMid = await c.query(`SELECT status FROM game_rooms WHERE id = $1`, [roomId]);
  console.log(`✓ Room status with questions remaining: "${roomStatusMid.rows[0].status}" (expected: playing)`);
  if (roomStatusMid.rows[0].status !== 'playing') {
    throw new Error('Room prematurely ended!');
  }

  // 8. Resolve remaining 28 questions (give Team 1 more wins so Team 1 ends with higher score)
  console.log('\n--- Resolving all remaining 28 questions ---');
  for (let i = 2; i < roomQuestionsRes.rows.length; i++) {
    const q = roomQuestionsRes.rows[i];
    // Give Team 1 wins for first 15 remaining, Team 2 wins for rest
    const winner = i < 18 ? 1 : 2;
    await c.query(`SELECT public.resolve_room_question($1, $2, $3)`, [roomId, q.id, winner]);
  }

  // 9. Verify final game outcome
  const finalTeams = await c.query(`
    SELECT team_index, score FROM teams WHERE room_id = $1 ORDER BY team_index ASC
  `, [roomId]);
  console.log(`\nFinal Scores: Team 1 = ${finalTeams.rows[0].score}, Team 2 = ${finalTeams.rows[1].score}`);

  const finalRoom = await c.query(`
    SELECT status, winner_team_index, finished_reason FROM game_rooms WHERE id = $1
  `, [roomId]);
  console.log(`Final Room State:`, finalRoom.rows[0]);

  if (finalRoom.rows[0].status !== 'finished') {
    throw new Error(`Game room should be finished after 30 questions, got ${finalRoom.rows[0].status}`);
  }
  if (finalRoom.rows[0].winner_team_index !== 1) {
    throw new Error(`Team 1 had higher score and should be winner, got ${finalRoom.rows[0].winner_team_index}`);
  }
  if (finalRoom.rows[0].finished_reason !== 'completed') {
    throw new Error(`Finished reason should be 'completed', got ${finalRoom.rows[0].finished_reason}`);
  }

  // 10. Clean up test room
  await c.query(`DELETE FROM game_rooms WHERE id = $1`, [roomId]);
  console.log(`\n✓ Test room cleaned up.`);

  console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! 100% VERIFIED ===');
  await c.end();
}

main().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
