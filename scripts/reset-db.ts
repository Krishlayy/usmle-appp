import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is missing in environment variables!');
  process.exit(1);
}

const pool = new Pool({ connectionString });

export async function resetDatabase() {
  console.log('🔄 Connecting to PostgreSQL database...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🗑️  Dropping TranslationCache table if present...');
    await client.query('DROP TABLE IF EXISTS "TranslationCache" CASCADE;');

    console.log('🧹 Clearing application dump data in foreign-key order...');
    const tables = [
      'Highlight',
      'Flashcard',
      'UserProgress',
      'TestSession',
      'Purchase',
      'QuestionIssue',
      'QuestionMedia',
      'QuestionImage',
      'Question',
      'QBank',
      'PasswordResetToken',
      'VerificationToken'
    ];

    for (const table of tables) {
      try {
        await client.query(`SAVEPOINT sp_${table};`);
        await client.query(`DELETE FROM "${table}";`);
        await client.query(`RELEASE SAVEPOINT sp_${table};`);
        console.log(`   Cleaned ${table}`);
      } catch (err: any) {
        if (err.code === '42P01') {
          await client.query(`ROLLBACK TO SAVEPOINT sp_${table};`);
          console.log(`   Skipped ${table} (table does not exist)`);
        } else {
          throw err;
        }
      }
    }

    console.log('👤 Ensuring clean superadmin account...');
    const adminEmail = 'admin@medico.com';
    const adminPassword = 'password123';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const existingAdmin = await client.query('SELECT id FROM "User" WHERE email = $1', [adminEmail]);

    if (existingAdmin.rows.length > 0) {
      await client.query(
        'UPDATE "User" SET role = $1, "passwordHash" = $2, "securityViolations" = 0, "isBlocked" = false WHERE email = $3',
        ['SUPERADMIN', passwordHash, adminEmail]
      );
      // Remove other test accounts
      await client.query('DELETE FROM "User" WHERE email != $1', [adminEmail]);
    } else {
      await client.query('DELETE FROM "User";');
      const newAdminId = crypto.randomUUID();
      await client.query(
        `INSERT INTO "User" (id, email, "passwordHash", name, role, "securityViolations", "isBlocked", "createdAt")
         VALUES ($1, $2, $3, $4, $5, 0, false, NOW())`,
        [newAdminId, adminEmail, passwordHash, 'Super Admin', 'SUPERADMIN']
      );
    }

    await client.query('COMMIT');
    console.log('✅ Database reset successfully completed!');
    console.log(`🔑 Superadmin ready:`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to reset database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (process.argv[1] && process.argv[1].includes('reset-db')) {
  resetDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
