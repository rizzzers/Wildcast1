import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getDb } from './db';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createUser(email: string, name: string, passwordHash: string) {
  const db = getDb();
  const id = crypto.randomUUID();
  const role = email === process.env.ADMIN_EMAIL ? 'admin' : 'user';

  const stmt = db.prepare(
    'INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)'
  );
  stmt.run(id, email, name, passwordHash, role);

  return { id, email, name, role };
}

export function getUserByEmail(email: string) {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as DbUser | undefined;
}

export function getUserById(id: string) {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as DbUser | undefined;
}

export function linkSubmissionToUser(submissionId: string, userId: string) {
  const db = getDb();
  db.prepare('UPDATE survey_submissions SET user_id = ? WHERE id = ?').run(userId, submissionId);
}

interface DbUser {
  id: string;
  email: string;
  name: string;
  password_hash: string | null;
  google_id: string | null;
  image: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}
