import { getDb } from './db';

const DAILY_LIMITS: Record<string, number> = { free: 3, pro: 50 };

export interface TokenStatus {
  plan: string;
  dailyLimit: number;
  tokensUsed: number;
  tokensRemaining: number;
  canSpend: boolean;
}

export async function getTokenStatus(userId: string, plan: string): Promise<TokenStatus> {
  const db = getDb();
  const dailyLimit = DAILY_LIMITS[plan] ?? DAILY_LIMITS.free;

  const row = await db
    .prepare('SELECT tokens_used, token_date FROM user_tokens WHERE user_id = ?')
    .bind(userId)
    .first<{ tokens_used: number; token_date: string }>();

  const todayRow = await db
    .prepare("SELECT date('now') as today")
    .first<{ today: string }>();
  const today = todayRow?.today ?? new Date().toISOString().slice(0, 10);

  const isStale = !row || row.token_date !== today;
  const tokensUsed = isStale ? 0 : row.tokens_used;
  const tokensRemaining = Math.max(0, dailyLimit - tokensUsed);

  return { plan, dailyLimit, tokensUsed, tokensRemaining, canSpend: tokensRemaining > 0 };
}

export async function consumeToken(userId: string, plan: string): Promise<TokenStatus> {
  const db = getDb();
  const dailyLimit = DAILY_LIMITS[plan] ?? DAILY_LIMITS.free;

  await db
    .prepare(`
      INSERT INTO user_tokens (user_id, tokens_used, token_date)
      VALUES (?, 1, date('now'))
      ON CONFLICT(user_id) DO UPDATE SET
        tokens_used = CASE
          WHEN token_date = date('now') THEN tokens_used + 1
          ELSE 1
        END,
        token_date = date('now')
    `)
    .bind(userId)
    .run();

  const row = await db
    .prepare('SELECT tokens_used FROM user_tokens WHERE user_id = ?')
    .bind(userId)
    .first<{ tokens_used: number }>();

  const tokensUsed = row?.tokens_used ?? 1;
  const tokensRemaining = Math.max(0, dailyLimit - tokensUsed);
  return { plan, dailyLimit, tokensUsed, tokensRemaining, canSpend: tokensRemaining > 0 };
}

export async function checkAndConsumeToken(
  userId: string,
  plan: string,
): Promise<{ ok: boolean; status: TokenStatus }> {
  const status = await getTokenStatus(userId, plan);
  if (!status.canSpend) return { ok: false, status };
  const updated = await consumeToken(userId, plan);
  return { ok: true, status: updated };
}
