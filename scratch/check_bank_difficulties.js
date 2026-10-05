const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function main() {
  await c.connect();
  const res = await c.query(`
    SELECT c.id, c.name,
      COUNT(*) FILTER (WHERE q.difficulty = 'easy') as easy_count,
      COUNT(*) FILTER (WHERE q.difficulty = 'medium') as med_count,
      COUNT(*) FILTER (WHERE q.difficulty = 'hard') as hard_count,
      COUNT(*) as total
    FROM question_categories c
    LEFT JOIN question_bank q ON c.id = q.category_id AND q.is_active = true
    WHERE c.is_active = true
    GROUP BY c.id, c.name
    ORDER BY total DESC;
  `);
  console.log('Categories and difficulty counts:');
  console.table(res.rows);
  await c.end();
}
main().catch(console.error);
