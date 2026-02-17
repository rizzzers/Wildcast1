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

    // Per-contact tally: how many emails sent to each contact
    const contactTallies = db.prepare(`
      SELECT
        contact_email,
        contact_name,
        brand_name,
        contact_role,
        COUNT(*) as email_count,
        MAX(sent_at) as last_sent_at
      FROM outreach_history
      GROUP BY contact_email
      ORDER BY email_count DESC, last_sent_at DESC
    `).all();

    // All outreach records with user info
    const outreachDetails = db.prepare(`
      SELECT
        o.id,
        o.contact_email,
        o.contact_name,
        o.brand_name,
        o.contact_role,
        o.template_used,
        o.email_subject,
        o.email_content,
        o.sent_at,
        u.name as user_name,
        u.email as user_email
      FROM outreach_history o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.sent_at DESC
    `).all();

    return NextResponse.json({ contactTallies, outreachDetails });
  } catch (error) {
    console.error('Admin outreach error:', error);
    return NextResponse.json({ error: 'Failed to fetch outreach data' }, { status: 500 });
  }
}
