"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { IUser } from '@/models/userModel';
import { IProject } from '@/models/projectModel';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(1, "Description is required"),
  clientName: z.string().min(1, "Client name is required"),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  projectHead: z.string().min(1, "Project head is required"),
  employees: z.array(z.string()).min(1, "At least one employee must be selected"),
  totalRevenue: z.number().optional(),
  cost: z.number().optional(),
});

const EditProjectPage = () => {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const [user, setUser] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [users, setUsers] = useState<IUser[]>([]);
    const [project, setProject] = useState<IProject | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof projectSchema>>({
        resolver: zodResolver(projectSchema),
    });

    useEffect(() => {
        // Check authentication and get user
        fetch('/api/user/profile', { credentials: 'include' })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) {
                    setUser(data);
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            });
        const fetchUsers = async () => {
            const res = await fetch('/api/users');
            if (res.ok) setUsers(await res.json());
        };
        const fetchProject = async () => {
            const res = await fetch(`/api/projects/${id}`);
            if (res.ok) {
                const data = await res.json();
                setProject(data);
                form.reset({
                    ...data,
                    startDate: new Date(data.startDate).toISOString().split('T')[0],
                    endDate: new Date(data.endDate).toISOString().split('T')[0],
                    projectHead: data.projectHead._id,
                    employees: data.employees.map((e: IUser) => e._id),
                });
            }
        };

        fetchUsers();
        if (id) fetchProject();
    }, [id, form]);
    
    const canEditFinancials = user?.role === 'admin' || user?.role === 'owner';

    const onSubmit = async (values: z.infer<typeof projectSchema>) => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            if (res.ok) {
                router.push(`/projects/${id}`);
            } else {
                console.error("Failed to update project");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (!isAuthenticated) return <div>Not authenticated. Please <a href="/signup">sign in</a>.</div>;
    if (!project) return <div>Loading...</div>

    return (
        <div className="container mx-auto p-4 max-w-xl flex flex-col items-center justify-center min-h-[80vh]">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full p-8">
                <div className="flex items-center gap-3 mb-6">
                    <ClipboardDocumentListIcon className="w-8 h-8 text-blue-500" />
                    <h1 className="text-3xl font-extrabold">Edit Project</h1>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project Name</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl><Textarea {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="clientName"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Client Name</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl><Input type="date" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl><Input type="date" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="projectHead"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Head</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select a project head" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {users.map(user => (
                                                <SelectItem key={user._id as string} value={user._id as string}>{user.name || "Unnamed"}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="employees"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Employees</FormLabel>
                                    <MultiSelect
                                        options={users.map(u => ({ value: u._id as string, label: u.name || "Unnamed" }))}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        placeholder="Select employees"
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {canEditFinancials && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormField
                                    control={form.control}
                                    name="totalRevenue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total Revenue</FormLabel>
                                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="cost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cost</FormLabel>
                                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                        <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow">
                            {isSubmitting ? 'Updating...' : 'Update Project'}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default EditProjectPage; 