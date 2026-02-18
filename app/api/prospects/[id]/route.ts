import { NextResponse } from 'next/server';
import { verifyOrigin } from '@/lib/csrf';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { parseTags } from '@/lib/utils';
import { PROSPECT_STATUSES } from '@/lib/constants';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!verifyOrigin(req)) return NextResponse.json({ error: 'Bad origin' }, { status: 403 });
  const user = await requireUser();
  const formData = await req.formData();
  const action = String(formData.get('_action') || '');
  const id = params.id;

  const existing = await prisma.prospect.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!existing) return NextResponse.redirect(new URL('/prospects', req.url));

  if (action === 'update_meta') {
    const status = String(formData.get('status') || 'NEW');
    const tags = parseTags(String(formData.get('tagsInput') || ''));
    await prisma.prospect.update({
      where: { id },
      data: {
        status: (PROSPECT_STATUSES.includes(status as (typeof PROSPECT_STATUSES)[number]) ? status : 'NEW') as (typeof PROSPECT_STATUSES)[number],
        tags,
      },
    });
  }

  if (action === 'mark_messaged') {
    await prisma.prospect.update({ where: { id }, data: { status: 'MESSAGED', lastContactedAt: new Date() } });
  }

  if (action === 'mark_replied') {
    await prisma.prospect.update({ where: { id }, data: { status: 'REPLIED' } });
  }

  if (action === 'schedule_follow_up') {
    const rawDate = String(formData.get('nextFollowUpAt') || '');
    const nextFollowUpAt = new Date(rawDate);
    if (!Number.isNaN(nextFollowUpAt.getTime())) {
      await prisma.prospect.update({ where: { id }, data: { nextFollowUpAt } });
    }
  }

  return NextResponse.redirect(new URL(`/prospects/${id}?tab=interactions`, req.url));
}
