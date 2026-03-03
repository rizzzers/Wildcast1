import crypto from 'crypto';
import OpenAI from 'openai';
import { getDb } from './db';
import { QuizAnswers, PodcastInfo, EmailContext } from '@/types';
import { ContactMatch, DbContact } from './contact-matching';

export interface AIScore {
  id: string;
  score: number;
  reasons: string[];
}

const MODEL = 'gpt-4o-mini';

// --- Hashing ---

export function computeSubmissionHash(
  quizAnswers: QuizAnswers,
  podcastInfo?: PodcastInfo | null,
  emailContext?: EmailContext | null,
): string {
  const payload = JSON.stringify({
    category: quizAnswers.category,
    audienceSize: quizAnswers.audienceSize,
    listenerType: quizAnswers.listenerType,
    tone: quizAnswers.tone,
    releaseFrequency: quizAnswers.releaseFrequency,
    format: quizAnswers.format,
    primaryGoal: quizAnswers.primaryGoal,
    podcastName: podcastInfo?.podcastName ?? '',
    description: podcastInfo?.description ?? '',
    uvp: emailContext?.unique_value_prop ?? '',
    pastSponsors: emailContext?.past_sponsors ?? '',
    demographics: emailContext?.audience_demographics ?? '',
    guests: emailContext?.notable_guests ?? '',
    notes: emailContext?.additional_notes ?? '',
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

// --- Cache ---

export async function getCachedAIScores(
  userId: string,
  hash: string,
): Promise<AIScore[] | null> {
  const db = getDb();
  const row = await db
    .prepare(
      'SELECT scores_json FROM ai_match_cache WHERE user_id = ? AND submission_hash = ?',
    )
    .bind(userId, hash)
    .first<{ scores_json: string }>();

  if (!row) return null;

  try {
    return JSON.parse(row.scores_json) as AIScore[];
  } catch {
    return null;
  }
}

export async function cacheAIScores(
  userId: string,
  hash: string,
  scores: AIScore[],
  model: string,
): Promise<void> {
  const db = getDb();
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO ai_match_cache (id, user_id, submission_hash, scores_json, model)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id, submission_hash) DO UPDATE SET
         scores_json = excluded.scores_json,
         model = excluded.model,
         created_at = datetime('now')`,
    )
    .bind(id, userId, hash, JSON.stringify(scores), model)
    .run();
}

// --- Prompt & API call ---

function buildContactLines(contacts: DbContact[]): string {
  return contacts
    .map(
      (c) =>
        `${c.id}|${c.title}|${c.company}|${(c.description || '').slice(0, 120)}|${c.industries || ''}|${c.disciplines || ''}|${c.tags || ''}`,
    )
    .join('\n');
}

function buildPrompt(
  quizAnswers: QuizAnswers,
  contacts: DbContact[],
  podcastInfo?: PodcastInfo | null,
  emailContext?: EmailContext | null,
): string {
  const podcastSection = podcastInfo?.podcastName
    ? `Podcast: "${podcastInfo.podcastName}"
Description: ${podcastInfo.description || 'N/A'}
`
    : '';

  let contextSection = '';
  if (emailContext) {
    const parts: string[] = [];
    if (emailContext.unique_value_prop) parts.push(`Unique value proposition: ${emailContext.unique_value_prop}`);
    if (emailContext.past_sponsors) parts.push(`Past sponsors: ${emailContext.past_sponsors}`);
    if (emailContext.audience_demographics) parts.push(`Audience demographics: ${emailContext.audience_demographics}`);
    if (emailContext.notable_guests) parts.push(`Notable guests: ${emailContext.notable_guests}`);
    if (emailContext.additional_notes) parts.push(`Additional context: ${emailContext.additional_notes}`);
    if (parts.length > 0) {
      contextSection = parts.join('\n') + '\n';
    }
  }

  return `You are an expert podcast sponsorship matchmaker. Score each contact's relevance as a potential sponsor for this podcast.

${podcastSection}${contextSection}Category: ${quizAnswers.category || 'general'}
Audience size: ${quizAnswers.audienceSize || 'unknown'}
Listener type: ${Array.isArray(quizAnswers.listenerType) ? quizAnswers.listenerType.join(', ') : quizAnswers.listenerType || 'general'}
Tone: ${quizAnswers.tone || 'conversational'}
Format: ${quizAnswers.format || 'interview'}
Release frequency: ${quizAnswers.releaseFrequency || 'weekly'}

Contacts (id|title|company|description|industries|tags):
${buildContactLines(contacts)}

Scoring rubric (0-100):
- Audience-brand alignment: 40 pts (does the brand's target customer match the podcast listeners?)
- Category-industry fit: 35 pts (does the brand's industry relate to the podcast category?)
- Podcast ad history: 25 pts (does the contact have podcast sponsorship/advertising experience?)

Return ONLY valid JSON, no markdown:
{"scores":[{"id":"c001","score":85,"reasons":["reason1","reason2"]}]}

Score ALL contacts. Each reasons array should have 1-3 short reasons.`;
}

export async function scoreContactsWithAI(
  quizAnswers: QuizAnswers,
  contacts: DbContact[],
  podcastInfo?: PodcastInfo | null,
  emailContext?: EmailContext | null,
): Promise<AIScore[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const openai = new OpenAI({ apiKey });
  const prompt = buildPrompt(quizAnswers, contacts, podcastInfo, emailContext);

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 8000,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenAI');

  const parsed = JSON.parse(content) as { scores: AIScore[] };
  if (!Array.isArray(parsed.scores)) throw new Error('Invalid response shape');

  return parsed.scores.filter(
    (s) =>
      typeof s.id === 'string' &&
      typeof s.score === 'number' &&
      Array.isArray(s.reasons),
  );
}

// --- Merge ---

export function mergeAIScoresIntoMatches(
  keywordMatches: ContactMatch[],
  aiScores: AIScore[],
): ContactMatch[] {
  const scoreMap = new Map(aiScores.map((s) => [s.id, s]));

  const merged = keywordMatches.map((match) => {
    const ai = scoreMap.get(match.id);
    if (!ai) return match;
    return {
      ...match,
      matchScore: ai.score,
      matchReasons: ai.reasons.length > 0 ? ai.reasons : match.matchReasons,
    };
  });

  return merged.sort((a, b) => b.matchScore - a.matchScore);
}

// --- Fire-and-forget trigger ---

export function triggerAIScoring(
  userId: string,
  quizAnswers: QuizAnswers,
  contacts: DbContact[],
  podcastInfo?: PodcastInfo | null,
  emailContext?: EmailContext | null,
): void {
  const hash = computeSubmissionHash(quizAnswers, podcastInfo, emailContext);

  // Fire and forget — check cache then score
  getCachedAIScores(userId, hash)
    .then((cached) => {
      if (cached) return; // Already cached — skip
      return scoreContactsWithAI(quizAnswers, contacts, podcastInfo, emailContext)
        .then((scores) => {
          return cacheAIScores(userId, hash, scores, MODEL).then(() => {
            console.log(
              `[ai-matching] Cached ${scores.length} AI scores for user ${userId}`,
            );
          });
        });
    })
    .catch((err) => {
      console.error('[ai-matching] AI scoring failed:', err);
    });
}
