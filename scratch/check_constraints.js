const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
async function run() {
  await c.connect();
  const res = await c.query("SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'room_questions'::regclass");
  console.log('Constraints on room_questions:');
  console.table(res.rows);
  await c.end();
}
run();
