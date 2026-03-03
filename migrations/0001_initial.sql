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
  assigned_user_id TEXT REFERENCES users(id),
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
  email_content TEXT,
  email_subject TEXT,
  sent_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ai_match_cache (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  submission_hash TEXT NOT NULL,
  scores_json TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, submission_hash)
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

CREATE TABLE IF NOT EXISTS gmail_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TEXT,
  gmail_address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
