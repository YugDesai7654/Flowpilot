'use client'
import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table';
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconSearch, IconUser, IconClock, IconCheck, IconEye } from '@tabler/icons-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TeamMember {
  _id: string;
  email: string;
  name?: string;
  role: 'admin' | 'employee' | 'owner';
  isActive: boolean;
  isApproved: boolean;
  isRejected: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  approvedBy: string | null;
  rejectedBy: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  approvedByName: string | null;
  rejectedByName: string | null;
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/team');
      const data = await res.json();
      if (res.ok) {
        setTeamMembers(data.teamMembers);
        setCurrentUserRole(data.currentUserRole);
      } else {
        setError(data.message || 'Failed to fetch team members');
      }
    } catch {
      setError('Failed to fetch team members');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && member.isActive && member.isApproved) ||
                         (statusFilter === 'inactive' && !member.isActive) ||
                         (statusFilter === 'pending' && !member.isApproved && !member.isRejected) ||
                         (statusFilter === 'rejected' && member.isRejected);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const pageCount = Math.ceil(filteredMembers.length / pageSize);
  const paginatedMembers = filteredMembers.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (member: TeamMember) => {
    if (!member.isActive) return 'bg-gray-100 text-gray-800';
    if (member.isRejected) return 'bg-red-100 text-red-800';
    if (!member.isApproved) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (member: TeamMember) => {
    if (!member.isActive) return 'Inactive';
    if (member.isRejected) return 'Rejected';
    if (!member.isApproved) return 'Pending';
    return 'Active';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string | undefined, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Management</h1>
        <p className="text-gray-600">Manage and view all team members in your organization</p>
        {currentUserRole === 'employee' && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> As an employee, you can view team member information but some sensitive details are hidden for privacy.
            </p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <IconUser className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <IconCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {teamMembers.filter(m => m.isActive && m.isApproved).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <IconClock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {teamMembers.filter(m => !m.isApproved && !m.isRejected).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <IconUser className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {teamMembers.filter(m => m.role === 'admin' || m.role === 'owner').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={(value) => { setRoleFilter(value); setPageIndex(0); }}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPageIndex(0); }}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members ({filteredMembers.length})</CardTitle>
          <CardDescription>
            View and manage all team members in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Joined</TableHead>
                  {currentUserRole !== 'employee' && <TableHead>Approved/Rejected By</TableHead>}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMembers.map(member => (
                  <TableRow key={member._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" alt={member.name || member.email} />
                          <AvatarFallback className="text-xs">
                            {getInitials(member.name, member.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name || 'No name'}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(member.role)}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(member)}>
                        {getStatusText(member)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(member.lastLogin)}
                    </TableCell>
                                         <TableCell className="text-sm text-gray-500">
                       {formatDate(member.createdAt)}
                     </TableCell>
                     {currentUserRole !== 'employee' && (
                       <TableCell className="text-sm text-gray-500">
                         {member.isApproved ? (member.approvedByName || '-') : member.isRejected ? (member.rejectedByName || '-') : '-'}
                       </TableCell>
                     )}
                     <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedMember(member)}
                          >
                            <IconEye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Member Details</DialogTitle>
                            <DialogDescription>
                              Detailed information about {selectedMember?.name || selectedMember?.email}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedMember && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src="" alt={selectedMember.name || selectedMember.email} />
                                  <AvatarFallback>
                                    {getInitials(selectedMember.name, selectedMember.email)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold">{selectedMember.name || 'No name'}</div>
                                  <div className="text-sm text-gray-500">{selectedMember.email}</div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <div className="font-medium text-gray-500">Role</div>
                                  <div>{selectedMember.role.charAt(0).toUpperCase() + selectedMember.role.slice(1)}</div>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-500">Status</div>
                                  <div>{getStatusText(selectedMember)}</div>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-500">Last Login</div>
                                  <div>{formatDate(selectedMember.lastLogin)}</div>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-500">Joined</div>
                                  <div>{formatDate(selectedMember.createdAt)}</div>
                                </div>
                                                                 {selectedMember.approvedBy && currentUserRole !== 'employee' && (
                                   <div>
                                     <div className="font-medium text-gray-500">Approved By</div>
                                     <div>{selectedMember.approvedByName}</div>
                                   </div>
                                 )}
                                 {selectedMember.rejectedBy && currentUserRole !== 'employee' && (
                                   <div>
                                     <div className="font-medium text-gray-500">Rejected By</div>
                                     <div>{selectedMember.rejectedByName}</div>
                                   </div>
                                 )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex w-full items-center gap-8 mt-4">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${pageSize}`}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPageIndex(0);
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((size) => (
                    <SelectItem key={size} value={`${size}`}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {pageIndex + 1} of {pageCount || 1}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                size="icon"
                className="hidden h-8 w-8 p-0 lg:flex items-center justify-center"
                onClick={() => setPageIndex(0)}
                disabled={pageIndex === 0}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft className="mx-auto" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 items-center justify-center"
                onClick={() => setPageIndex(pageIndex - 1)}
                disabled={pageIndex === 0}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft className="mx-auto" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 items-center justify-center"
                onClick={() => setPageIndex(pageIndex + 1)}
                disabled={pageIndex >= pageCount - 1}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight className="mx-auto" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hidden h-8 w-8 p-0 lg:flex items-center justify-center"
                onClick={() => setPageIndex(pageCount - 1)}
                disabled={pageIndex >= pageCount - 1}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight className="mx-auto" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
