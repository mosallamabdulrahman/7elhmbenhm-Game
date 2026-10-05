const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

// Simulate buildRoomQuestions from lib/game-data.ts
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
  question_text: question.question_text,
  answer_text: question.answer_text,
  position: question.position,
  difficulty: question.difficulty,
  strikes: 1,
  points: 200,
  timer_seconds: 60,
});

const buildRoomQuestions = (categories, questionRows = []) => {
  return categories.flatMap((category) => {
    const categoryRows = questionRows.filter(
      (question) =>
        question.category_id === category.id && question.is_active !== false
    );

    const easy = shuffle(categoryRows.filter((q) => q.difficulty === "easy"));
    const medium = shuffle(
      categoryRows.filter((q) => q.difficulty === "medium")
    );
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

    // Global pool fallbacks if category itself has fewer than 5 questions
    if (pickedEasy.length + pickedMedium.length + pickedHard.length < 5) {
      const poolEasy = shuffle(
        questionRows.filter(
          (q) =>
            q.difficulty === "easy" &&
            !chosenIds.has(q.id) &&
            q.is_active !== false
        )
      );
      while (pickedEasy.length < 2 && poolEasy.length > 0) {
        const q = poolEasy.pop();
        chosenIds.add(q.id);
        pickedEasy.push({
          ...q,
          category_id: category.id,
          category_name: category.name,
        });
      }

      const poolMedium = shuffle(
        questionRows.filter(
          (q) =>
            q.difficulty === "medium" &&
            !chosenIds.has(q.id) &&
            q.is_active !== false
        )
      );
      while (pickedMedium.length < 2 && poolMedium.length > 0) {
        const q = poolMedium.pop();
        chosenIds.add(q.id);
        pickedMedium.push({
          ...q,
          category_id: category.id,
          category_name: category.name,
        });
      }

      const poolHard = shuffle(
        questionRows.filter(
          (q) =>
            q.difficulty === "hard" &&
            !chosenIds.has(q.id) &&
            q.is_active !== false
        )
      );
      while (pickedHard.length < 1 && poolHard.length > 0) {
        const q = poolHard.pop();
        chosenIds.add(q.id);
        pickedHard.push({
          ...q,
          category_id: category.id,
          category_name: category.name,
        });
      }

      const anyPool = shuffle(
        questionRows.filter((q) => !chosenIds.has(q.id) && q.is_active !== false)
      );
      while (pickedEasy.length < 2 && anyPool.length > 0) {
        const q = anyPool.pop();
        chosenIds.add(q.id);
        pickedEasy.push({
          ...q,
          difficulty: "easy",
          category_id: category.id,
          category_name: category.name,
        });
      }
      while (pickedMedium.length < 2 && anyPool.length > 0) {
        const q = anyPool.pop();
        chosenIds.add(q.id);
        pickedMedium.push({
          ...q,
          difficulty: "medium",
          category_id: category.id,
          category_name: category.name,
        });
      }
      while (pickedHard.length < 1 && anyPool.length > 0) {
        const q = anyPool.pop();
        chosenIds.add(q.id);
        pickedHard.push({
          ...q,
          difficulty: "hard",
          category_id: category.id,
          category_name: category.name,
        });
      }
    }

    const ordered = [...pickedEasy, ...pickedMedium, ...pickedHard];
    let pos = 0;
    return ordered.map((question) => {
      pos += 1;
      return normalizeQuestionRow({ ...question, position: pos }, category);
    });
  });
};

async function testEdgeCase() {
  console.log('Testing Edge Case: 6 Categories where Category 5 has ONLY 1 question in DB...');
  const categories = [
    { id: 'c1', name: 'Cat 1' },
    { id: 'c2', name: 'Cat 2' },
    { id: 'c3', name: 'Cat 3' },
    { id: 'c4', name: 'Cat 4' },
    { id: 'c5', name: 'Cat 5 (Only 1 question)' },
    { id: 'c6', name: 'Cat 6' },
  ];

  // Synthesize pool questions: Cat 1..4 & 6 have 10 questions each, Cat 5 has ONLY 1 question
  const pool = [];
  ['c1', 'c2', 'c3', 'c4', 'c6'].forEach(catId => {
    for (let i = 1; i <= 10; i++) {
      const diff = i <= 4 ? 'easy' : i <= 7 ? 'medium' : 'hard';
      pool.push({ id: `${catId}-q${i}`, category_id: catId, question_text: `Q ${catId} ${i}`, difficulty: diff, is_active: true });
    }
  });
  // Cat 5 has only 1 medium question
  pool.push({ id: 'c5-q1', category_id: 'c5', question_text: 'Only Q in Cat 5', difficulty: 'medium', is_active: true });

  const result = buildRoomQuestions(categories, pool);
  console.log(`✓ Total questions returned: ${result.length} (Expected: 30)`);
  if (result.length !== 30) {
    throw new Error(`Failed! Expected 30 questions, got ${result.length}`);
  }

  // Check Cat 5 questions
  const cat5Questions = result.filter(q => q.category_id === 'c5');
  console.log(`✓ Cat 5 questions count: ${cat5Questions.length} (Expected: 5)`);
  console.log(`  Difficulties:`, cat5Questions.map(q => q.difficulty));
  if (cat5Questions.length !== 5) {
    throw new Error(`Failed! Cat 5 should have 5 questions.`);
  }

  console.log('✓ Edge case test PASSED flawlessly!');
}

testEdgeCase().catch(err => {
  console.error(err);
  process.exit(1);
});
