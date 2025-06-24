import React from 'react';
import { cookies } from 'next/headers';
import { Navbar } from '@/components/ui/navbar';
import { verifyJwt } from '@/lib/jwt';

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const token = (cookieStore as any).get('token')?.value;
  const user = token ? verifyJwt(token) : null;
  if (!user || typeof user !== 'object' || !('email' in user)) {
    return <div>Error: Not authenticated</div>;
  }
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
} 