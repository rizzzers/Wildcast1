import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { matchContacts } from '@/lib/contact-matching';
import { getDb } from '@/lib/db';
import { QuizAnswers } from '@/types';

const FREE_LIMIT = 13;

export async function POST(req: NextRequest) {
  try {
    const quizAnswers: QuizAnswers = await req.json();
    const matches = matchContacts(quizAnswers);

    // Check user plan to determine limit
    const session = await getServerSession(authOptions);
    let plan = 'free';
    if (session?.user?.id) {
      const db = getDb();
      const user = db.prepare('SELECT plan FROM users WHERE id = ?').get(session.user.id) as { plan: string } | undefined;
      if (user) plan = user.plan;
    }

    const limited = plan === 'free';
    const results = limited ? matches.slice(0, FREE_LIMIT) : matches;

    return NextResponse.json({
      matches: results,
      total: matches.length,
      limited,
    });
  } catch (error) {
    console.error('Contact matching error:', error);
    return NextResponse.json({ error: 'Failed to match contacts' }, { status: 500 });
  }
}
