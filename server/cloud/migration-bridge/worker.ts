import { timingSafeEqual } from 'node:crypto';

type Env = { MIGRATION: { importSnapshot(raw: string): Promise<unknown>; inspectSnapshot(): Promise<unknown> }; MIGRATION_TOKEN?: string };
const MAX_BYTES = 1_500_000;

// Local development only: no public route or workers.dev deployment is configured.
export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    if (url.hostname !== '127.0.0.1' || !((url.pathname === '/migrate' && request.method === 'POST') || (url.pathname === '/verify' && request.method === 'GET')) || request.headers.has('Origin')) return new Response('Not found', { status: 404 });
    const expected = env.MIGRATION_TOKEN ?? '';
    const authorization = request.headers.get('Authorization') ?? '';
    const presented = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    if (!/^[A-Za-z0-9_-]{43,128}$/.test(expected) || !/^[A-Za-z0-9_-]{43,128}$/.test(presented) || expected.length !== presented.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(presented))) return new Response('Unauthorized', { status: 401 });
    if (url.pathname === '/verify') {
      try { return Response.json({ summary: await env.MIGRATION.inspectSnapshot() }, { headers: { 'Cache-Control': 'no-store' } }); }
      catch { return new Response('Verification failed', { status: 503, headers: { 'Cache-Control': 'no-store' } }); }
    }
    const reader = request.body?.getReader();
    if (!reader) return new Response('Bad request', { status: 400 });
    const chunks: Uint8Array[] = []; let total = 0;
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES) { await reader.cancel(); return new Response('Too large', { status: 413 }); }
      chunks.push(value);
    }
    const body = new Uint8Array(total); let offset = 0;
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
    try {
      const result = await env.MIGRATION.importSnapshot(new TextDecoder('utf-8', { fatal: true }).decode(body));
      return Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
    } catch { return new Response('Migration failed', { status: 409, headers: { 'Cache-Control': 'no-store' } }); }
  },
};
