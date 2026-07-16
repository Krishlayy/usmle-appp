import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is missing. Using dummy connection string for build time. This will crash at runtime if the DB is accessed.');
}
const connectionString = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';

const globalForPrisma = globalThis as unknown as { 
  prisma: PrismaClient;
  pgPool: Pool;
};

const pool = globalForPrisma.pgPool ?? new Pool({ 
  connectionString, 
  max: 20, // Strict limit per serverless instance to prevent overwhelming Neon pooler
  idleTimeoutMillis: 20000 
});
const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pgPool = pool;
}
