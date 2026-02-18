import { NextResponse } from 'next/server';
import { verifyOrigin } from '@/lib/csrf';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  if (!verifyOrigin(req)) return NextResponse.json({ error: 'Bad origin' }, { status: 403 });
  const formData = await req.formData();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  if (!email || !password || password !== process.env.APP_PASSWORD) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  db.upsertUser(email, email.split('@')[0]);

  const res = NextResponse.redirect(new URL('/prospects', req.url));
  res.cookies.set('outreachops_auth', email, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
  return res;
}
