import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDb } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const userId = session.user.id;

  const { results: rows } = await db
    .prepare(`
      SELECT
        c.id, c.first_name, c.last_name, c.title, c.company,
        c.email, c.phone, c.linkedin, c.website, c.description, c.industries, c.tags,
        CASE WHEN cu.contact_id IS NOT NULL THEN 1 ELSE 0 END as is_unlocked,
        s.shortlisted_at
      FROM shortlist s
      JOIN contacts c ON c.id = s.contact_id
      LEFT JOIN contact_unlocks cu ON cu.user_id = ? AND cu.contact_id = s.contact_id
      WHERE s.user_id = ?
      ORDER BY s.shortlisted_at DESC
    `)
    .bind(userId, userId)
    .all<{
      id: string; first_name: string; last_name: string; title: string; company: string;
      email: string | null; phone: string | null; linkedin: string | null;
      website: string | null; description: string | null; industries: string | null; tags: string | null;
      is_unlocked: number; shortlisted_at: string;
    }>();

  const contacts = rows.map(row => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    title: row.title,
    company: row.company,
    email: row.is_unlocked ? row.email : null,
    phone: row.is_unlocked ? row.phone : null,
    linkedin: row.is_unlocked ? row.linkedin : null,
    website: row.website,
    description: row.description,
    industries: row.industries,
    tags: row.tags,
    isUnlocked: row.is_unlocked === 1,
    isShortlisted: true,
    shortlistedAt: row.shortlisted_at,
  }));

  return NextResponse.json({ contacts });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { contactId } = await req.json() as { contactId: string };
  if (!contactId) return NextResponse.json({ error: 'contactId required' }, { status: 400 });

  const db = getDb();
  await db
    .prepare('INSERT OR IGNORE INTO shortlist (user_id, contact_id) VALUES (?, ?)')
    .bind(session.user.id, contactId)
    .run();

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { contactId } = await req.json() as { contactId: string };
  if (!contactId) return NextResponse.json({ error: 'contactId required' }, { status: 400 });

  const db = getDb();
  await db
    .prepare('DELETE FROM shortlist WHERE user_id = ? AND contact_id = ?')
    .bind(session.user.id, contactId)
    .run();

  return NextResponse.json({ success: true });
}
