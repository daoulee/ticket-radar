import { readFileSync } from 'node:fs';
import { buildCatalog } from './catalog-builder.ts';
export type { CatalogEntry } from './catalog-builder.ts';

// Import only the reviewed snapshot. No arbitrary user URL fetches or crawling.
const raw = readFileSync(new URL('../../docs/official/demo-event-akmu.json', import.meta.url), 'utf8');
const priceEvidenceRaw = readFileSync(new URL('../data/akmu-price-evidence.json', import.meta.url), 'utf8');
export const catalog = buildCatalog(raw, priceEvidenceRaw);
