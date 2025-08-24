'use client'
import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table';
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from '@tabler/icons-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Employee {
  _id: string;
  email: string;
  name?: string;
  role: string;
  isApproved: boolean;
  isRejected: boolean;
  approvedBy?: string | null;
  rejectedBy?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  approvedByName?: string | null;
  rejectedByName?: string | null;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [processingUser, setProcessingUser] = useState<string | null>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/employees');
      const data = await res.json();
      if (res.ok) {
        setEmployees(data.employees);
      } else {
        setError(data.message || 'Failed to fetch employees');
      }
    } catch {
      setError('Failed to fetch employees');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleApprove = async (userId: string) => {
    setProcessingUser(userId);
    try {
      const res = await fetch('/api/user/employees/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to approve user');
      } else {
        await fetchEmployees();
      }
    } catch (error) {
      setError('Failed to approve user');
    } finally {
      setProcessingUser(null);
    }
  };

  const handleReject = async (userId: string) => {
    setProcessingUser(userId);
    try {
      const res = await fetch('/api/user/employees/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to reject user');
      } else {
        await fetchEmployees();
      }
    } catch (error) {
      setError('Failed to reject user');
    } finally {
      setProcessingUser(null);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    if (statusFilter === 'approved') return emp.isApproved;
    if (statusFilter === 'rejected') return emp.isRejected;
    return !emp.isApproved && !emp.isRejected;
  });
  const pageCount = Math.ceil(filteredEmployees.length / pageSize);
  const paginatedEmployees = filteredEmployees.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Employees</h1>
      <div className="flex items-center justify-between mb-4 px-4 lg:px-6 max-w-full">
        <Tabs value={statusFilter} onValueChange={v => { setStatusFilter(v as string); setPageIndex(0); }} className="">
          <TabsList>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
        <button className="bg-indigo-400 hover:bg-indigo-500 text-white font-semibold py-2 px-6 rounded-xl flex items-center gap-2">
          <span className="text-xl font-bold">+</span> Create Credentials
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approved/Rejected By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmployees.map(emp => (
                  <TableRow key={emp._id}>
                    <TableCell>{emp.name || '-'}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.role}</TableCell>
                    <TableCell>
                      {emp.isApproved ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-green-100 text-green-800">
                          Approved
                        </span>
                      ) : emp.isRejected ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-red-100 text-red-800">
                          Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {emp.isApproved ? (emp.approvedByName || '-') : emp.isRejected ? (emp.rejectedByName || '-') : '-'}
                    </TableCell>
                    <TableCell>
                      <button
                        className="bg-green-500 text-white px-2 py-1 rounded mr-2 disabled:opacity-50"
                        onClick={() => handleApprove(emp._id)}
                        disabled={emp.isApproved || emp.isRejected || processingUser === emp._id}
                        title={emp.isApproved ? 'Already approved' : emp.isRejected ? 'Already rejected' : ''}
                      >
                        {processingUser === emp._id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded disabled:opacity-50"
                        onClick={() => handleReject(emp._id)}
                        disabled={emp.isApproved || emp.isRejected || processingUser === emp._id}
                        title={emp.isApproved ? 'Already approved' : emp.isRejected ? 'Already rejected' : ''}
                      >
                        {processingUser === emp._id ? 'Processing...' : 'Reject'}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
        </div>
      )}
    </div>
  );
} 