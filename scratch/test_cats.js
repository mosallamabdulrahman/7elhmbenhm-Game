const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function main() {
  await c.connect();
  const cats = await c.query("SELECT id, name FROM question_categories WHERE is_active = true LIMIT 6");
  const catIds = cats.rows.map(x => x.id);
  const qs = await c.query("SELECT id, category_id, question_text, answer_text, difficulty, is_active FROM question_bank WHERE category_id = ANY($1) AND is_active = true", [catIds]);
  
  // Test buildRoomQuestions logic
  const shuffle = (rows) => [...rows].sort(() => Math.random() - 0.5);
  const categoryQuestions = cats.rows.flatMap((category) => {
    const categoryRows = qs.rows.filter(q => q.category_id === category.id);
    const easy = shuffle(categoryRows.filter(q => q.difficulty === 'easy'));
    const medium = shuffle(categoryRows.filter(q => q.difficulty === 'medium'));
    const hard = shuffle(categoryRows.filter(q => q.difficulty === 'hard'));
    const picked = [];
    while (easy.length && picked.length < 2) picked.push(easy.pop());
    while (medium.length && picked.length < 4) picked.push(medium.pop());
    while (hard.length && picked.length < 5) picked.push(hard.pop());
    while (picked.length < 5) picked.push(categoryRows.pop());
    return picked.map(q => ({ ...q, category_name: category.name }));
  });

  const shuffled30 = shuffle(categoryQuestions);
  console.log('Total questions built:', shuffled30.length);
  console.log('Sample question positions:', shuffled30.slice(0, 5).map((q, i) => ({ pos: i + 1, cat: q.category_name, diff: q.difficulty })));
  await c.end();
}
main().catch(console.error);
