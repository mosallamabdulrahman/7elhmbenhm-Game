const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function main() {
  await c.connect();
  console.log('Testing create_game_room with 30 questions...');

  // Get a user id (judge)
  const userRes = await c.query("SELECT id FROM auth.users LIMIT 1");
  const judgeId = userRes.rows[0]?.id;
  await c.query('BEGIN');
  await c.query(`SELECT set_config('request.jwt.claim.sub', $1, true)`, [judgeId]);
  await c.query(`SELECT set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: judgeId })]);

  const catRes = await c.query("SELECT id, name FROM question_categories WHERE is_active = true LIMIT 6");
  const cats = catRes.rows;
  const catIds = cats.map(x => x.id);

  const qRes = await c.query("SELECT id, category_id, question_text, answer_text, difficulty, points, timer_seconds, is_active FROM question_bank WHERE category_id = ANY($1) AND is_active = true", [catIds]);

  const questions = cats.flatMap((cat) => {
    const rows = qRes.rows.filter(q => q.category_id === cat.id).slice(0, 5);
    let pos = 0;
    return rows.map(q => {
      pos += 1;
      return {
        question_bank_id: q.id,
        category_id: cat.id,
        category_name: cat.name,
        question_text: q.question_text,
        answer_text: q.answer_text,
        difficulty: q.difficulty,
        strikes: 1,
        points: 200,
        position: pos, // 1 to 5 per category!
        timer_seconds: 60,
      };
    });
  });

  console.log(`Generated ${questions.length} questions. Positions per category are 1..5.`);

  // Call create_game_room directly in SQL
  const rpcRes = await c.query(`
    SELECT public.create_game_room(
      p_game_name => 'تجربة اللعبة 30 مربع',
      p_team_1_name => 'كتائب الفرسان',
      p_team_2_name => 'صقور النخبة',
      p_selected_categories => $1::text[],
      p_questions => $2::jsonb
    ) as result;
  `, [catIds, JSON.stringify(questions)]);

  const result = rpcRes.rows[0]?.result;
  console.log('Room created successfully! Result:', result);

  // Check the room_questions inserted
  const rqRes = await c.query("SELECT count(*) FROM room_questions WHERE room_id = $1", [result.room_id]);
  console.log('Room questions count in DB:', rqRes.rows[0]?.count);

  // Clean up test room
  await c.query("DELETE FROM game_rooms WHERE id = $1", [result.room_id]);
  console.log('Cleaned up test room.');

  await c.end();
}

main().catch(err => {
  console.error('Error testing create_game_room:', err);
  process.exit(1);
});
