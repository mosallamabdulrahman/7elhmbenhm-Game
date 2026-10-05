const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function main() {
  await c.connect();
  const triggers = await c.query(`
    SELECT tgname, relname, proname, pg_get_functiondef(p.oid) as def
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_proc p ON t.tgfoid = p.oid
    WHERE relname IN ('teams', 'room_questions', 'game_rooms')
      AND NOT tgisinternal;
  `);
  for (const row of triggers.rows) {
    console.log(`Table: ${row.relname}, Trigger: ${row.tgname}, Function: ${row.proname}`);
  }
  await c.end();
}
main().catch(console.error);
