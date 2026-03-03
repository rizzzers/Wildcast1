import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = getDb();
    const { results: users } = await db
      .prepare('SELECT id, email, name, role, plan, created_at, updated_at FROM users ORDER BY created_at DESC')
      .all();

    return NextResponse.json(users);
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, plan } = await req.json() as { userId: string; plan: string };
    if (!userId || !['free', 'pro'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const db = getDb();
    await db
      .prepare("UPDATE users SET plan = ?, updated_at = datetime('now') WHERE id = ?")
      .bind(plan, userId)
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin update plan error:', error);
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}
