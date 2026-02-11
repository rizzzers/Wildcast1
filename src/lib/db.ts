import Database from 'better-sqlite3';
import path from 'path';
import { contactsSeed } from '@/data/contacts-seed';

const DB_PATH = path.join(process.cwd(), 'wildcast.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
    migrate(db);
    seedContacts(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      password_hash TEXT,
      google_id TEXT UNIQUE,
      image TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      plan TEXT NOT NULL DEFAULT 'free',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS survey_submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      category TEXT,
      audience_size TEXT,
      listener_type TEXT,
      tone TEXT,
      release_frequency TEXT,
      format TEXT,
      primary_goal TEXT,
      email TEXT,
      podcast_name TEXT,
      podcast_url TEXT,
      description TEXT,
      has_media_kit INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      title TEXT,
      company TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      description TEXT,
      industries TEXT,
      linkedin TEXT,
      website TEXT,
      tags TEXT,
      region TEXT,
      city TEXT,
      state TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS outreach_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      sponsor_id TEXT NOT NULL,
      brand_name TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      contact_role TEXT,
      template_used TEXT,
      sent_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS email_context (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id),
      unique_value_prop TEXT,
      past_sponsors TEXT,
      audience_demographics TEXT,
      notable_guests TEXT,
      additional_notes TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function migrate(db: Database.Database) {
  // Add plan column if it doesn't exist (for existing databases)
  const cols = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  if (!cols.some((c) => c.name === 'plan')) {
    db.exec("ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free'");
  }
}

function seedContacts(db: Database.Database) {
  const count = (db.prepare('SELECT COUNT(*) as count FROM contacts').get() as { count: number }).count;
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO contacts (id, first_name, last_name, title, company, email, phone, description, industries, linkedin, website, tags, region, city, state)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((contacts: typeof contactsSeed) => {
    for (const c of contacts) {
      insert.run(c.id, c.firstName, c.lastName, c.title, c.company, c.email, c.phone, c.description, c.industries, c.linkedin, c.website, c.tags, c.region, c.city, c.state);
    }
  });

  insertMany(contactsSeed);
}
