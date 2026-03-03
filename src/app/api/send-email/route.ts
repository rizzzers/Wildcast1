import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import crypto from 'crypto';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDb } from '@/lib/db';

interface GmailTokenRow {
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
  gmail_address: string | null;
}

async function getValidAccessToken(userId: string): Promise<{ accessToken: string; gmailAddress: string | null } | null> {
  const db = getDb();
  const row = await db
    .prepare('SELECT access_token, refresh_token, expires_at, gmail_address FROM gmail_tokens WHERE user_id = ?')
    .bind(userId)
    .first<GmailTokenRow>();

  if (!row) return null;

  // Check if token is still valid (with 60s buffer)
  const isExpired = row.expires_at
    ? new Date(row.expires_at).getTime() - 60_000 < Date.now()
    : false;

  if (!isExpired) {
    return { accessToken: row.access_token, gmailAddress: row.gmail_address };
  }

  // Token expired — refresh it
  if (!row.refresh_token) return null;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: row.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  const refreshed = await tokenRes.json() as { access_token?: string; expires_in?: number };
  if (!tokenRes.ok || !refreshed.access_token) return null;

  const newExpiresAt = refreshed.expires_in
    ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
    : null;

  await db
    .prepare(`UPDATE gmail_tokens SET access_token = ?, expires_at = ?, updated_at = datetime('now') WHERE user_id = ?`)
    .bind(refreshed.access_token, newExpiresAt, userId)
    .run();

  return { accessToken: refreshed.access_token, gmailAddress: row.gmail_address };
}

function buildRawEmail(to: string, from: string, subject: string, body: string): string {
  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=UTF-8',
    '',
    body,
  ].join('\r\n');

  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

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
  } = await request.json() as { to: string; subject: string; body: string; sponsorId: string; brandName: string; contactName: string; contactRole?: string; templateUsed?: string };

  if (!to || !subject || !body) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const tokenData = await getValidAccessToken(session.user.id);
  if (!tokenData) {
    return NextResponse.json({ error: 'gmail_not_connected' }, { status: 403 });
  }

  const { accessToken, gmailAddress } = tokenData;
  const senderName = session.user.name || gmailAddress || 'Wildcast User';
  const fromAddress = gmailAddress ?? session.user.email ?? '';
  const rawEmail = buildRawEmail(to, `${senderName} <${fromAddress}>`, subject, body);

  const gmailRes = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: rawEmail }),
    }
  );

  if (!gmailRes.ok) {
    const err = await gmailRes.json();
    console.error('Gmail send error:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  // Track in outreach_history
  try {
    const db = getDb();
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
