'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProspectPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch('/api/prospects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) return setError(json.error || 'Failed to create prospect');
    router.push(`/prospects/${json.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">Add Prospect</h1>
      <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Paste only content you have permission to use.</div>
      <form onSubmit={onSubmit} className="space-y-3 rounded bg-white p-4 shadow">
        <input name="profileUrl" required placeholder="LinkedIn profile URL" className="w-full rounded border p-2" />
        <div className="grid gap-2 md:grid-cols-2">
          <input name="firstName" placeholder="First name" className="rounded border p-2" />
          <input name="lastName" placeholder="Last name" className="rounded border p-2" />
          <input name="company" placeholder="Company" className="rounded border p-2" />
          <input name="title" placeholder="Title" className="rounded border p-2" />
        </div>
        <textarea name="rawAboutText" required rows={6} placeholder="Paste About text" className="w-full rounded border p-2" />
        <textarea name="rawExperienceText" required rows={6} placeholder="Paste Experience highlights" className="w-full rounded border p-2" />
        <textarea name="myNotes" rows={4} placeholder="Optional notes" className="w-full rounded border p-2" />
        <input name="tagsInput" placeholder="Tags (comma separated)" className="w-full rounded border p-2" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="rounded bg-slate-900 px-4 py-2 text-white">{loading ? 'Saving...' : 'Save Prospect'}</button>
      </form>
    </div>
  );
}
