const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const res = await client.query(`
    SELECT q.explanation 
    FROM "Question" q
    JOIN "Qbank" qb ON q."qbankId" = qb.id
    WHERE qb.title ILIKE '%Autoimmune%'
    AND q.explanation ILIKE '%SLE%'
    LIMIT 1;
  `);
  console.log(res.rows[0]?.explanation);
}
main().catch(console.error).finally(() => client.end());
