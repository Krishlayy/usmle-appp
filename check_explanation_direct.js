const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const res = await client.query(`
    SELECT explanation 
    FROM "Question" 
    WHERE "qbankId" IN (SELECT id FROM "Qbank" WHERE title ILIKE '%Autoimmune%') 
    AND explanation ILIKE '%SLE%'
    LIMIT 1;
  `);
  console.log(res.rows[0].explanation);
}
main().catch(console.error).finally(() => client.end());
