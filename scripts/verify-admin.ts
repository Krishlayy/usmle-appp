import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function run() {
  const res = await pool.query('UPDATE "User" SET "emailVerified" = NOW() WHERE email = \'admin@medico.com\' RETURNING email, "emailVerified"');
  console.log('Result:', res.rows);
  await pool.end();
}
run();
