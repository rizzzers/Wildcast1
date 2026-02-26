import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDb } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const row = db.prepare('SELECT gmail_address FROM gmail_tokens WHERE user_id = ?').get(session.user.id) as { gmail_address: string | null } | undefined;

  return NextResponse.json({
    connected: !!row,
    email: row?.gmail_address ?? null,
  });
}
