export default function ExportPage() {
  return (
    <div className="space-y-3 rounded bg-white p-6 shadow">
      <h1 className="text-2xl font-semibold">Export CSV</h1>
      <p className="text-sm text-slate-600">Download prospects as CSV. You can pass optional query params: status, fitMin, fitMax, tag.</p>
      <a href="/api/export" className="inline-block rounded bg-slate-900 px-4 py-2 text-white">Download CSV</a>
    </div>
  );
}
