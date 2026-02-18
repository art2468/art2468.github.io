import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

export const AUTH_COOKIE = 'outreachops_auth';

export async function requireUser() {
  const cookieStore = cookies();
  const email = cookieStore.get(AUTH_COOKIE)?.value;
  if (!email) redirect('/login');

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) redirect('/login');
  return user;
}

export function isAuthenticated() {
  return Boolean(cookies().get(AUTH_COOKIE)?.value);
}
