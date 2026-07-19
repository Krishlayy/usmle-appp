const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const res = await client.query(`
    SELECT q."questionText", q.explanation, q.options
    FROM "Question" q
    WHERE q.explanation ILIKE '%SLE%'
    LIMIT 1;
  `);
  const fs = require('fs');
  fs.writeFileSync('sle_question.json', JSON.stringify(res.rows[0], null, 2));
  console.log("Saved to sle_question.json");
}
main().catch(console.error).finally(() => client.end());
