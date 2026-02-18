import { NextResponse } from 'next/server';
import { verifyOrigin } from '@/lib/csrf';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { runAnalysis } from '@/lib/ai';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  if (!verifyOrigin(req)) return NextResponse.json({ error: 'Bad origin' }, { status: 403 });
  const user = await requireUser();
  if (!checkRateLimit(user.id)) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const form = await req.formData();
  const prospectId = String(form.get('prospectId') || '');
  const prospect = db.getProspectByIdForUser(prospectId, user.id);
  if (!prospect) return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });

  try {
    const { data, model } = await runAnalysis({
      profileUrl: prospect.profileUrl,
      firstName: prospect.firstName,
      lastName: prospect.lastName,
      company: prospect.company,
      title: prospect.title,
      rawAboutText: prospect.rawAboutText,
      rawExperienceText: prospect.rawExperienceText,
      myNotes: prospect.myNotes,
    });

    db.updateProspect(prospect.id, {
      aiCareerSummary: JSON.stringify(data.career_summary),
      aiLikelyPriorities: JSON.stringify(data.likely_priorities),
      aiFitScore: data.fit_score,
      aiFitReason: data.fit_reason,
      aiBestAngle: data.best_angle,
      aiPersonalNote: data.personal_note,
      aiFollowUpQuestion: data.follow_up_question,
      aiModel: model,
      aiRunAt: new Date().toISOString(),
    });

    return NextResponse.redirect(new URL(`/prospects/${prospect.id}?tab=ai`, req.url));
  } catch (error) {
    console.error('AI generation error', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Failed to generate AI output. Please retry.' }, { status: 500 });
  }
}
