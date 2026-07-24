import 'dotenv/config';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const fileContent = fs.readFileSync('archive/sle_question.json', 'utf-8');
  const data = JSON.parse(fileContent);
  console.log("Keys in JSON:", Object.keys(data));
  console.log("Is array?", Array.isArray(data));
}

main().catch(console.error).finally(() => prisma.$disconnect());
