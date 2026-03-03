import { NextResponse } from 'next/server';
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

    const totalUsersRow = await db
      .prepare('SELECT COUNT(*) as count FROM users')
      .first<{ count: number }>();
    const totalUsers = totalUsersRow?.count ?? 0;

    const totalSubmissionsRow = await db
      .prepare('SELECT COUNT(*) as count FROM survey_submissions')
      .first<{ count: number }>();
    const totalSubmissions = totalSubmissionsRow?.count ?? 0;

    const linkedSubmissionsRow = await db
      .prepare('SELECT COUNT(*) as count FROM survey_submissions WHERE user_id IS NOT NULL')
      .first<{ count: number }>();
    const linkedSubmissions = linkedSubmissionsRow?.count ?? 0;

    const { results: recentSubmissions } = await db
      .prepare(
        'SELECT s.*, u.name as user_name, u.email as user_email FROM survey_submissions s LEFT JOIN users u ON s.user_id = u.id ORDER BY s.created_at DESC LIMIT 10'
      )
      .all();

    return NextResponse.json({
      totalUsers,
      totalSubmissions,
      linkedSubmissions,
      recentSubmissions,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
