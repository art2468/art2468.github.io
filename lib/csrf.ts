export function verifyOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  const url = new URL(req.url);
  return new URL(origin).host === url.host;
}
