require('dotenv').config();
const { Client } = require('pg');
async function getQBanks() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query('SELECT slug FROM "QBank"');
  console.log('QBanks:', res.rows);
  await client.end();
}
getQBanks();
