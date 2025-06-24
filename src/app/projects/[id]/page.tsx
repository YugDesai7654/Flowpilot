"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ITask } from '@/models/taskModel';
import { IUser } from '@/models/userModel';

interface ProjectWithTasks {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  clientName: string;
  totalRevenue: number;
  cost: number;
  projectHead: IUser | string;
  tasks: ITask[];
  employees: IUser[];
}
import { useSession } from "next-auth/react";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { CheckCircleIcon, UserGroupIcon, CalendarIcon, CurrencyDollarIcon, ClipboardDocumentListIcon, ArrowTrendingUpIcon, UsersIcon, PlusIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/outline';
import React from 'react';

const ProjectDetailsPage = () => {
    const params = useParams();
    const { id } = params;
    const [project, setProject] = useState<ProjectWithTasks | null>(null);
    const [loading, setLoading] = useState(true);
    const { data: session } = useSession();

    useEffect(() => {
        if (id) {
            const fetchProject = async () => {
                try {
                    const res = await fetch(`/api/projects/${id}`);
                    if (res.ok) {
                        const data = await res.json();
                        setProject(data);
                    }
                } catch (error) {
                    console.error('Failed to fetch project details', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchProject();
        }
    }, [id]);

    const handleTaskStatusChange = async (taskId: string, status: string) => {
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                // Refetch the project to get updated tasks
                const projectRes = await fetch(`/api/projects/${id}`);
                if (projectRes.ok) {
                    const updatedProject = await projectRes.json();
                    setProject(updatedProject);
                }
            }
        } catch (error) {
            console.error('Failed to update task status', error);
        }
    };
    
    const canEditDetails = session?.user?.role === 'admin' || session?.user?.role === 'owner' || project?.projectHead === session?.user.id;
    const canMarkTaskComplete = project?.projectHead === session?.user.id;
    const canCreateTask = session?.user?.role === 'admin' || session?.user?.role === 'owner' || project?.projectHead === session?.user.id;
    const canDeleteProject = session?.user?.role === 'admin' || session?.user?.role === 'owner';
    const canDeleteTask = session?.user?.role === 'admin' || session?.user?.role === 'owner' || project?.projectHead === session?.user.id;

    const handleDeleteProject = async () => {
        if (!canDeleteProject) return;
        if (!window.confirm('Are you sure you want to archive this project? This action can be undone by an admin or owner.')) return;
        try {
            const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            if (res.ok) {
                window.location.href = '/projects';
            }
        } catch (error) {
            console.error('Failed to archive project', error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!canDeleteTask) return;
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
            if (res.ok) {
                // Refetch the project to get updated tasks
                const projectRes = await fetch(`/api/projects/${id}`);
                if (projectRes.ok) {
                    const updatedProject = await projectRes.json();
                    setProject(updatedProject);
                }
            }
        } catch (error) {
            console.error('Failed to delete task', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!project) {
        return <div>Project not found</div>;
    }

    const tasks = Array.isArray(project.tasks) && project.tasks.length > 0 && typeof project.tasks[0] === 'object' && 'name' in project.tasks[0]
        ? ((project.tasks as unknown) as ITask[])
        : [];
    const employees = Array.isArray(project.employees) && project.employees.length > 0 && typeof project.employees[0] === 'object' && 'name' in project.employees[0]
        ? ((project.employees as unknown) as IUser[])
        : [];
    const progress = getProjectProgress(tasks);
    const timeline = getTaskTimeline(tasks);
    const groupedTasks = groupTasksByStatus(tasks);

    const STATUSES = ['To Do', 'In Progress', 'Done'] as const;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white pb-16">
            {/* Header */}
            <div className="max-w-6xl mx-auto mt-8 mb-8 px-4">
                <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 py-6 px-6 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <ArrowTrendingUpIcon className="w-10 h-10 text-white drop-shadow-lg" />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow tracking-tight mb-1">{project.name}</h1>
                            <p className="text-indigo-100 max-w-2xl text-base mb-1">{project.description}</p>
                            {/* Project Head Display */}
                            <div className="flex items-center gap-2 mt-2">
                                <span className="font-semibold text-indigo-100 text-sm">Project Head:</span>
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs shadow">
                                    {getInitials(typeof project.projectHead === 'object' ? project.projectHead.name || 'PH' : 'PH')}
                                </span>
                                <span className="text-indigo-100 font-medium text-sm">{typeof project.projectHead === 'object' ? project.projectHead.name || 'N/A' : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col md:items-end gap-2">
                        <div className="flex gap-2">
                            {canEditDetails && (
                                <Link href={`/projects/${id}/edit`}>
                                    <Button className="bg-white/90 hover:bg-white text-blue-700 font-bold shadow flex items-center gap-2 px-4 py-2 rounded-lg text-sm"><ArrowTrendingUpIcon className="w-4 h-4" />Edit Project</Button>
                                </Link>
                            )}
                            {canCreateTask && (
                                <Link href={`/projects/${id}/tasks/create`}>
                                    <Button className="bg-blue-700 hover:bg-blue-800 text-white font-bold shadow flex items-center gap-2 px-4 py-2 rounded-lg text-sm"><PlusIcon className="w-4 h-4" />Add Task</Button>
                                </Link>
                            )}
                            {canDeleteProject && (
                                <Button onClick={handleDeleteProject} className="bg-red-600 hover:bg-red-700 text-white font-bold shadow flex items-center gap-2 px-4 py-2 rounded-lg text-sm"><TrashIcon className="w-4 h-4" />Archive Project</Button>
                            )}
                        </div>
                        <div className="flex gap-4 mt-2 text-indigo-100 text-xs">
                            <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" />{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><UserGroupIcon className="w-4 h-4" />{employees.length} Team</span>
                        </div>
                    </div>
                </div>
            </div>
            {/* Main Apple-like Card Container */}
            <div className="max-w-6xl mx-auto px-2 md:px-0">
                <div className="bg-white/90 rounded-3xl shadow-2xl p-6 md:p-10 flex flex-col gap-8">
                    {/* Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-2xl shadow p-5 flex flex-col gap-2 border border-gray-100">
                            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm"><CalendarIcon className="w-5 h-5" />Project Dates</div>
                            <div className="text-gray-700 text-sm">{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</div>
                            <div className="text-gray-500 text-xs">Client: <span className="font-semibold text-gray-700">{project.clientName}</span></div>
                        </div>
                        <div className="bg-white rounded-2xl shadow p-5 flex flex-col gap-2 border border-gray-100">
                            <div className="flex items-center gap-2 text-green-600 font-bold text-sm"><CurrencyDollarIcon className="w-5 h-5" />Financials</div>
                            <div className="text-gray-700 text-sm">Revenue: <span className="font-semibold">${project.totalRevenue.toLocaleString()}</span></div>
                            <div className="text-gray-700 text-sm">Cost: <span className="font-semibold">${project.cost.toLocaleString()}</span></div>
                            <div className="text-gray-700 text-sm">Profit: <span className="font-semibold">${(project.totalRevenue - project.cost).toLocaleString()}</span></div>
                        </div>
                        <div className="bg-white rounded-2xl shadow p-5 flex flex-col gap-2 border border-gray-100">
                            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm"><ArrowTrendingUpIcon className="w-5 h-5" />Progress</div>
                            <div className="flex items-center gap-3">
                                <div className="relative w-14 h-14">
                                    <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 40 40">
                                        <circle cx="20" cy="20" r="18" fill="none" stroke="#e0e7ef" strokeWidth="4" />
                                        <circle cx="20" cy="20" r="18" fill="none" stroke="#6366f1" strokeWidth="4" strokeDasharray="113" strokeDashoffset={`${113 - (progress / 100) * 113}`} strokeLinecap="round" />
                                    </svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-indigo-700">{progress}%</span>
                                </div>
                                <span className="text-gray-700 text-sm">{tasks.length} Tasks</span>
                            </div>
                        </div>
                    </div>
                    {/* Team Section */}
                    <div className="mb-6">
                        <div className="bg-white rounded-2xl shadow p-5 border border-gray-100">
                            <div className="flex items-center gap-2 mb-3 text-blue-700 font-bold text-sm"><UsersIcon className="w-5 h-5" />Project Team</div>
                            <div className="flex flex-wrap gap-4">
                                {employees.length > 0 ? employees.map(e => (
                                    <div key={e._id as string} className="flex flex-col items-center gap-1">
                                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-base shadow">
                                            {getInitials(e.name || 'U')}
                                        </span>
                                        <span className="text-gray-700 text-xs font-medium">{e.name}</span>
                                    </div>
                                )) : <span className="text-gray-400 text-sm">No employees listed</span>}
                            </div>
                        </div>
                    </div>
                    {/* Kanban Tasks & Timeline */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Kanban Tasks */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-3 text-indigo-700 font-bold text-base"><ClipboardDocumentListIcon className="w-5 h-5" />Tasks</div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {STATUSES.map((status) => (
                                    <div key={status} className="bg-indigo-50 rounded-xl shadow p-3 border border-indigo-100 min-h-[160px] flex flex-col">
                                        <div className={`font-bold mb-2 flex items-center gap-2 text-xs ${status === 'Done' ? 'text-green-600' : status === 'In Progress' ? 'text-yellow-600' : 'text-gray-600'}`}>{status}</div>
                                        <div className="flex-1 flex flex-col gap-2">
                                            {groupedTasks[status].length > 0 ? groupedTasks[status].map((task: ITask) => (
                                                <div key={task._id as string} className="bg-white rounded-lg p-2 shadow flex flex-col gap-1 border border-indigo-100">
                                                    <div className="flex items-center gap-2 font-semibold text-indigo-800 text-xs">
                                                        {task.status === 'Done' ? <CheckCircleIcon className="w-4 h-4 text-green-500" /> : <ClockIcon className="w-4 h-4 text-yellow-500" />}
                                                        {task.name}
                                                        {canDeleteTask && (
                                                            <button onClick={() => handleDeleteTask(task._id as string)} title="Delete Task" className="ml-auto text-red-500 hover:text-red-700 p-1 rounded">
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="text-gray-600 text-xs">{task.description}</div>
                                                    <div className="text-xs text-gray-500">Assigned to: {typeof task.assignedTo === 'object' && task.assignedTo && 'name' in task.assignedTo ? (task.assignedTo as { name?: string }).name || 'Unassigned' : 'Unassigned'}</div>
                                                    {task.completionDate && <div className="text-xs text-green-600">Completed: {new Date(task.completionDate).toLocaleDateString()}</div>}
                                                    {(canMarkTaskComplete || session?.user.role === 'admin' || session?.user.role === 'owner') && (
                                                        <Select value={task.status} onValueChange={(value) => handleTaskStatusChange(task._id as string, value)}>
                                                            <SelectTrigger className="w-[100px] mt-1 text-xs h-7">
                                                                <SelectValue placeholder="Status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="To Do">To Do</SelectItem>
                                                                <SelectItem value="In Progress">In Progress</SelectItem>
                                                                <SelectItem value="Done">Done</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </div>
                                            )) : <div className="text-gray-400 text-xs">No tasks</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Timeline */}
                        <div className="md:col-span-1">
                            <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
                                <div className="flex items-center gap-2 mb-4 text-blue-700 font-bold text-xl"><ClockIcon className="w-6 h-6" />Activity Timeline</div>
                                <ol className="relative border-l border-indigo-200">
                                    {timeline.length > 0 ? timeline.map((event, idx) => (
                                        <li key={idx} className="mb-8 ml-4">
                                            <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-white border-2 border-indigo-200 rounded-full">
                                                {event.icon}
                                            </span>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-semibold text-gray-800">{event.label}</span>
                                                <span className="text-xs text-gray-500">{event.date.toLocaleDateString()} {event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </li>
                                    )) : <li className="ml-4 text-gray-400">No activity yet</li>}
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase();
};

const getProjectProgress = (tasks: ITask[]) => {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === 'Done').length;
    return Math.round((completed / tasks.length) * 100);
};

const getTaskTimeline = (tasks: ITask[]) => {
    // Flatten events: creation, status changes, completion
    const events: { date: Date, label: string, icon: React.ReactNode, task: ITask }[] = [];
    tasks.forEach(task => {
        events.push({
            date: new Date(task.createdAt),
            label: `Task "${task.name}" created`,
            icon: <ClipboardDocumentListIcon className="w-5 h-5 text-blue-500" />, task
        });
        if (task.status === 'Done' && task.completionDate) {
            events.push({
                date: new Date(task.completionDate),
                label: `Task "${task.name}" completed`,
                icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />, task
            });
        }
        // Optionally, add status change events if you track them
    });
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
};

const groupTasksByStatus = (tasks: ITask[]) => {
    return {
        'To Do': tasks.filter(t => t.status === 'To Do'),
        'In Progress': tasks.filter(t => t.status === 'In Progress'),
        'Done': tasks.filter(t => t.status === 'Done'),
    };
};

export default ProjectDetailsPage; 