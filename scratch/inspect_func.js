const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function main() {
  await c.connect();

  const func = await c.query(`
    SELECT routine_name, routine_definition
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name = 'select_room_question'
  `);
  console.log('--- select_room_question:');
  console.log(func.rows[0]?.routine_definition);

  const resolveFunc = await c.query(`
    SELECT routine_name, routine_definition
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name = 'resolve_room_question'
  `);
  console.log('--- resolve_room_question:');
  console.log(resolveFunc.rows[0]?.routine_definition);

  await c.end();
}
main().catch(console.error);
