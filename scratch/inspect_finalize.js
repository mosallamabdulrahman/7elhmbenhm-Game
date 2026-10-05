const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
async function run() {
  await c.connect();
  const res = await c.query("SELECT pg_get_functiondef('finalize_room_if_complete'::regproc)");
  console.log(res.rows[0].pg_get_functiondef);
  await c.end();
}
run();
