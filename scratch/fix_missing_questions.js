const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function main() {
  await c.connect();

  console.log('--- 1. Set positions and add questions to category "تجربه فئه جديده" ---');
  const catId = '72af3c19-f281-459e-908a-7391ca3fc9aa';

  // Update existing questions to position 3 and 4 (medium)
  await c.query(`UPDATE question_bank SET position = 3, difficulty = 'medium', points = 400 WHERE id = 'd463c248-ec2e-44ff-8ee3-6f74cfe8aa99'`);
  await c.query(`UPDATE question_bank SET position = 4, difficulty = 'medium', points = 400 WHERE id = 'a8470b2e-103e-4219-8eb7-c474f3189a23'`);

  // Insert pos 1 (easy), pos 2 (easy), pos 5 (hard)
  await c.query(`
    INSERT INTO question_bank (category_id, question_text, answer_text, difficulty, strikes, timer_seconds, is_active, position, points)
    VALUES 
      ($1, 'ما هو الحيوان الذي يُلقب بسفينة الصحراء؟', 'الجمل', 'easy', 1, 60, true, 1, 200),
      ($1, 'كم عدد أيام الأسبوع؟', '7 أيام', 'easy', 1, 60, true, 2, 200),
      ($1, 'ما هي أكبر هضبة بركانية في العالم؟', 'هضبة الدكن', 'hard', 1, 60, true, 5, 600)
    ON CONFLICT (category_id, position) DO UPDATE 
    SET question_text = EXCLUDED.question_text, answer_text = EXCLUDED.answer_text, difficulty = EXCLUDED.difficulty, points = EXCLUDED.points;
  `, [catId]);
  console.log('✓ Added/updated questions to have exactly 5 questions (pos 1..5).');

  const afterAdd = await c.query('SELECT id, question_text, difficulty FROM question_bank WHERE category_id = $1', [catId]);
  console.log('Category now has:', afterAdd.rows.length, 'questions:');
  console.table(afterAdd.rows);

  // 2. Fix the user latest room ('da63671c-c5d5-45b4-a153-099a254035e8')
  console.log('\n--- 2. Fix questions for room da63671c-c5d5-45b4-a153-099a254035e8 ---');
  const latestRoomId = 'da63671c-c5d5-45b4-a153-099a254035e8';
  
  // Remove existing questions for that category in the room
  await c.query(`DELETE FROM room_questions WHERE room_id = $1 AND category_id = $2`, [latestRoomId, catId]);

  // Insert all 5 questions with pos 1..5
  const cat5Questions = [
    { text: 'ما هو الحيوان الذي يُلقب بسفينة الصحراء؟', ans: 'الجمل', diff: 'easy', pos: 1 },
    { text: 'كم عدد أيام الأسبوع؟', ans: '7 أيام', diff: 'easy', pos: 2 },
    { text: 'تيست المؤقت', ans: 'تيست المؤقت', diff: 'medium', pos: 3 },
    { text: 'copy', ans: 'copy', diff: 'medium', pos: 4 },
    { text: 'ما هي أكبر هضبة بركانية في العالم؟', ans: 'هضبة الدكن', diff: 'hard', pos: 5 },
  ];

  for (const q of cat5Questions) {
    const qRes = await c.query(`
      INSERT INTO room_questions (
        room_id, category_id, category_name, question_text, difficulty,
        strikes, points, position, timer_seconds, is_used
      )
      VALUES ($1, $2, 'تجربه فئه جديده', $3, $4, 1, 200, $5, 60, false)
      RETURNING id
    `, [latestRoomId, catId, q.text, q.diff, q.pos]);

    const qId = qRes.rows[0].id;
    await c.query(`
      INSERT INTO room_question_answers (question_id, answer_text, timer_seconds)
      VALUES ($1, $2, 60)
    `, [qId, q.ans]);
  }
  console.log('✓ Successfully inserted 5 questions for category in latest room!');

  const finalCount = await c.query('SELECT COUNT(*) FROM room_questions WHERE room_id = $1', [latestRoomId]);
  console.log('Room questions count now:', finalCount.rows[0].count);

  await c.end();
}

main().catch(err => { console.error(err); process.exit(1); });
