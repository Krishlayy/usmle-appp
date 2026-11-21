import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  for (const slug of ['autoimmune-diseases', 'biologics-and-their-targets', 'immunodeficiency-disorders']) {
    const res = await pool.query(
      `SELECT qu.qid, qu.id 
       FROM "Question" qu 
       JOIN "QBank" q ON qu."qbankId" = q.id 
       WHERE q.slug = $1 
       ORDER BY qu.qid ASC`,
      [slug]
    );

    const expected = Array.from({ length: 50 }, (_, i) => `${slug}-q${String(i + 1).padStart(2, '0')}`);
    const extra = res.rows.filter(r => !expected.includes(r.qid));
    console.log(slug, 'total:', res.rows.length, 'extra legacy:', extra.map(r => r.qid));

    if (extra.length > 0) {
      const extraIds = extra.map(r => r.id);
      await pool.query('DELETE FROM "QuestionMedia" WHERE "questionId" = ANY($1)', [extraIds]);
      await pool.query('DELETE FROM "Question" WHERE id = ANY($1)', [extraIds]);
      console.log('  Cleaned up', extra.length, 'legacy questions.');
    }
  }

  await pool.end();
}

run();
