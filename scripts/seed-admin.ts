import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is missing!");
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function main() {
  const email = 'admin@medico.com';
  const password = 'password123';
  const passwordHash = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();

  try {
    const res = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
    if (res.rows.length > 0) {
      await pool.query('UPDATE "User" SET role = $1, "passwordHash" = $2 WHERE email = $3', ['SUPERADMIN', passwordHash, email]);
      console.log(`\n✅ Successfully updated Super Admin account via Raw SQL!`);
    } else {
      await pool.query(
        'INSERT INTO "User" (id, user_id, email, "passwordHash", name, role, "securityViolations", "isBlocked", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())',
        [id, id, email, passwordHash, 'Super Admin', 'SUPERADMIN', 0, false]
      );
      console.log(`\n✅ Successfully created Super Admin account via Raw SQL!`);
    }
    
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}\n`);
  } catch (err) {
    console.error('Error inserting user:', err);
  } finally {
    await pool.end();
  }
}

main();
