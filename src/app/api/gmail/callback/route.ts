import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const userId = searchParams.get('state');
  const error = searchParams.get('error');

  const profileUrl = new URL('/profile', request.url);

  if (error || !code || !userId) {
    profileUrl.searchParams.set('gmail_error', '1');
    return NextResponse.redirect(profileUrl);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/gmail/callback`;

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json() as { access_token?: string; refresh_token?: string; expires_in?: number; ok?: boolean };

    if (!tokenRes.ok || !tokens.access_token) {
      console.error('Token exchange failed:', tokens);
      profileUrl.searchParams.set('gmail_error', '1');
      return NextResponse.redirect(profileUrl);
    }

    // Fetch the Gmail address for this token
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const userInfo = await userInfoRes.json() as { email?: string };
    const gmailAddress = userInfo.email ?? null;

    const expiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null;

    const db = getDb();
    const existing = await db
      .prepare('SELECT id FROM gmail_tokens WHERE user_id = ?')
      .bind(userId)
      .first();

    if (existing) {
      await db
        .prepare(`
          UPDATE gmail_tokens
          SET access_token = ?, refresh_token = COALESCE(?, refresh_token), expires_at = ?, gmail_address = ?, updated_at = datetime('now')
          WHERE user_id = ?
        `)
        .bind(tokens.access_token, tokens.refresh_token ?? null, expiresAt, gmailAddress, userId)
        .run();
    } else {
      await db
        .prepare(`
          INSERT INTO gmail_tokens (id, user_id, access_token, refresh_token, expires_at, gmail_address)
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        .bind(crypto.randomUUID(), userId, tokens.access_token, tokens.refresh_token ?? null, expiresAt, gmailAddress)
        .run();
    }

    profileUrl.searchParams.set('gmail_connected', '1');
    return NextResponse.redirect(profileUrl);
  } catch (err) {
    console.error('Gmail OAuth callback error:', err);
    profileUrl.searchParams.set('gmail_error', '1');
    return NextResponse.redirect(profileUrl);
  }
}
