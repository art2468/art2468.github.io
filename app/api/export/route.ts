import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

function esc(v: unknown) {
  const s = String(v ?? '');
  return `"${s.replaceAll('"', '""')}"`;
}

export async function GET(req: Request) {
  const user = await requireUser();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || undefined;
  const fitMin = Number(searchParams.get('fitMin') || '');
  const fitMax = Number(searchParams.get('fitMax') || '');
  const tag = searchParams.get('tag')?.toLowerCase();

  const prospects = await prisma.prospect.findMany({
    where: {
      userId: user.id,
      ...(status ? { status: status as never } : {}),
      ...(Number.isFinite(fitMin) ? { aiFitScore: { gte: fitMin } } : {}),
      ...(Number.isFinite(fitMax) ? { aiFitScore: { lte: fitMax } } : {}),
    },
    orderBy: { updatedAt: 'desc' },
  });

  const filtered = tag
    ? prospects.filter((p: (typeof prospects)[number]) => ((p.tags as string[] | null) || []).some((t: string) => t.toLowerCase().includes(tag)))
    : prospects;

  const header = ['id','name','company','title','status','fitScore','profileUrl','tags','updatedAt'];
  const rows = filtered.map((p: (typeof filtered)[number])=>[
    p.id,
    [p.firstName, p.lastName].filter(Boolean).join(' '),
    p.company || '',
    p.title || '',
    p.status,
    p.aiFitScore ?? '',
    p.profileUrl,
    ((p.tags as string[] | null) || []).join('|'),
    p.updatedAt.toISOString(),
  ]);

  const csv = [header, ...rows].map((r)=>r.map(esc).join(',')).join('\n');
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="outreachops-prospects.csv"' } });
}
