import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDb } from '@/lib/db';
import { checkAndConsumeToken, getTokenStatus } from '@/lib/tokens';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { contactId } = await req.json() as { contactId: string };
  if (!contactId) {
    return NextResponse.json({ error: 'contactId required' }, { status: 400 });
  }

  const db = getDb();

  // Get user plan/role
  const user = await db
    .prepare('SELECT plan, role FROM users WHERE id = ?')
    .bind(session.user.id)
    .first<{ plan: string; role: string }>();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Check if already unlocked (idempotent — no charge)
  const existing = await db
    .prepare('SELECT 1 FROM contact_unlocks WHERE user_id = ? AND contact_id = ?')
    .bind(session.user.id, contactId)
    .first();

  if (!existing) {
    if (user.role !== 'admin') {
      const { ok, status } = await checkAndConsumeToken(session.user.id, user.plan);
      if (!ok) {
        return NextResponse.json({ error: 'insufficient_tokens', tokensRemaining: 0, status }, { status: 402 });
      }
    }
    await db
      .prepare('INSERT OR IGNORE INTO contact_unlocks (user_id, contact_id) VALUES (?, ?)')
      .bind(session.user.id, contactId)
      .run();
  }

  // Return full contact data
  const contact = await db
    .prepare('SELECT email, phone, linkedin FROM contacts WHERE id = ?')
    .bind(contactId)
    .first<{ email: string | null; phone: string | null; linkedin: string | null }>();

  if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });

  const tokenStatus = await getTokenStatus(session.user.id, user.plan);

  return NextResponse.json({
    contact: { email: contact.email, phone: contact.phone, linkedin: contact.linkedin },
    tokensRemaining: tokenStatus.tokensRemaining,
  });
}
