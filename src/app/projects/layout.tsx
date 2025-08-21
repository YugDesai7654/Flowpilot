import React from 'react';
import { Navbar } from '@/components/ui/navbar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProjectsLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect('/signup');
  }
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
} 