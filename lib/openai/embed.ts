import { logger } from '@/lib/logger';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIM = 1536;

export interface EmbedResult {
  embedding: number[];
  model: string;
  dim: number;
}

/**
 * Calls OpenAI embeddings. Returns null when OPENAI_API_KEY is absent, so callers can
 * fall back to recency-only ranking without blowing up Phase 1 (key arrives in Phase 3).
 */
export async function embedText(input: string): Promise<EmbedResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    logger.debug('OPENAI_API_KEY not set — skipping embedding call');
    return null;
  }
  if (!input.trim()) return null;

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    logger.error({ status: res.status, body: body.slice(0, 500) }, 'openai embed failed');
    return null;
  }

  const json = (await res.json()) as {
    data?: { embedding: number[] }[];
  };
  const embedding = json.data?.[0]?.embedding;
  if (!embedding || embedding.length !== EMBEDDING_DIM) {
    logger.error({ length: embedding?.length }, 'openai returned unexpected embedding shape');
    return null;
  }

  return { embedding, model: EMBEDDING_MODEL, dim: EMBEDDING_DIM };
}

export const EMBEDDING_INFO = { model: EMBEDDING_MODEL, dim: EMBEDDING_DIM };
