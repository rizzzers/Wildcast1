import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDb } from '@/lib/db';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const row = db.prepare('SELECT access_token FROM gmail_tokens WHERE user_id = ?').get(session.user.id) as { access_token: string } | undefined;

  if (row?.access_token) {
    // Best-effort token revocation
    fetch(`https://oauth2.googleapis.com/revoke?token=${row.access_token}`, { method: 'POST' }).catch(() => {});
  }

  db.prepare('DELETE FROM gmail_tokens WHERE user_id = ?').run(session.user.id);

  return NextResponse.json({ success: true });
}
