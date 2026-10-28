import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth/adminSession';

export default async function HomePage() {
  const session = await getAdminSession();
  if (session.isAuthenticated) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
