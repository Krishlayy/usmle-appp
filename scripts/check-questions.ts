import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const res = await pool.query(`
    SELECT q.id, q."questionText", q."imageUrl" 
    FROM "Question" q 
    JOIN "QBank" qb ON q."qbankId" = qb.id 
    WHERE qb.slug = 'autoimmune-disease'
  `);
  console.log(res.rows);
}
main().finally(() => pool.end());
