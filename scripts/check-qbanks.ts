import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const res = await pool.query('SELECT slug, title, "isActive" FROM "QBank"');
  console.table(res.rows);
}
main().finally(() => pool.end());
