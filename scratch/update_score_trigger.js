const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function main() {
  await c.connect();
  console.log('--- Updating fn_teams_score_init to initialize score to 0 ---');
  await c.query(`
CREATE OR REPLACE FUNCTION public.fn_teams_score_init()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.score := 0;
  RETURN NEW;
END;
$function$;
  `);
  console.log('✓ fn_teams_score_init updated to initialize teams with score = 0.');
  await c.end();
}
main().catch(console.error);
