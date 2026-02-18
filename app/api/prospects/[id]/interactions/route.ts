import { NextResponse } from 'next/server';
import { verifyOrigin } from '@/lib/csrf';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
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

  const prospect = db.getProspectByIdForUser(params.id, user.id);
  if (!parsed.success || !prospect) return NextResponse.redirect(new URL(`/prospects/${params.id}?tab=interactions`, req.url));

  db.createInteraction({ prospectId: prospect.id, ...parsed.data, outcome: parsed.data.outcome || null });
  return NextResponse.redirect(new URL(`/prospects/${params.id}?tab=interactions`, req.url));
}
