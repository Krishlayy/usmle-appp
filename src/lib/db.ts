import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

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
