const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function main() {
  await c.connect();
  const qRes = await c.query(`
    SELECT id, question_text, answer_text, difficulty, position, is_active
    FROM question_bank
    WHERE category_id = '72af3c19-f281-459e-908a-7391ca3fc9aa'
    ORDER BY position ASC
  `);
  console.log("All questions in 'تجربه فئه جديده':");
  console.table(qRes.rows);

  // Check recent game rooms created in the last 2 hours
  const rooms = await c.query(`
    SELECT r.id, r.game_name, r.created_at, r.selected_categories, COUNT(q.id) as room_questions_count
    FROM game_rooms r
    LEFT JOIN room_questions q ON q.room_id = r.id
    GROUP BY r.id, r.game_name, r.created_at, r.selected_categories
    ORDER BY r.created_at DESC
    LIMIT 5
  `);
  console.log('\n--- Recent Rooms ---');
  console.table(rooms.rows);

  if (rooms.rows.length > 0) {
    const latestRoomId = rooms.rows[0].id;
    const catBreakdown = await c.query(`
      SELECT category_name, category_id, COUNT(id) as count
      FROM room_questions
      WHERE room_id = $1
      GROUP BY category_name, category_id
    `, [latestRoomId]);
    console.log(`\n--- Latest Room (${latestRoomId}) Questions per Category ---`);
    console.table(catBreakdown.rows);
  }

  await c.end();
}

main().catch(err => { console.error(err); process.exit(1); });
