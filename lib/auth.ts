import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

export const AUTH_COOKIE = 'outreachops_auth';

export async function requireUser() {
  const email = cookies().get(AUTH_COOKIE)?.value;
  if (!email) redirect('/login');
  const user = db.getUserByEmail(email);
  if (!user) redirect('/login');
  return user;
}
