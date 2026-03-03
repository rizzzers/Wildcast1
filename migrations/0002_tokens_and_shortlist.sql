CREATE TABLE IF NOT EXISTS user_tokens (
  user_id     TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  token_date  TEXT    NOT NULL DEFAULT (date('now'))
);

CREATE TABLE IF NOT EXISTS contact_unlocks (
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id  TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  unlocked_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, contact_id)
);

CREATE TABLE IF NOT EXISTS shortlist (
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id     TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  shortlisted_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, contact_id)
);
