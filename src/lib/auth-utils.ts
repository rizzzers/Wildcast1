import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getDb } from './db';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createUser(email: string, name: string, passwordHash: string) {
  const db = getDb();
  const id = crypto.randomUUID();
  const role = email === process.env.ADMIN_EMAIL ? 'admin' : 'user';

  await db
    .prepare('INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)')
    .bind(id, email, name, passwordHash, role)
    .run();

  return { id, email, name, role };
}

export async function getUserByEmail(email: string) {
  const db = getDb();
  return db
    .prepare('SELECT * FROM users WHERE email = ?')
    .bind(email)
    .first() as Promise<DbUser | null>;
}

export async function getUserById(id: string) {
  const db = getDb();
  return db
    .prepare('SELECT * FROM users WHERE id = ?')
    .bind(id)
    .first() as Promise<DbUser | null>;
}

export async function linkSubmissionToUser(submissionId: string, userId: string) {
  const db = getDb();
  await db
    .prepare('UPDATE survey_submissions SET user_id = ? WHERE id = ?')
    .bind(userId, submissionId)
    .run();
}

interface DbUser {
  id: string;
  email: string;
  name: string;
  password_hash: string | null;
  google_id: string | null;
  image: string | null;
  role: string;
  plan: string;
  created_at: string;
  updated_at: string;
}
