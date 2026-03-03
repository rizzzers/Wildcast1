import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import crypto from 'crypto';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const user = await db
      .prepare('SELECT id, email, name, role, image, created_at FROM users WHERE id = ?')
      .bind(session.user.id)
      .first();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const submission = await db
      .prepare('SELECT * FROM survey_submissions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1')
      .bind(session.user.id)
      .first();
    const { results: outreach } = await db
      .prepare('SELECT * FROM outreach_history WHERE user_id = ? ORDER BY sent_at DESC')
      .bind(session.user.id)
      .all();
    const emailContext = await db
      .prepare('SELECT * FROM email_context WHERE user_id = ?')
      .bind(session.user.id)
      .first();

    return NextResponse.json({ user, submission, outreach, emailContext });
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

    const body = await req.json() as {
      name?: string;
      submission?: { category?: string; audience_size?: string; listener_type?: string; tone?: string; release_frequency?: string; format?: string; primary_goal?: string; email?: string; podcast_name?: string; podcast_url?: string; description?: string; has_media_kit?: boolean };
      emailContext?: { unique_value_prop?: string; past_sponsors?: string; audience_demographics?: string; notable_guests?: string; additional_notes?: string };
    };
    const db = getDb();

    // Update user name
    if (body.name !== undefined) {
      await db
        .prepare("UPDATE users SET name = ?, updated_at = datetime('now') WHERE id = ?")
        .bind(body.name, session.user.id)
        .run();
    }

    // Update or create survey submission
    if (body.submission) {
      const s = body.submission;
      const existing = await db
        .prepare('SELECT id FROM survey_submissions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1')
        .bind(session.user.id)
        .first<{ id: string }>();

      if (existing) {
        await db
          .prepare(`
            UPDATE survey_submissions SET
              category = ?, audience_size = ?, listener_type = ?, tone = ?,
              release_frequency = ?, format = ?, primary_goal = ?,
              email = ?, podcast_name = ?, podcast_url = ?, description = ?,
              has_media_kit = ?, updated_at = datetime('now')
            WHERE id = ?
          `)
          .bind(
            s.category || null, s.audience_size || null, s.listener_type || null,
            s.tone || null, s.release_frequency || null, s.format || null,
            s.primary_goal || null, s.email || null, s.podcast_name || null,
            s.podcast_url || null, s.description || null,
            s.has_media_kit ? 1 : 0, existing.id
          )
          .run();
      } else {
        await db
          .prepare(`
            INSERT INTO survey_submissions (id, user_id, category, audience_size, listener_type, tone,
              release_frequency, format, primary_goal, email, podcast_name, podcast_url, description, has_media_kit)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            crypto.randomUUID(), session.user.id,
            s.category || null, s.audience_size || null, s.listener_type || null,
            s.tone || null, s.release_frequency || null, s.format || null,
            s.primary_goal || null, s.email || null, s.podcast_name || null,
            s.podcast_url || null, s.description || null,
            s.has_media_kit ? 1 : 0
          )
          .run();
      }
    }

    // Update email context if provided
    if (body.emailContext) {
      const ctx = body.emailContext;
      const existing = await db
        .prepare('SELECT id FROM email_context WHERE user_id = ?')
        .bind(session.user.id)
        .first<{ id: string }>();

      if (existing) {
        await db
          .prepare(`
            UPDATE email_context SET
              unique_value_prop = ?, past_sponsors = ?, audience_demographics = ?,
              notable_guests = ?, additional_notes = ?, updated_at = datetime('now')
            WHERE user_id = ?
          `)
          .bind(
            ctx.unique_value_prop || null, ctx.past_sponsors || null,
            ctx.audience_demographics || null, ctx.notable_guests || null,
            ctx.additional_notes || null, session.user.id
          )
          .run();
      } else {
        await db
          .prepare(`
            INSERT INTO email_context (id, user_id, unique_value_prop, past_sponsors, audience_demographics, notable_guests, additional_notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            crypto.randomUUID(), session.user.id,
            ctx.unique_value_prop || null, ctx.past_sponsors || null,
            ctx.audience_demographics || null, ctx.notable_guests || null,
            ctx.additional_notes || null
          )
          .run();
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
