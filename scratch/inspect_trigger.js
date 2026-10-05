const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function main() {
  await c.connect();
  const res = await c.query("SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'enforce_team_board_complete_before_ready'");
  console.log(res.rows[0]?.pg_get_functiondef);

  const triggers = await c.query(`
    SELECT tgname, tgenabled, relname
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE tgname LIKE '%ready%' OR tgname LIKE '%board%';
  `);
  console.log('Triggers:', triggers.rows);
  await c.end();
}
main().catch(console.error);
