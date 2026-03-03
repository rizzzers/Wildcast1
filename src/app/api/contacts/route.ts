import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { matchContacts } from '@/lib/contact-matching';
import { getDb } from '@/lib/db';
import { QuizAnswers, PodcastInfo, EmailContext } from '@/types';
import {
  computeSubmissionHash,
  getCachedAIScores,
  cacheAIScores,
  scoreContactsWithAI,
  mergeAIScoresIntoMatches,
} from '@/lib/ai-matching';
import { DbContact } from '@/lib/contact-matching';

const FREE_LIMIT = 13;
// Only send top N keyword matches to AI — keeps latency and cost low
const AI_CANDIDATE_LIMIT = 150;
// Minimum AI score to appear in results — filters out weak matches
const SCORE_THRESHOLD = 40;
// OpenAI model used for scoring (must match what's cached)
const AI_MODEL = 'gpt-4o-mini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { quizAnswers?: QuizAnswers; podcastInfo?: PodcastInfo; emailContext?: EmailContext } & QuizAnswers;

    // Backward compat: body can be plain QuizAnswers or { quizAnswers, podcastInfo, emailContext }
    let quizAnswers: QuizAnswers;
    let podcastInfo: PodcastInfo | undefined;
    let bodyEmailContext: EmailContext | undefined;
    if (body.quizAnswers) {
      quizAnswers = body.quizAnswers;
      podcastInfo = body.podcastInfo;
      bodyEmailContext = body.emailContext ?? undefined;
    } else {
      quizAnswers = body;
    }

    // Always run keyword matching first (instant)
    const matches = await matchContacts(quizAnswers);

    // Check user plan to determine limit
    const session = await getServerSession(authOptions);
    let plan = 'free';
    let role = 'user';
    let userId: string | undefined;
    if (session?.user?.id) {
      userId = session.user.id;
      const db = getDb();
      const user = await db
        .prepare('SELECT plan, role FROM users WHERE id = ?')
        .bind(userId)
        .first<{ plan: string; role: string }>();
      if (user) {
        plan = user.plan;
        role = user.role;
      }
    }

    const limited = plan === 'free' && role !== 'admin';
    let results = matches;
    let scoringMethod = 'keyword';

    // AI scoring: run for all users (authenticated or anonymous) when API key is set
    if (process.env.OPENAI_API_KEY && matches.length > 0) {
      // Load email context for authenticated users
      let emailContext: EmailContext | undefined = bodyEmailContext;
      if (!emailContext && userId) {
        const dbCtx = getDb();
        const row = await dbCtx
          .prepare(
            'SELECT unique_value_prop, past_sponsors, audience_demographics, notable_guests, additional_notes FROM email_context WHERE user_id = ?'
          )
          .bind(userId)
          .first<EmailContext>();
        emailContext = row ?? undefined;
      }

      // Anonymous users share a cache keyed by 'anon' + quiz hash
      const cacheUserId = userId ?? 'anon';
      const hash = computeSubmissionHash(quizAnswers, podcastInfo, emailContext);
      const cached = await getCachedAIScores(cacheUserId, hash);

      if (cached) {
        const merged = mergeAIScoresIntoMatches(matches, cached);
        results = merged.filter(c => c.matchScore >= SCORE_THRESHOLD);
        scoringMethod = 'ai-cached';
      } else {
        // Fetch DB rows for only the top keyword-matched contacts to keep AI call fast
        const topMatchIds = matches.slice(0, AI_CANDIDATE_LIMIT).map(m => m.id);
        const placeholders = topMatchIds.map(() => '?').join(',');
        const dbAi = getDb();
        const { results: aiCandidates } = await dbAi
          .prepare(`SELECT * FROM contacts WHERE id IN (${placeholders})`)
          .bind(...topMatchIds)
          .all<DbContact>();

        const aiScores = await scoreContactsWithAI(quizAnswers, aiCandidates, podcastInfo, emailContext);
        await cacheAIScores(cacheUserId, hash, aiScores, AI_MODEL);

        const merged = mergeAIScoresIntoMatches(matches, aiScores);
        results = merged.filter(c => c.matchScore >= SCORE_THRESHOLD);
        scoringMethod = 'ai-fresh';
      }
    }

    // Apply free-tier limit after scoring + threshold
    if (limited) results = results.slice(0, FREE_LIMIT);

    // Redact contact details for non-unlocked contacts (server-side)
    if (role === 'admin') {
      results = results.map(c => ({ ...c, isUnlocked: true, isShortlisted: false }));
    } else if (userId && results.length > 0) {
      const contactIds = results.map(c => c.id);
      const placeholders = contactIds.map(() => '?').join(',');
      const dbRedact = getDb();

      const { results: unlockRows } = await dbRedact
        .prepare(`SELECT contact_id FROM contact_unlocks WHERE user_id = ? AND contact_id IN (${placeholders})`)
        .bind(userId, ...contactIds)
        .all<{ contact_id: string }>();
      const unlockedSet = new Set(unlockRows.map(r => r.contact_id));

      const { results: shortlistRows } = await dbRedact
        .prepare(`SELECT contact_id FROM shortlist WHERE user_id = ? AND contact_id IN (${placeholders})`)
        .bind(userId, ...contactIds)
        .all<{ contact_id: string }>();
      const shortlistedSet = new Set(shortlistRows.map(r => r.contact_id));

      results = results.map(c => ({
        ...c,
        email:         unlockedSet.has(c.id) ? c.email    : null,
        phone:         unlockedSet.has(c.id) ? c.phone    : null,
        linkedin:      unlockedSet.has(c.id) ? c.linkedin : null,
        isUnlocked:    unlockedSet.has(c.id),
        isShortlisted: shortlistedSet.has(c.id),
      }));
    } else {
      // Unauthenticated: redact all contact details
      results = results.map(c => ({
        ...c,
        email: null, phone: null, linkedin: null,
        isUnlocked: false, isShortlisted: false,
      }));
    }

    return NextResponse.json({
      matches: results,
      total: matches.length,
      limited,
      scoringMethod,
    });
  } catch (error) {
    console.error('Contact matching error:', error);
    return NextResponse.json({ error: 'Failed to match contacts' }, { status: 500 });
  }
}
