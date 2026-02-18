import { NextResponse } from 'next/server';
import { verifyOrigin } from '@/lib/csrf';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { interactionSchema } from '@/lib/validation';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!verifyOrigin(req)) return NextResponse.json({ error: 'Bad origin' }, { status: 403 });
  const user = await requireUser();
  const form = await req.formData();
  const parsed = interactionSchema.safeParse({
    type: form.get('type'),
    channel: form.get('channel'),
    content: form.get('content'),
    outcome: form.get('outcome'),
  });
  if (!parsed.success) return NextResponse.redirect(new URL(`/prospects/${params.id}?tab=interactions`, req.url));

  const prospect = await prisma.prospect.findFirst({ where: { id: params.id, userId: user.id } });
  if (!prospect) return NextResponse.redirect(new URL('/prospects', req.url));

  await prisma.interaction.create({ data: { prospectId: prospect.id, ...parsed.data, outcome: parsed.data.outcome || null } });
  return NextResponse.redirect(new URL(`/prospects/${params.id}?tab=interactions`, req.url));
}
