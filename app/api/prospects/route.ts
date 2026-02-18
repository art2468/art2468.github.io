import { NextResponse } from 'next/server';
import { verifyOrigin } from '@/lib/csrf';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { parseTags } from '@/lib/utils';
import { prospectInputSchema } from '@/lib/validation';

export async function POST(req: Request) {
  if (!verifyOrigin(req)) return NextResponse.json({ error: 'Bad origin' }, { status: 403 });
  const user = await requireUser();
  const body = await req.json();
  const parsed = prospectInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  const d = parsed.data;

  try {
    const created = await prisma.prospect.create({
      data: {
        userId: user.id,
        profileUrl: d.profileUrl.trim(),
        firstName: d.firstName || null,
        lastName: d.lastName || null,
        company: d.company || null,
        title: d.title || null,
        region: d.region || null,
        rawAboutText: d.rawAboutText.trim(),
        rawExperienceText: d.rawExperienceText.trim(),
        myNotes: d.myNotes || null,
        tags: parseTags(d.tagsInput),
      },
    });
    return NextResponse.json({ id: created.id });
  } catch {
    return NextResponse.json({ error: 'Could not save prospect (duplicate URL?)' }, { status: 400 });
  }
}
