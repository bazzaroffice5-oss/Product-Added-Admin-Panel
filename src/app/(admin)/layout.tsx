import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth/adminSession';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export const dynamic = 'force-dynamic';

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session.isAuthenticated) {
    redirect('/login');
  }

  return (
    <AdminLayoutClient adminEmail={session.email || 'Admin'}>
      {children}
    </AdminLayoutClient>
  );
}
