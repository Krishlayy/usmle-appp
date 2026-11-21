import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function test() {
  const res = await pool.query('SELECT email, "passwordHash", "emailVerified" FROM "User" WHERE email = \'admin@medico.com\'');
  console.log('User:', res.rows[0]);
  if (res.rows[0]) {
    const match = await bcrypt.compare('password123', res.rows[0].passwordHash);
    console.log('Password match:', match);
  }
  await pool.end();
}
test();
