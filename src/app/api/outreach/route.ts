import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import crypto from 'crypto';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sponsorId, brandName, contactName, contactEmail, contactRole, templateUsed } = await req.json();

    if (!sponsorId || !brandName || !contactName || !contactEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getDb();
    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO outreach_history (id, user_id, sponsor_id, brand_name, contact_name, contact_email, contact_role, template_used)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, session.user.id, sponsorId, brandName, contactName, contactEmail, contactRole || null, templateUsed || null);

    return NextResponse.json({ id });
  } catch (error) {
    console.error('Outreach tracking error:', error);
    return NextResponse.json({ error: 'Failed to track outreach' }, { status: 500 });
  }
}
