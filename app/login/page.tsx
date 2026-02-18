export default function LoginPage() {
  return (
    <div className="mx-auto mt-12 max-w-md rounded-lg bg-white p-6 shadow">
      <h1 className="mb-2 text-2xl font-semibold">Sign in</h1>
      <p className="mb-4 text-sm text-slate-600">Single-user local mode. Enter your email and app password.</p>
      <form action="/api/login" method="post" className="space-y-3">
        <input name="email" type="email" required placeholder="you@company.com" className="w-full rounded border p-2" />
        <input name="password" type="password" required className="w-full rounded border p-2" />
        <button className="w-full rounded bg-slate-900 p-2 text-white">Sign in</button>
      </form>
      <p className="mt-4 text-xs text-amber-700">Paste only content you have permission to use.</p>
    </div>
  );
}
