import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDb } from '@/lib/db';
import { getTokenStatus } from '@/lib/tokens';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const db = getDb();
  const user = await db
    .prepare('SELECT plan FROM users WHERE id = ?')
    .bind(session.user.id)
    .first<{ plan: string }>();
  const plan = user?.plan ?? 'free';
  const status = await getTokenStatus(session.user.id, plan);
  return NextResponse.json(status);
}
