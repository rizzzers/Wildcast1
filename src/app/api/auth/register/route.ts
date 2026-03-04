import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, createUser, getUserByEmail, linkSubmissionToUser } from '@/lib/auth-utils';

async function notifyNewUser(name: string, email: string, method: string) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Howdi <notifications@gethowdi.com>',
        to: 'ryan@ryanestes.info',
        subject: `New user signed up — ${name || email}`,
        html: `
          <h2>New Howdi User</h2>
          <p><strong>Name:</strong> ${name || '(not provided)'}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Sign-up method:</strong> ${method}</p>
          <p><strong>Time:</strong> ${new Date().toUTCString()}</p>
        `,
      }),
    });
  } catch {
    // Non-critical — don't block registration
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, submissionId } = await req.json() as { email: string; password: string; name: string; submissionId?: string };

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser(email, name, passwordHash);

    if (submissionId) {
      await linkSubmissionToUser(submissionId, user.id);
    }

    void notifyNewUser(name, email, 'email/password');

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
