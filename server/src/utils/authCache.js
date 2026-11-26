/**
 * Tiny in-memory cache for the per-request "is this token's user still active?" lookup.
 * Every authenticated request used to cost one database round trip just for this check;
 * with a 60 s TTL it costs one per user per minute instead.
 */
const TTL_MS = 60 * 1000;
const MAX_ENTRIES = 5000;
const entries = new Map();

export function getCachedUser(userId) {
  const hit = entries.get(userId);
  if (!hit) return null;
  if (hit.expires < Date.now()) {
    entries.delete(userId);
    return null;
  }
  return hit.user;
}

export function setCachedUser(userId, user) {
  if (entries.size >= MAX_ENTRIES) entries.delete(entries.keys().next().value);
  entries.set(userId, { user, expires: Date.now() + TTL_MS });
}

export const invalidateCachedUser = (userId) => entries.delete(userId);
