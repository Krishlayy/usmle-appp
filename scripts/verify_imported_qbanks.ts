import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function verify() {
  console.log('=== VERIFYING DATABASE QBANKS & QUESTIONS ===\n');

  // 1. QBanks
  const qbanksRes = await pool.query(`
    SELECT q.id, q.slug, q.title, q."specialtyTag", q."totalQuestions", q."isActive",
           COUNT(DISTINCT qu.id)::int as "actualQuestions",
           COUNT(DISTINCT qm.id)::int as "totalMedia",
           COUNT(DISTINCT qu.id) FILTER (WHERE qu."videoUrl" IS NOT NULL)::int as "withVideos"
    FROM "QBank" q
    LEFT JOIN "Question" qu ON qu."qbankId" = q.id
    LEFT JOIN "QuestionMedia" qm ON qm."questionId" = qu.id
    GROUP BY q.id, q.slug, q.title, q."specialtyTag", q."totalQuestions", q."isActive"
    ORDER BY q.title ASC
  `);

  console.table(qbanksRes.rows);

  // 2. Sample Question Details for each QBank
  for (const qb of qbanksRes.rows) {
    const qSample = await pool.query(`
      SELECT qu.qid, qu.subtopic, qu."correctAnswer", qu."videoUrl", qu.options,
             COUNT(qm.id)::int as "mediaCount"
      FROM "Question" qu
      LEFT JOIN "QuestionMedia" qm ON qm."questionId" = qu.id
      WHERE qu."qbankId" = $1
      GROUP BY qu.id, qu.qid, qu.subtopic, qu."correctAnswer", qu."videoUrl", qu.options
      ORDER BY qu.qid ASC
      LIMIT 1
    `, [qb.id]);

    if (qSample.rows.length > 0) {
      const q = qSample.rows[0];
      const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
      const greenOpt = opts.find((o: any) => o.isCorrect);
      const yellowOpt = opts.find((o: any) => o.isYellowDistractor);
      console.log(`\nSample for [${qb.title}]:`);
      console.log(`  QID: ${q.qid} - Subtopic: ${q.subtopic}`);
      console.log(`  Correct (Green): ${greenOpt?.id} (${greenOpt?.text})`);
      console.log(`  Plausible Distractor (Yellow): ${yellowOpt ? `${yellowOpt.id} (${yellowOpt.text})` : 'None in Q1'}`);
      console.log(`  Video URL: ${q.videoUrl || 'None'}`);
      console.log(`  Media Exhibits: ${q.mediaCount}`);
    }
  }
}

verify()
  .catch(console.error)
  .finally(() => pool.end());
