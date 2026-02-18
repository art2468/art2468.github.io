'use client';

import { PROSPECT_STATUSES } from '@/lib/constants';
import { useRouter, useSearchParams } from 'next/navigation';

export function ProspectFilters() {
  const params = useSearchParams();
  const router = useRouter();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/prospects?${next.toString()}`);
  }

  return (
    <div className="grid gap-2 md:grid-cols-5">
      <input className="rounded border p-2" defaultValue={params.get('q') || ''} placeholder="Search" onBlur={(e) => update('q', e.target.value)} />
      <select className="rounded border p-2" defaultValue={params.get('status') || ''} onChange={(e) => update('status', e.target.value)}>
        <option value="">All statuses</option>
        {PROSPECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <input type="number" className="rounded border p-2" min={0} max={10} defaultValue={params.get('fitMin') || ''} placeholder="Fit min" onBlur={(e) => update('fitMin', e.target.value)} />
      <input type="number" className="rounded border p-2" min={0} max={10} defaultValue={params.get('fitMax') || ''} placeholder="Fit max" onBlur={(e) => update('fitMax', e.target.value)} />
      <input className="rounded border p-2" defaultValue={params.get('tag') || ''} placeholder="Tag" onBlur={(e) => update('tag', e.target.value)} />
    </div>
  );
}
