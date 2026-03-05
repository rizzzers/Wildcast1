import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import crypto from 'crypto';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDb } from '@/lib/db';
import { checkAndConsumeToken } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const {
    to,
    subject,
    body,
    sponsorId,
    brandName,
    contactName,
    contactRole,
    templateUsed,
  } = await request.json() as {
    to: string; subject: string; body: string;
    sponsorId: string; brandName: string; contactName: string;
    contactRole?: string; templateUsed?: string;
  };

  if (!to || !subject || !body) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Consume a send token (admins bypass)
  const db = getDb();
  const userRow = await db
    .prepare('SELECT plan, role, name, email FROM users WHERE id = ?')
    .bind(session.user.id)
    .first<{ plan: string; role: string; name: string | null; email: string }>();

  if (!userRow) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (userRow.role !== 'admin') {
    const { ok } = await checkAndConsumeToken(session.user.id, userRow.plan);
    if (!ok) {
      return NextResponse.json({ error: 'insufficient_tokens' }, { status: 402 });
    }
  }

  const senderName = userRow.name || session.user.name || 'Howdi User';
  const replyTo = userRow.email || session.user.email || '';

  // Send via Resend
  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${senderName} via Howdi <outreach@gethowdi.com>`,
      to: [to],
      reply_to: replyTo,
      subject,
      text: body,
    }),
  });

  if (!resendRes.ok) {
    const err = await resendRes.json();
    console.error('Resend error:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  // Track in outreach_history
  try {
    await db
      .prepare(`
        INSERT INTO outreach_history
          (id, user_id, sponsor_id, brand_name, contact_name, contact_email, contact_role, template_used, email_subject, email_content)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        crypto.randomUUID(),
        session.user.id,
        sponsorId,
        brandName,
        contactName,
        to,
        contactRole ?? null,
        templateUsed ?? null,
        subject,
        body,
      )
      .run();
  } catch (dbError) {
    console.error('Failed to track outreach:', dbError);
  }

  return NextResponse.json({ success: true });
}
