import { createHash } from 'node:crypto';
import { MarketService, type MarketPersistence } from './market.ts';
import { normalizeEmail } from './email-identity.ts';

// No networking or file operations: caller controls source and atomic target.
// A target must remain exclusively locked between its read and write.
const MAX_BYTES = 1_500_000;
type Row = Record<string, unknown>;
export type MigrationSummary = { digest: string; bytes: number; users: number; listings: number; orders: number; shows: number };

function record(value: unknown): Row {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid migration snapshot');
  return value as Row;
}
function rows(value: unknown): Row[] {
  if (!Array.isArray(value)) throw new Error('Invalid migration snapshot');
  return value.map(record);
}
function ids(items: Row[]): Set<string> {
  const result = new Set<string>();
  for (const item of items) {
    if (typeof item.id !== 'string' || !item.id || result.has(item.id)) throw new Error('Invalid migration identifiers');
    result.add(item.id);
  }
  return result;
}
export function inspectMigration(raw: string): MigrationSummary {
  const bytes = Buffer.byteLength(raw, 'utf8');
  if (!bytes || bytes > MAX_BYTES) throw new Error('Migration snapshot size is unsupported');
  const snapshot = record(JSON.parse(raw));
  if (snapshot.version !== 1) throw new Error('Invalid migration version');
  const state = record(snapshot.state), credentials = record(snapshot.credentials);
  const users = rows(state.users), shows = rows(state.shows), listings = rows(state.listings), orders = rows(state.orders), notifications = rows(state.notifications);
  const userIds = ids(users), showIds = ids(shows), listingIds = ids(listings);
  ids(orders); ids(notifications);
  const emails = new Set<string>(), names = new Set<string>();
  for (const user of users) {
    if (typeof user.name !== 'string' || !user.name.trim()) throw new Error('Invalid migration user');
    const name = user.name.trim().toLowerCase();
    if (names.has(name)) throw new Error('Duplicate migration name');
    names.add(name);
    const credential = record(credentials[String(user.id)]);
    if (typeof credential.salt !== 'string' || !/^[a-f0-9]{32}$/i.test(credential.salt) || typeof credential.hash !== 'string' || !/^[a-f0-9]{64}$/i.test(credential.hash)) throw new Error('Invalid migration credential');
    if (credential.email !== undefined) {
      const email = normalizeEmail(credential.email);
      if (!email || email !== credential.email || emails.has(email)) throw new Error('Invalid or duplicate migration email');
      emails.add(email);
    }
  }
  if (Object.keys(credentials).some(id => !userIds.has(id))) throw new Error('Unmatched migration credential');
  const sellerValid = (id: unknown) => typeof id === 'string' && (userIds.has(id) || id.startsWith('demo-'));
  for (const listing of listings) {
    const show = shows.find(item => item.id === listing.showId);
    if (!show || !sellerValid(listing.sellerId) || !rows(show.sessions).some(session => session.id === listing.sessionId)) throw new Error('Invalid migration listing');
  }
  for (const order of orders) {
    const listing = listings.find(item => item.id === order.listingId);
    if (!listing || listing.showId !== order.showId || typeof order.buyerId !== 'string' || !userIds.has(order.buyerId) || !sellerValid(order.sellerId) || listing.sellerId !== order.sellerId) throw new Error('Invalid migration order');
  }
  for (const user of users) for (const favorite of rows(user.favorites)) if (typeof favorite.showId !== 'string' || !showIds.has(favorite.showId)) throw new Error('Invalid migration favorite');
  for (const notification of notifications) if (typeof notification.userId !== 'string' || !userIds.has(notification.userId) || typeof notification.showId !== 'string' || !showIds.has(notification.showId) || typeof notification.listingId !== 'string' || !listingIds.has(notification.listingId)) throw new Error('Invalid migration notification');
  // Ensure the same loader used by the server accepts the snapshot without saving it.
  new MarketService(null, Date.now, { load: () => raw, save: () => { throw new Error('Read-only validation'); } });
  return { digest: createHash('sha256').update(raw).digest('hex'), bytes, users: users.length, listings: listings.length, orders: orders.length, shows: shows.length };
}

export function migrateToEmptyStore(raw: string, store: MarketPersistence): { outcome: 'copied' | 'already-present'; summary: MigrationSummary } {
  const summary = inspectMigration(raw);
  const existing = store.load();
  if (existing !== null) {
    if (createHash('sha256').update(existing).digest('hex') === summary.digest) return { outcome: 'already-present', summary };
    throw new Error('Migration target is not empty');
  }
  store.save(raw);
  const stored = store.load();
  if (stored === null || createHash('sha256').update(stored).digest('hex') !== summary.digest) throw new Error('Migration verification failed');
  return { outcome: 'copied', summary };
}
