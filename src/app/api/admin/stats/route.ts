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

    const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
    const totalSubmissions = (db.prepare('SELECT COUNT(*) as count FROM survey_submissions').get() as { count: number }).count;
    const linkedSubmissions = (db.prepare('SELECT COUNT(*) as count FROM survey_submissions WHERE user_id IS NOT NULL').get() as { count: number }).count;
    const recentSubmissions = db.prepare(
      'SELECT s.*, u.name as user_name, u.email as user_email FROM survey_submissions s LEFT JOIN users u ON s.user_id = u.id ORDER BY s.created_at DESC LIMIT 10'
    ).all();

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
