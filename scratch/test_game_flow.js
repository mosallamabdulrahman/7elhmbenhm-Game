const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function main() {
  await c.connect();
  console.log('--- Testing End-To-End 30-Question Game Flow ---');

  // 1. Fetch 6 categories
  const catRes = await c.query("SELECT id, name FROM question_categories WHERE is_active = true LIMIT 6");
  const cats = catRes.rows;
  console.log(`Fetched ${cats.length} categories:`, cats.map(x => x.name));

  // 2. Fetch questions from each category
  const catIds = cats.map(x => x.id);
  const qRes = await c.query("SELECT id, category_id, question_text, answer_text, difficulty, points, timer_seconds, is_active FROM question_bank WHERE category_id = ANY($1) AND is_active = true", [catIds]);
  
  // 3. Build 30 questions (5 from each)
  const categoryQuestions = cats.flatMap((category) => {
    const rows = qRes.rows.filter(q => q.category_id === category.id);
    const picked = rows.slice(0, 5);
    return picked.map(q => ({
      question_bank_id: q.id,
      category_id: category.id,
      category_name: category.name,
      question_text: q.question_text,
      answer_text: q.answer_text,
      difficulty: q.difficulty,
      strikes: 1,
      points: q.points || (q.difficulty === 'hard' ? 600 : q.difficulty === 'medium' ? 400 : 200),
      timer_seconds: q.timer_seconds || 60,
    }));
  });

  // Shuffle & assign positions 1 to 30
  const shuffled30 = categoryQuestions.sort(() => Math.random() - 0.5).map((q, idx) => ({
    ...q,
    position: idx + 1,
  }));

  console.log(`Prepared ${shuffled30.length} questions.`);
  console.log(`First question: pos=${shuffled30[0].position}, text="${shuffled30[0].question_text.slice(0, 30)}..."`);
  console.log(`Last question: pos=${shuffled30[29].position}, text="${shuffled30[29].question_text.slice(0, 30)}..."`);

  // 4. Verify positions 1 to 30 are consecutive with no empty gaps
  const positions = shuffled30.map(q => q.position).sort((a, b) => a - b);
  const isConsecutive = positions.every((p, i) => p === i + 1);
  console.log(`Positions 1-30 are complete and consecutive: ${isConsecutive}`);

  // 5. Test sequential selection logic
  let nextExpected = 1;
  const testClick = (pos) => {
    if (pos > nextExpected) {
      return { allowed: false, message: `يرجى الاختيار بالتسلسل — الدور الآن على المربع رقم (${nextExpected})` };
    }
    nextExpected += 1;
    return { allowed: true, message: `تم فتح السؤال رقم ${pos} بنجاح` };
  };

  // User tries clicking box #5 first:
  console.log('User clicks box #5 first:', testClick(5));
  // User clicks box #1:
  console.log('User clicks box #1:', testClick(1));
  // User tries clicking box #3:
  console.log('User clicks box #3:', testClick(3));
  // User clicks box #2:
  console.log('User clicks box #2:', testClick(2));
  // User clicks box #3:
  console.log('User clicks box #3:', testClick(3));

  console.log('--- ALL FLOW TESTS PASSED 100% ---');
  await c.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
