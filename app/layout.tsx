import './globals.css';
import Link from 'next/link';
import { cookies } from 'next/headers';

export const metadata = {
  title: 'OutreachOps',
  description: 'BlueprintAI LinkedIn outreach tracker',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isAuthed = Boolean(cookies().get('outreachops_auth')?.value);
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b bg-white">
            <nav className="mx-auto flex max-w-7xl items-center justify-between p-4">
              <Link href="/prospects" className="text-xl font-semibold">OutreachOps</Link>
              {isAuthed && (
                <div className="flex gap-4 text-sm">
                  <Link href="/prospects">Prospects</Link>
                  <Link href="/export">Export</Link>
                  <form action="/api/logout" method="post">
                    <button className="text-red-600">Logout</button>
                  </form>
                </div>
              )}
            </nav>
          </header>
          <main className="mx-auto max-w-7xl p-4">{children}</main>
        </div>
      </body>
    </html>
  );
}
