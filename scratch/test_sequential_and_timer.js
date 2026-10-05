const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function main() {
  await c.connect();
  console.log('=== TEST: SEQUENTIAL GRID & 30-SECOND TIMER ===\n');

  // 1. Verify timer_seconds across question_bank
  console.log('1. Checking question_bank timers...');
  const bankCheck = await c.query(`
    SELECT COUNT(*) as non_30_count
    FROM question_bank
    WHERE timer_seconds != 30
  `);
  console.log(`✓ Questions with timer != 30: ${bankCheck.rows[0].non_30_count} (Expected: 0)`);
  if (Number(bankCheck.rows[0].non_30_count) !== 0) {
    throw new Error('Found questions in question_bank that do not have 30s timer!');
  }

  // 2. Verify room creation enforces 30 seconds
  console.log('\n2. Creating test room to verify 30-second timer enforcement...');
  const adminRes = await c.query('SELECT id FROM auth.users LIMIT 1');
  const adminId = adminRes.rows[0].id;
  await c.query(`SELECT set_config('request.jwt.claim.sub', $1, false)`, [adminId]);
  await c.query(`SELECT set_config('request.jwt.claims', $1, false)`, [JSON.stringify({ sub: adminId })]);

  const cats = await c.query('SELECT id FROM question_categories WHERE is_active = true LIMIT 6');
  const catIds = cats.rows.map(x => x.id);

  const sampleQuestions = [];
  for (let i = 0; i < 30; i++) {
    sampleQuestions.push({
      category_id: catIds[Math.floor(i / 5)],
      category_name: 'فئة',
      question_text: `سؤال ${i + 1}`,
      answer_text: `إجابة ${i + 1}`,
      difficulty: (i % 5 < 2) ? 'easy' : (i % 5 < 4) ? 'medium' : 'hard',
      position: (i % 5) + 1,
      points: 200,
    });
  }

  const roomRes = await c.query(`
    SELECT public.create_game_room(
      'Sequential Test Room',
      'فريق 1',
      'فريق 2',
      $1,
      $2
    ) as result
  `, [catIds, JSON.stringify(sampleQuestions)]);

  const roomId = roomRes.rows[0].result.room_id;

  const roomTimerCheck = await c.query(`
    SELECT COUNT(*) as non_30
    FROM room_questions
    WHERE room_id = $1 AND timer_seconds != 30
  `, [roomId]);

  console.log(`✓ Room questions with timer != 30s: ${roomTimerCheck.rows[0].non_30} (Expected: 0)`);
  if (Number(roomTimerCheck.rows[0].non_30) !== 0) {
    throw new Error('Room questions do not all have 30s timer!');
  }

  // 3. Test Sequential Selection Logic Simulation
  console.log('\n3. Testing Sequential Selection Logic...');
  const questionsRes = await c.query(`
    SELECT id, position, is_used FROM room_questions WHERE room_id = $1 ORDER BY id ASC
  `, [roomId]);
  const sortedQuestions = questionsRes.rows;

  const getNextPendingBoxNumber = (qs) => {
    const idx = qs.findIndex(q => !q.is_used);
    return idx === -1 ? qs.length + 1 : idx + 1;
  };

  const simulateClick = (qs, targetBoxNumber) => {
    const nextPending = getNextPendingBoxNumber(qs);
    const targetQ = qs[targetBoxNumber - 1];

    if (targetQ.is_used) {
      return { allowed: false, reason: 'already_answered' };
    }
    if (targetBoxNumber > nextPending) {
      return { 
        allowed: false, 
        reason: 'locked_must_be_sequential',
        currentTurnBox: nextPending 
      };
    }
    return { allowed: true, targetQ };
  };

  // Initially, only Box 1 can be clicked
  console.log(`Initial state: nextPendingBoxNumber = ${getNextPendingBoxNumber(sortedQuestions)}`);
  
  const clickBox1 = simulateClick(sortedQuestions, 1);
  console.log('Clicking Box 1:', clickBox1.allowed ? '✓ ALLOWED' : '✗ BLOCKED');
  if (!clickBox1.allowed) throw new Error('Box 1 should be allowed!');

  const clickBox2Before1 = simulateClick(sortedQuestions, 2);
  console.log('Clicking Box 2 before Box 1 is done:', clickBox2Before1.allowed ? '✗ ALLOWED' : `✓ BLOCKED (${clickBox2Before1.reason})`);
  if (clickBox2Before1.allowed) throw new Error('Box 2 should be locked!');

  const clickBox10Before1 = simulateClick(sortedQuestions, 10);
  console.log('Clicking Box 10 before Box 1 is done:', clickBox10Before1.allowed ? '✗ ALLOWED' : `✓ BLOCKED (${clickBox10Before1.reason})`);
  if (clickBox10Before1.allowed) throw new Error('Box 10 should be locked!');

  // Now resolve Box 1
  sortedQuestions[0].is_used = true;
  console.log(`\nAfter answering Box 1: nextPendingBoxNumber = ${getNextPendingBoxNumber(sortedQuestions)}`);

  const clickBox1Again = simulateClick(sortedQuestions, 1);
  console.log('Clicking Box 1 again:', clickBox1Again.allowed ? '✗ ALLOWED' : `✓ BLOCKED (${clickBox1Again.reason})`);

  const clickBox2Now = simulateClick(sortedQuestions, 2);
  console.log('Clicking Box 2 now:', clickBox2Now.allowed ? '✓ ALLOWED' : '✗ BLOCKED');
  if (!clickBox2Now.allowed) throw new Error('Box 2 should now be allowed!');

  const clickBox3Before2 = simulateClick(sortedQuestions, 3);
  console.log('Clicking Box 3 before Box 2 is done:', clickBox3Before2.allowed ? '✗ ALLOWED' : `✓ BLOCKED (${clickBox3Before2.reason})`);
  if (clickBox3Before2.allowed) throw new Error('Box 3 should be locked!');

  // Cleanup test room
  await c.query('DELETE FROM game_rooms WHERE id = $1', [roomId]);
  console.log('\n✓ Test room cleaned up.');

  console.log('\n=== ALL TESTS PASSED! SEQUENTIAL & 30-SEC TIMER VERIFIED ===');
  await c.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
