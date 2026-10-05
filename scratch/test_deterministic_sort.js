function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

// Mock 30 questions (6 categories x 5 questions)
const categories = ['دين', 'تاريخ', 'جغرافيا', 'علوم', 'رياضة', 'عام'];
const mockQuestions = [];
let idCounter = 1;

categories.forEach(cat => {
  for (let pos = 1; pos <= 5; pos++) {
    mockQuestions.push({
      id: `q-${idCounter++}`,
      category_id: cat,
      category_name: cat,
      position: pos, // 1 to 5
      room_id: 'test-room-1234',
    });
  }
});

const roomId = 'test-room-1234';
const sorted = [...mockQuestions].sort((a, b) => {
  const hashA = hashString(`${roomId}_${a.category_id}_${a.position}_${a.id}`);
  const hashB = hashString(`${roomId}_${b.category_id}_${b.position}_${b.id}`);
  return hashA - hashB;
});

console.log('Total questions:', sorted.length);
console.log('Boxes 1 to 30 categories:');
sorted.forEach((q, idx) => {
  console.log(`Box #${idx + 1}: Category=${q.category_name}, CatPos=${q.position}, ID=${q.id}`);
});
