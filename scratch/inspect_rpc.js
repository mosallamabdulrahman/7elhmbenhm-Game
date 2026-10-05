const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function main() {
  await c.connect();
  const r1 = await c.query("SELECT pg_get_functiondef('restart_game_room'::regproc)");
  console.log('--- restart_game_room ---');
  console.log(r1.rows[0]?.pg_get_functiondef);

  const r2 = await c.query("SELECT pg_get_functiondef('resume_game_room'::regproc)");
  console.log('--- resume_game_room ---');
  console.log(r2.rows[0]?.pg_get_functiondef);

  await c.end();
}

main().catch(err => { console.error(err); process.exit(1); });
