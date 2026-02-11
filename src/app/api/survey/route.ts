import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      category, audienceSize, listenerType, tone,
      releaseFrequency, format, primaryGoal,
      email, podcastName, podcastUrl, description, hasMediaKit,
    } = body;

    const db = getDb();
    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO survey_submissions
        (id, category, audience_size, listener_type, tone, release_frequency, format, primary_goal, email, podcast_name, podcast_url, description, has_media_kit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      category || null,
      audienceSize || null,
      listenerType || null,
      tone || null,
      releaseFrequency || null,
      format || null,
      primaryGoal || null,
      email || null,
      podcastName || null,
      podcastUrl || null,
      description || null,
      hasMediaKit ? 1 : 0,
    );

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
    const submission = db.prepare('SELECT * FROM survey_submissions WHERE id = ?').get(id);

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Survey fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch submission' }, { status: 500 });
  }
}
