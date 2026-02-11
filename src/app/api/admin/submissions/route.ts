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
    const submissions = db.prepare(
      'SELECT s.*, u.name as user_name, u.email as user_email FROM survey_submissions s LEFT JOIN users u ON s.user_id = u.id ORDER BY s.created_at DESC'
    ).all();

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Admin submissions error:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}
