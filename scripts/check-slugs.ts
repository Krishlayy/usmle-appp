import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const res = await pool.query('SELECT slug FROM "QBank"');
  console.log('Slugs:', res.rows.map(r => r.slug));
}
main().finally(() => pool.end());
