import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { ProspectFilters } from '@/components/prospect-filters';
import { StatusChip } from '@/components/status-chip';
import { formatDate, parseJsonArray } from '@/lib/utils';

export default async function ProspectsPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const user = await requireUser();
  const prospects = db.listProspectsForUser({
    userId: user.id,
    q: searchParams.q?.trim(),
    status: searchParams.status,
    fitMin: Number(searchParams.fitMin ?? ''),
    fitMax: Number(searchParams.fitMax ?? ''),
    sort: searchParams.sort || 'updated',
  });

  const tag = searchParams.tag?.trim().toLowerCase();
  const filtered = tag
    ? prospects.filter((p) => parseJsonArray(p.tags).some((t: string) => t.toLowerCase().includes(tag)))
    : prospects;

  return (
    <div className="space-y-4">
      <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Paste only content you have permission to use.</div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Prospects</h1>
        <Link href="/prospects/new" className="rounded bg-slate-900 px-3 py-2 text-sm text-white">Add Prospect</Link>
      </div>
      <ProspectFilters />
      <div className="overflow-x-auto rounded bg-white shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-2">Name</th><th className="p-2">Company</th><th className="p-2">Title</th><th className="p-2">Status</th><th className="p-2">Fit Score</th><th className="p-2">Next Follow-up</th><th className="p-2">Updated</th><th className="p-2">Tags</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t hover:bg-slate-50">
                <td className="p-2"><Link className="text-blue-700 underline" href={`/prospects/${p.id}`}>{[p.firstName, p.lastName].filter(Boolean).join(' ') || 'Unnamed'}</Link></td>
                <td className="p-2">{p.company || '—'}</td><td className="p-2">{p.title || '—'}</td><td className="p-2"><StatusChip status={p.status} /></td><td className="p-2">{p.aiFitScore ?? '—'}</td><td className="p-2">{formatDate(p.nextFollowUpAt)}</td><td className="p-2">{formatDate(p.updatedAt)}</td><td className="p-2">{parseJsonArray(p.tags).join(', ') || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
