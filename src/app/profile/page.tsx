'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { Copy, Loader2, Building2, Mail, Shield, Calendar, Clock, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/navbar';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UserProfile {
  email: string;
  role: 'admin' | 'employee' | 'owner';
  companyId: string;
  companyName: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

function ProfilePage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/signup');
            return;
          }
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setUserProfile(data);
      } catch (error) {
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [router]);

  const copyCompanyId = () => {
    if (userProfile?.companyId) {
      navigator.clipboard.writeText(userProfile.companyId);
      toast.success('Company ID copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <p className="text-red-500 mb-4">Failed to load profile</p>
            <Button onClick={() => router.push('/signup')}>
              Return to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-white relative overflow-x-hidden">
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/30 to-indigo-400/20 rounded-full blur-3xl z-0" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-300/30 to-blue-200/10 rounded-full blur-2xl z-0" />
      <Navbar />
      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center mb-10"
        >
          <div className="relative flex items-center justify-center w-32 h-32 mx-auto">
            <Avatar className="w-28 h-28 flex items-center justify-center border-4 border-white shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600">
              <span className="flex items-center justify-center w-full h-full">
                <UserIcon className="h-14 w-14 text-white" />
              </span>
            </Avatar>
          </div>
          <h1 className="mt-6 text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent drop-shadow-lg">Welcome, {userProfile?.email?.split('@')[0] || 'User'}!</h1>
          <p className="text-gray-500 mt-2 text-lg">Here&apos;s your account overview</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="max-w-3xl mx-auto border-0 shadow-2xl bg-white/70 backdrop-blur-lg rounded-3xl p-1">
            <CardHeader className="text-center space-y-2 pb-6">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">{userProfile.email}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Role</span>
                  </div>
                  <Badge variant={userProfile.role === 'admin' ? 'default' : 'secondary'} className="text-sm px-3 py-1 rounded-full capitalize">
                    {userProfile.role}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Building2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Company Name</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">{userProfile.companyName}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Status</span>
                  </div>
                  <Badge variant={userProfile.isActive ? 'success' : 'destructive'} className="text-sm px-3 py-1 rounded-full">
                    {userProfile.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {(userProfile.role === 'admin' || userProfile.role === 'owner') && (
                  <div className="space-y-2 col-span-2">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Building2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Company ID</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-mono bg-gray-100 p-2 rounded flex-1 border border-gray-200">{userProfile.companyId}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={copyCompanyId}
                        className="hover:bg-gray-200"
                        aria-label="Copy Company ID"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Last Login</span>
                  </div>
                  <p className="text-lg text-gray-700">{formatDate(userProfile.lastLogin)}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Member Since</span>
                  </div>
                  <p className="text-lg text-gray-700">{formatDate(userProfile.createdAt)}</p>
                </div>
              </div>
              <Separator className="my-6" />
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-blue-500" />
                  <span className="text-base font-medium text-gray-700">{userProfile.email}</span>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all">
                  Manage Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <footer className="bg-white/70 backdrop-blur-lg border-t mt-16 shadow-inner">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-500 text-sm text-center md:text-left">
            © {new Date().getFullYear()} FlowPilot. All rights reserved.
          </div>
          <div className="flex gap-3 justify-center md:justify-end">
            <Link href="/" className="text-blue-600 hover:underline text-sm">Home</Link>
            <a href="/dashboard" className="text-blue-600 hover:underline text-sm">Dashboard</a>
            <a href="/profile" className="text-blue-600 hover:underline text-sm">Profile</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ProfilePage;