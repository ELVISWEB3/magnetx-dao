const { Pool } = require("pg");

let pool = null;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set for Postgres connection");
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Render's managed Postgres typically requires SSL; DATABASE_URL often encodes sslmode
      // If needed, uncomment the next line to force SSL without cert verification
      // ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

async function initPg() {
  const p = getPool();
  // Generic submissions table (JSONB)
  await p.query(`
    CREATE TABLE IF NOT EXISTS submissions (
      id BIGSERIAL PRIMARY KEY,
      form_name TEXT NOT NULL,
      payload JSONB NOT NULL,
      user_agent TEXT,
      ip TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await p.query(`
    CREATE INDEX IF NOT EXISTS idx_submissions_form_created_at
      ON submissions(form_name, created_at DESC);
  `);
  // Typed table for the "apply" form
  await p.query(`
    CREATE TABLE IF NOT EXISTS apply_submissions (
      id BIGSERIAL PRIMARY KEY,
      full_name TEXT,
      x_profile_link TEXT,
      region TEXT,
      phone TEXT,
      niche TEXT,
      skills TEXT,
      other_skill TEXT,
      category TEXT,
      followers TEXT,
      reason TEXT,
      user_agent TEXT,
      ip TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      payload JSONB
    );
  `);
  await p.query(`
    CREATE INDEX IF NOT EXISTS idx_apply_created_at ON apply_submissions(created_at DESC);
  `);
}

module.exports = { getPool, initPg };
