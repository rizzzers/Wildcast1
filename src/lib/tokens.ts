import { getDb } from './db';

const DAILY_LIMITS: Record<string, number> = { free: 3, pro: 50 };

export interface TokenStatus {
  plan: string;
  dailyLimit: number;
  tokensUsed: number;
  tokensRemaining: number;
  bonusTokens: number;
  canSpend: boolean;
}

export async function getTokenStatus(userId: string, plan: string): Promise<TokenStatus> {
  const db = getDb();
  const dailyLimit = DAILY_LIMITS[plan] ?? DAILY_LIMITS.free;

  const row = await db
    .prepare('SELECT tokens_used, token_date, bonus_tokens FROM user_tokens WHERE user_id = ?')
    .bind(userId)
    .first<{ tokens_used: number; token_date: string; bonus_tokens: number }>();

  const todayRow = await db
    .prepare("SELECT date('now') as today")
    .first<{ today: string }>();
  const today = todayRow?.today ?? new Date().toISOString().slice(0, 10);

  const isStale = !row || row.token_date !== today;
  const tokensUsed = isStale ? 0 : row.tokens_used;
  const bonusTokens = row?.bonus_tokens ?? 0;
  const dailyRemaining = Math.max(0, dailyLimit - tokensUsed);
  const tokensRemaining = dailyRemaining + bonusTokens;

  return { plan, dailyLimit, tokensUsed, tokensRemaining, bonusTokens, canSpend: tokensRemaining > 0 };
}

export async function consumeToken(userId: string, plan: string): Promise<TokenStatus> {
  const db = getDb();
  const dailyLimit = DAILY_LIMITS[plan] ?? DAILY_LIMITS.free;

  const status = await getTokenStatus(userId, plan);
  const dailyRemaining = Math.max(0, dailyLimit - status.tokensUsed);

  if (dailyRemaining > 0) {
    // Use a daily token
    await db
      .prepare(`
        INSERT INTO user_tokens (user_id, tokens_used, token_date, bonus_tokens)
        VALUES (?, 1, date('now'), 0)
        ON CONFLICT(user_id) DO UPDATE SET
          tokens_used = CASE
            WHEN token_date = date('now') THEN tokens_used + 1
            ELSE 1
          END,
          token_date = date('now')
      `)
      .bind(userId)
      .run();
  } else if (status.bonusTokens > 0) {
    // Daily exhausted — consume from bonus pool
    await db
      .prepare('UPDATE user_tokens SET bonus_tokens = MAX(0, bonus_tokens - 1) WHERE user_id = ?')
      .bind(userId)
      .run();
  }

  return getTokenStatus(userId, plan);
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
