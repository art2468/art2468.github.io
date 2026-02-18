import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { CopyButton } from '@/components/copy-button';
import { formatDate } from '@/lib/utils';
import { INTERACTION_CHANNELS, INTERACTION_TYPES, PROSPECT_STATUSES } from '@/lib/constants';

export default async function ProspectDetailPage({ params, searchParams }: { params: { id: string }; searchParams: { tab?: string } }) {
  const user = await requireUser();
  const prospect = await prisma.prospect.findFirst({ where: { id: params.id, userId: user.id }, include: { interactions: { orderBy: { createdAt: 'desc' } } } });
  if (!prospect) return notFound();
  const tab = searchParams.tab || 'overview';

  return (
    <div className="space-y-4">
      <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Paste only content you have permission to use.</div>
      <div className="rounded bg-white p-4 shadow">
        <h1 className="text-2xl font-semibold">{[prospect.firstName, prospect.lastName].filter(Boolean).join(' ') || 'Unnamed'}</h1>
        <p className="text-slate-600">{prospect.company || '—'} · {prospect.title || '—'}</p>
        <form action={`/api/prospects/${prospect.id}`} method="post" className="mt-3 flex flex-wrap gap-2">
          <input type="hidden" name="_action" value="update_meta" />
          <select name="status" defaultValue={prospect.status} className="rounded border p-2">
            {PROSPECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input name="tagsInput" defaultValue={((prospect.tags as string[] | null) || []).join(', ')} className="rounded border p-2" placeholder="tags" />
          <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white">Update</button>
        </form>
      </div>
      <div className="flex gap-3 text-sm">
        <a className="underline" href={`?tab=overview`}>Overview</a>
        <a className="underline" href={`?tab=ai`}>AI Output</a>
        <a className="underline" href={`?tab=interactions`}>Interactions</a>
      </div>
      {tab === 'overview' && (
        <div className="rounded bg-white p-4 shadow space-y-3">
          <div><strong>Profile URL:</strong> {prospect.profileUrl}</div>
          <div><strong>About:</strong><p className="whitespace-pre-wrap">{prospect.rawAboutText}</p></div>
          <div><strong>Experience:</strong><p className="whitespace-pre-wrap">{prospect.rawExperienceText}</p></div>
          <div><strong>My Notes:</strong><p className="whitespace-pre-wrap">{prospect.myNotes || '—'}</p></div>
        </div>
      )}
      {tab === 'ai' && (
        <div className="space-y-3 rounded bg-white p-4 shadow">
          <form action="/api/ai/generate" method="post"><input type="hidden" name="prospectId" value={prospect.id} /><button className="rounded bg-blue-700 px-3 py-2 text-white">{prospect.aiRunAt ? 'Regenerate' : 'Generate AI Summary'}</button></form>
          <div><strong>Career Summary</strong><ul className="list-disc pl-6">{((prospect.aiCareerSummary as string[] | null) || []).map((b, i) => <li key={i}>{b}</li>)}</ul></div>
          <div><strong>Likely Priorities</strong><ul className="list-disc pl-6">{((prospect.aiLikelyPriorities as string[] | null) || []).map((b, i) => <li key={i}>{b}</li>)}</ul></div>
          <div><strong>Fit Score:</strong> {prospect.aiFitScore ?? '—'}</div>
          <div><strong>Fit Reason:</strong> {prospect.aiFitReason || '—'}</div>
          <div><strong>Best Angle:</strong> {prospect.aiBestAngle || '—'}</div>
          <div className="space-y-2"><strong>Personal Note:</strong> <p>{prospect.aiPersonalNote || '—'}</p>{prospect.aiPersonalNote && <CopyButton text={prospect.aiPersonalNote} />}</div>
          <div><strong>Follow-up Question:</strong> {prospect.aiFollowUpQuestion || '—'}</div>
          <div className="text-xs text-slate-500">Model: {prospect.aiModel || '—'} · Run At: {formatDate(prospect.aiRunAt)}</div>
        </div>
      )}
      {tab === 'interactions' && (
        <div className="space-y-3 rounded bg-white p-4 shadow">
          <div className="flex flex-wrap gap-2">
            <form action={`/api/prospects/${prospect.id}`} method="post"><input type="hidden" name="_action" value="mark_messaged" /><button className="rounded bg-slate-900 px-3 py-2 text-white">Mark Messaged</button></form>
            <form action={`/api/prospects/${prospect.id}`} method="post"><input type="hidden" name="_action" value="mark_replied" /><button className="rounded bg-emerald-700 px-3 py-2 text-white">Mark Replied</button></form>
            <form action={`/api/prospects/${prospect.id}`} method="post" className="flex gap-2"><input type="hidden" name="_action" value="schedule_follow_up" /><input type="date" required name="nextFollowUpAt" className="rounded border p-2" /><button className="rounded bg-amber-700 px-3 py-2 text-white">Schedule Follow-up</button></form>
          </div>
          <form action={`/api/prospects/${prospect.id}/interactions`} method="post" className="grid gap-2 md:grid-cols-4">
            <select name="type" className="rounded border p-2">{INTERACTION_TYPES.map((t)=><option key={t}>{t}</option>)}</select>
            <select name="channel" className="rounded border p-2">{INTERACTION_CHANNELS.map((c)=><option key={c}>{c}</option>)}</select>
            <input name="outcome" placeholder="Outcome" className="rounded border p-2" />
            <input name="content" required placeholder="Interaction note" className="rounded border p-2" />
            <button className="rounded bg-slate-900 px-3 py-2 text-white">Add</button>
          </form>
          <ul className="space-y-2">{prospect.interactions.map((i: any)=><li key={i.id} className="rounded border p-2 text-sm"><div className="font-medium">{i.type} via {i.channel}</div><p>{i.content}</p><p className="text-slate-500">{i.outcome || 'No outcome'} · {formatDate(i.createdAt)}</p></li>)}</ul>
        </div>
      )}
    </div>
  );
}
