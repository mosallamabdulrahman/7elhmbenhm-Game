const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function run() {
  await c.connect();
  const res = await c.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'room_questions'");
  console.log('room_questions columns:', res.rows.map(r => r.column_name));
  await c.end();
}
run();
