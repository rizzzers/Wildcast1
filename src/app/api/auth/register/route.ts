import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, createUser, getUserByEmail, linkSubmissionToUser } from '@/lib/auth-utils';

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

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
