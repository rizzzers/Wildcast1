import { NextRequest, NextResponse } from 'next/server';
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

    const contacts = db.prepare(`
      SELECT
        c.*,
        u.name as assigned_user_name,
        u.email as assigned_user_email
      FROM contacts c
      LEFT JOIN users u ON c.assigned_user_id = u.id
      ORDER BY c.company ASC, c.last_name ASC
    `).all();

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Admin contacts error:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { contactId, assignedUserId } = await req.json();

    if (!contactId) {
      return NextResponse.json({ error: 'Missing contactId' }, { status: 400 });
    }

    const db = getDb();

    // Allow null to unassign
    db.prepare('UPDATE contacts SET assigned_user_id = ? WHERE id = ?')
      .run(assignedUserId || null, contactId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin contacts assign error:', error);
    return NextResponse.json({ error: 'Failed to assign contact' }, { status: 500 });
  }
}
