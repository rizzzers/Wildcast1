import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const user = db.prepare('SELECT id, email, name, role, image, created_at FROM users WHERE id = ?').get(session.user.id);
    const submission = db.prepare(
      'SELECT * FROM survey_submissions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
    ).get(session.user.id);

    return NextResponse.json({ user, submission });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const db = getDb();

    // Update user name if provided
    if (body.name) {
      db.prepare("UPDATE users SET name = ?, updated_at = datetime('now') WHERE id = ?")
        .run(body.name, session.user.id);
    }

    // Update survey submission if provided
    if (body.submission) {
      const s = body.submission;
      const existing = db.prepare(
        'SELECT id FROM survey_submissions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
      ).get(session.user.id) as { id: string } | undefined;

      if (existing) {
        db.prepare(`
          UPDATE survey_submissions SET
            category = ?, audience_size = ?, listener_type = ?, tone = ?,
            release_frequency = ?, format = ?, primary_goal = ?,
            email = ?, podcast_name = ?, podcast_url = ?, description = ?,
            has_media_kit = ?, updated_at = datetime('now')
          WHERE id = ?
        `).run(
          s.category || null, s.audience_size || null, s.listener_type || null,
          s.tone || null, s.release_frequency || null, s.format || null,
          s.primary_goal || null, s.email || null, s.podcast_name || null,
          s.podcast_url || null, s.description || null,
          s.has_media_kit ? 1 : 0, existing.id
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
