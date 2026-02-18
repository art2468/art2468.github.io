const bucket = new Map<string, number[]>();

const WINDOW_MS = 60_000;
const MAX_REQ = 5;

export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const existing = (bucket.get(key) || []).filter((ts) => ts > windowStart);
  if (existing.length >= MAX_REQ) {
    bucket.set(key, existing);
    return false;
  }
  existing.push(now);
  bucket.set(key, existing);
  return true;
}
