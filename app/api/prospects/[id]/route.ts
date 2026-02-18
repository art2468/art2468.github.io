import { NextResponse } from 'next/server';
import { verifyOrigin } from '@/lib/csrf';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { parseTags } from '@/lib/utils';
import { PROSPECT_STATUSES } from '@/lib/constants';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!verifyOrigin(req)) return NextResponse.json({ error: 'Bad origin' }, { status: 403 });
  const user = await requireUser();
  const formData = await req.formData();
  const action = String(formData.get('_action') || '');
  const id = params.id;

  const existing = db.getProspectByIdForUser(id, user.id);
  if (!existing) return NextResponse.redirect(new URL('/prospects', req.url));

  if (action === 'update_meta') {
    const status = String(formData.get('status') || 'NEW');
    db.updateProspect(id, {
      status: PROSPECT_STATUSES.includes(status as never) ? status : 'NEW',
      tags: JSON.stringify(parseTags(String(formData.get('tagsInput') || ''))),
    });
  }

  if (action === 'mark_messaged') db.updateProspect(id, { status: 'MESSAGED', lastContactedAt: new Date().toISOString() });
  if (action === 'mark_replied') db.updateProspect(id, { status: 'REPLIED' });

  if (action === 'schedule_follow_up') {
    const nextFollowUpAt = new Date(String(formData.get('nextFollowUpAt') || ''));
    if (!Number.isNaN(nextFollowUpAt.getTime())) db.updateProspect(id, { nextFollowUpAt: nextFollowUpAt.toISOString() });
  }

  return NextResponse.redirect(new URL(`/prospects/${id}?tab=interactions`, req.url));
}
