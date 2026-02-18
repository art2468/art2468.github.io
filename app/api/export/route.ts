import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { parseJsonArray } from '@/lib/utils';

function esc(v: unknown) {
  const s = String(v ?? '');
  return `"${s.replaceAll('"', '""')}"`;
}

export async function GET(req: Request) {
  const user = await requireUser();
  const { searchParams } = new URL(req.url);

  const prospects = db.listProspectsForUser({
    userId: user.id,
    status: searchParams.get('status') || undefined,
    fitMin: Number(searchParams.get('fitMin') || ''),
    fitMax: Number(searchParams.get('fitMax') || ''),
  });

  const tag = searchParams.get('tag')?.toLowerCase();
  const filtered = tag ? prospects.filter((p) => parseJsonArray(p.tags).some((t) => t.toLowerCase().includes(tag))) : prospects;

  const header = ['id', 'name', 'company', 'title', 'status', 'fitScore', 'profileUrl', 'tags', 'updatedAt'];
  const rows = filtered.map((p) => [
    p.id,
    [p.firstName, p.lastName].filter(Boolean).join(' '),
    p.company || '',
    p.title || '',
    p.status,
    p.aiFitScore ?? '',
    p.profileUrl,
    parseJsonArray(p.tags).join('|'),
    p.updatedAt,
  ]);

  const csv = [header, ...rows].map((r) => r.map(esc).join(',')).join('\n');
  return new NextResponse(csv, {
    headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="outreachops-prospects.csv"' },
  });
}
