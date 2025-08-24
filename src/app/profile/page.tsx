'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { 
  Copy, 
  Loader2, 
  Building2, 
  Mail, 
  Shield, 
  Calendar, 
  Clock, 
  User as UserIcon,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Key,
  Users,
  Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/navbar';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/signup');
    },
  }) as { data: { user?: { email?: string } } | null; status: 'authenticated' | 'loading' | 'unauthenticated' };

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.email) return;
      
      try {
        const response = await fetch('/api/user/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
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
        console.error('Profile fetch error:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchUserProfile();
    } else if (status === 'unauthenticated') {
      router.push('/signup');
    }
  }, [session, status, router]);

  const copyCompanyId = () => {
    if (userProfile?.companyId) {
      navigator.clipboard.writeText(userProfile.companyId);
      toast.success('Company ID copied to clipboard');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'employee': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-600" />
    );
  };

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

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  if ((status === 'loading' || status === 'unauthenticated') || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600 font-medium">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <p className="text-red-600 mb-4 font-medium">Failed to load profile</p>
            <Button onClick={() => router.push('/signup')}>
              Return to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
              <AvatarImage src="" alt={userProfile.email} />
              <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                {getInitials(userProfile.email)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {userProfile.email.split('@')[0]}
              </h1>
              <p className="text-lg text-gray-600 mb-3">{userProfile.email}</p>
              <div className="flex items-center gap-4">
                <Badge className={`${getRoleColor(userProfile.role)} border`}>
                  {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                </Badge>
                <div className="flex items-center gap-2">
                  {getStatusIcon(userProfile.isActive)}
                  <span className={`text-sm font-medium ${userProfile.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {userProfile.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Details Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Your account details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </label>
                    <p className="text-gray-900 font-medium">{userProfile.email}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Account Role
                    </label>
                    <Badge className={`${getRoleColor(userProfile.role)} border`}>
                      {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Last Login
                    </label>
                    <p className="text-gray-900">{formatDate(userProfile.lastLogin)}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Member Since
                    </label>
                    <p className="text-gray-900">{formatDate(userProfile.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Information Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Company Information
                </CardTitle>
                <CardDescription>
                  Details about your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Company Name
                    </label>
                    <p className="text-gray-900 font-semibold text-lg">{userProfile.companyName}</p>
                  </div>
                  
                  {(userProfile.role === 'admin' || userProfile.role === 'owner') && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        Company ID
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-3 py-2 rounded-md text-sm font-mono text-gray-800 flex-1">
                          {userProfile.companyId}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyCompanyId}
                          className="shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Team Management</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/team')}>
                    View Team
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions & Stats */}
          <div className="space-y-6">
            
            {/* Account Status Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(userProfile.isActive)}
                    <div>
                      <p className="font-medium text-gray-900">Account Status</p>
                      <p className="text-sm text-gray-600">
                        {userProfile.isActive ? 'Active and verified' : 'Account suspended'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Access Level</p>
                      <p className="text-sm text-gray-600 capitalize">{userProfile.role} permissions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard')}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/team')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Team
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/setting')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
              </CardContent>
            </Card>

            {/* Account Summary Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Role</span>
                  <Badge className={`${getRoleColor(userProfile.role)} border`}>
                    {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${userProfile.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {userProfile.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Member Since</span>
                  <span className="text-gray-900 font-medium">
                    {new Date(userProfile.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} {userProfile.companyName}. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
                Home
              </Link>
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 transition-colors">
                Dashboard
              </Link>
              <Link href="/profile" className="text-blue-600 hover:text-blue-800 transition-colors">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ProfilePage;