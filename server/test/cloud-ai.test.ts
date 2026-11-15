import test from 'node:test';
import assert from 'node:assert/strict';
import { cloudAiProvider } from '../src/cloud-ai.ts';
import { CheckService } from '../src/service.ts';
import { ApiError } from '../src/errors.ts';
import { entry, listing, sampleExtraction } from './helpers.ts';

const hasCode = (code: string) => (error: unknown) => error instanceof ApiError && error.code === code;

test('cloud AI is disabled by default and rejects invalid or incomplete configuration', () => {
  assert.equal(cloudAiProvider({}), null);
  assert.equal(cloudAiProvider({ EXTRACTION_PROVIDER: 'none' }), null);
  assert.throws(() => cloudAiProvider({ EXTRACTION_PROVIDER: 'gemini' }), hasCode('INVALID_AI_CONFIG'));
  assert.throws(() => cloudAiProvider({ EXTRACTION_PROVIDER: 'other', GEMINI_API_KEY: 'synthetic' }), hasCode('INVALID_AI_CONFIG'));
});

test('cloud Gemini adapter uses only configured key and reports a grounded model extraction', async () => {
  let calls = 0;
  const fake: typeof fetch = async (url, init) => {
    calls++;
    assert.ok(!String(url).includes('synthetic-key'));
    assert.equal(new Headers(init?.headers).get('x-goog-api-key'), 'synthetic-key');
    return Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(sampleExtraction()) }] } }] });
  };
  const provider = cloudAiProvider({ EXTRACTION_PROVIDER: 'gemini', GEMINI_API_KEY: 'synthetic-key' }, fake);
  const result = await new CheckService(provider, [entry]).check({ eventId: entry.event.id, listingText: listing });
  assert.equal(calls, 1); assert.equal(result.extraction.provider, 'gemini'); assert.equal(result.extraction.actualModelCall, true);
});
