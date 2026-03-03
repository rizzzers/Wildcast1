import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const {
      category, audienceSize, listenerType, tone,
      releaseFrequency, format, primaryGoal,
      email, podcastName, podcastUrl, description, hasMediaKit,
    } = await req.json() as {
      category?: string; audienceSize?: string; listenerType?: string | string[];
      tone?: string; releaseFrequency?: string; format?: string; primaryGoal?: string;
      email?: string; podcastName?: string; podcastUrl?: string; description?: string; hasMediaKit?: boolean;
    };

    const db = getDb();
    const id = crypto.randomUUID();

    await db
      .prepare(`
        INSERT INTO survey_submissions
          (id, category, audience_size, listener_type, tone, release_frequency, format, primary_goal, email, podcast_name, podcast_url, description, has_media_kit)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id,
        category || null,
        audienceSize || null,
        Array.isArray(listenerType) ? listenerType.join(',') : (listenerType || null),
        tone || null,
        releaseFrequency || null,
        format || null,
        primaryGoal || null,
        email || null,
        podcastName || null,
        podcastUrl || null,
        description || null,
        hasMediaKit ? 1 : 0,
      )
      .run();

    return NextResponse.json({ id });
  } catch (error) {
    console.error('Survey submission error:', error);
    return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Submission ID required' }, { status: 400 });
    }

    const db = getDb();
    const submission = await db
      .prepare('SELECT * FROM survey_submissions WHERE id = ?')
      .bind(id)
      .first();

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Survey fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch submission' }, { status: 500 });
  }
}
