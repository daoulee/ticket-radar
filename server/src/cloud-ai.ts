import { ApiError } from './errors.ts';
import { GeminiProvider, type ExtractionProvider } from './extraction.ts';

export type CloudAiEnvironment = { EXTRACTION_PROVIDER?: string; GEMINI_API_KEY?: string; AI_MODEL?: string; AI_FALLBACK_MODELS?: string };

/** Explicit opt-in only. No fixture or alternate provider is used on failure. */
export function cloudAiProvider(env: CloudAiEnvironment, upstream: typeof fetch = fetch): ExtractionProvider | null {
  const provider = env.EXTRACTION_PROVIDER?.trim() || 'none';
  if (provider === 'none') return null;
  if (provider !== 'gemini') throw new ApiError('INVALID_AI_CONFIG', '지원하는 AI 제공자를 확인해 주세요.', 500);
  const fallbacks = (env.AI_FALLBACK_MODELS ?? '').split(',').map(value => value.trim()).filter(Boolean);
  return new GeminiProvider(env.AI_MODEL?.trim() || 'gemini-3.1-flash-lite', env.GEMINI_API_KEY, upstream, 800, fallbacks);
}
