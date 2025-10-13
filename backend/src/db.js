"use strict";
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

// Path to DB comes from env or defaults to backend/data.sqlite
const DB_FILE = process.env.DATABASE_FILE || path.resolve(__dirname, "..", "data.sqlite");

function openDb() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const db = new Database(DB_FILE);
  // Improve concurrency/safety for local dev
  db.pragma("journal_mode = WAL");
  db.prepare(
    `CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_name TEXT NOT NULL,
      payload TEXT NOT NULL,
      user_agent TEXT,
      ip TEXT,
      created_at TEXT NOT NULL
    )`
  ).run();
  db.prepare(
    `CREATE INDEX IF NOT EXISTS idx_submissions_form_created_at
     ON submissions(form_name, created_at DESC)`
  ).run();
  // Typed table mirroring the Apply form fields
  db.prepare(
    `CREATE TABLE IF NOT EXISTS apply_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      created_at TEXT NOT NULL,
      payload TEXT
    )`
  ).run();
  db.prepare(
    `CREATE INDEX IF NOT EXISTS idx_apply_created_at ON apply_submissions(created_at DESC)`
  ).run();
  return db;
}

const db = openDb();

module.exports = { db, DB_FILE };
