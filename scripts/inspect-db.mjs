import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const users = await pool.query('SELECT id, email, role, "emailVerified" FROM "User"');
  console.log('USERS:', users.rows);
  const qbanks = await pool.query('SELECT id, title, slug, "isActive" FROM "QBank"');
  console.log('QBANKS:', qbanks.rows);
  await pool.end();
}

main().catch(console.error);