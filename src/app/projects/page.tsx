"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusIcon, StarIcon, UserGroupIcon, ArrowsUpDownIcon, TrashIcon, ArrowUturnUpIcon } from '@heroicons/react/24/outline';
import { IProject } from '@/models/projectModel';

const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase();
};

const ProjectsPage = () => {
    const [projects, setProjects] = useState<IProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<'name' | 'startDate' | 'endDate' | 'clientName'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (error) {
            console.error('Failed to fetch projects', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check authentication
        fetch('/api/user/profile', { credentials: 'include' })
            .then(res => {
                if (res.ok) {
                    setIsAuthenticated(true);
                    fetchProjects();
                } else {
                    setIsAuthenticated(false);
                }
            });
    }, []);

    const filteredProjects = useMemo(() => {
        let filtered = projects.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.clientName.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase())
        );
        if (statusFilter === 'active') filtered = filtered.filter(p => !p.isArchived);
        if (statusFilter === 'archived') filtered = filtered.filter(p => p.isArchived);
        filtered = filtered.sort((a, b) => {
            let aVal = a[sort];
            let bVal = b[sort];
            if (sort === 'name' || sort === 'clientName') {
                aVal = (aVal as string).toLowerCase();
                bVal = (bVal as string).toLowerCase();
            }
            if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return filtered;
    }, [projects, search, sort, sortDir, statusFilter]);

    const toggleFavorite = (id: string) => {
        setFavorites(favs => favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id]);
    };

    const handleArchive = async (id: string) => {
        try {
            const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchProjects();
            }
        } catch {}
    };

    const handleUnarchive = async (id: string) => {
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isArchived: false }),
            });
            if (res.ok) {
                await fetchProjects();
            }
        } catch {}
    };

    if (loading) {
        return <div>Loading...</div>;
    }
    if (!isAuthenticated) {
        return <div>Not authenticated. Please <a href="/signup">sign in</a>.</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white pb-16">
            {/* Header */}
            <div className="max-w-6xl mx-auto mt-8 mb-6 px-4">
                <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 py-6 px-6 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow tracking-tight">Projects</h1>
                    <div className="flex gap-2 items-center">
                        <Link href="/projects/create">
                            <Button className="bg-white/90 hover:bg-white text-blue-700 font-bold shadow flex items-center gap-2 px-5 py-2 rounded-lg text-base transition-transform hover:scale-105">
                                <PlusIcon className="w-5 h-5" /> Create Project
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
            {/* Controls */}
            <div className="max-w-6xl mx-auto mb-8 px-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <Input
                        className="w-full md:w-80 bg-white shadow rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-200 text-base px-4 py-2"
                        placeholder="Search projects..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <div className="flex gap-2 items-center flex-wrap mt-2 md:mt-0">
                        <Button variant={statusFilter === 'all' ? 'default' : 'outline'} className="rounded-lg px-3 py-1.5 text-sm" onClick={() => setStatusFilter('all')}>All</Button>
                        <Button variant={statusFilter === 'active' ? 'default' : 'outline'} className="rounded-lg px-3 py-1.5 text-sm" onClick={() => setStatusFilter('active')}>Active</Button>
                        <Button variant={statusFilter === 'archived' ? 'default' : 'outline'} className="rounded-lg px-3 py-1.5 text-sm" onClick={() => setStatusFilter('archived')}>Archived</Button>
                        <Button variant="outline" className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm" onClick={() => { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>
                            <ArrowsUpDownIcon className="w-4 h-4" />
                            {sort.charAt(0).toUpperCase() + sort.slice(1)}
                        </Button>
                        <select
                            className="ml-2 rounded-lg border-gray-300 text-sm px-2 py-1 bg-white shadow focus:ring-2 focus:ring-blue-200"
                            value={sort}
                            onChange={e => setSort(e.target.value as 'name' | 'startDate' | 'endDate' | 'clientName')}
                        >
                            <option value="name">Name</option>
                            <option value="startDate">Start Date</option>
                            <option value="endDate">End Date</option>
                            <option value="clientName">Client</option>
                        </select>
                    </div>
                </div>
            </div>
            {/* Projects Apple-like Card Container */}
            <div className="max-w-6xl mx-auto px-2 md:px-0">
                <div className="bg-white/90 rounded-3xl shadow-2xl p-6 md:p-10 flex flex-col gap-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => (
                            <div key={project._id as string} className="relative group transition-transform hover:scale-[1.02]">
                                {/* Favorite Star */}
                                <button
                                    className={`absolute top-3 right-3 z-10 rounded-full p-1.5 bg-white/90 hover:bg-yellow-100 shadow transition-colors duration-200 ${favorites.includes(project._id as string) ? 'text-yellow-400' : 'text-gray-300'}`}
                                    onClick={e => { e.stopPropagation(); e.preventDefault(); toggleFavorite(project._id as string); }}
                                    title={favorites.includes(project._id as string) ? 'Unfavorite' : 'Favorite'}
                                >
                                    <StarIcon className="w-5 h-5" />
                                </button>
                                {/* Archive Button for Active Projects */}
                                {!project.isArchived && statusFilter !== 'archived' && (
                                    <button
                                        className="absolute top-3 left-3 z-10 rounded-full p-1.5 bg-white/90 hover:bg-red-100 shadow transition-colors duration-200 text-gray-400 hover:text-red-500"
                                        onClick={e => { e.stopPropagation(); e.preventDefault(); handleArchive(project._id as string); }}
                                        title="Archive Project"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                )}
                                {/* Unarchive Button for Archived Projects */}
                                {project.isArchived && statusFilter === 'archived' && (
                                    <button
                                        className="absolute top-3 left-3 z-10 rounded-full p-1.5 bg-white/90 hover:bg-green-100 shadow transition-colors duration-200 text-gray-400 hover:text-green-600"
                                        onClick={e => { e.stopPropagation(); e.preventDefault(); handleUnarchive(project._id as string); }}
                                        title="Unarchive Project"
                                    >
                                        <ArrowUturnUpIcon className="w-5 h-5" />
                                    </button>
                                )}
                                <Link href={`/projects/${project._id}`} className="block">
                                    <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer rounded-2xl border border-gray-100 bg-white group-hover:-translate-y-1 group-hover:scale-[1.01] shadow overflow-hidden p-4 flex flex-col gap-2 min-h-[210px]">
                                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-400 rounded-t-2xl" />
                                        <CardHeader className="pb-1">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-lg font-semibold flex-1 text-blue-900 group-hover:text-indigo-700 transition-colors duration-200 truncate">{project.name}</CardTitle>
                                                {/* Status Badge */}
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold shadow ${project.isArchived ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                                                    {project.isArchived ? 'Archived' : 'Active'}
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex flex-col gap-1">
                                            <p className="text-gray-600 mb-1 min-h-[32px] text-sm line-clamp-2">{project.description}</p>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs text-gray-500"><b>Client:</b> {project.clientName}</span>
                                            </div>
                                            <div className="flex gap-4 text-xs text-gray-500 mb-1">
                                                <span><b>Start:</b> {new Date(project.startDate).toLocaleDateString()}</span>
                                                <span><b>End:</b> {new Date(project.endDate).toLocaleDateString()}</span>
                                            </div>
                                            {/* Team Avatars */}
                                            <div className="flex items-center gap-1 mb-1">
                                                <UserGroupIcon className="w-4 h-4 text-blue-400" />
                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs shadow">
                                                    {getInitials(typeof project.projectHead === 'object' && project.projectHead && 'name' in project.projectHead ? (project.projectHead as { name?: string }).name || 'PH' : 'PH')}
                                                </span>
                                                {Array.isArray(project.employees) && project.employees.slice(0, 2).map((e: unknown, index: number) => {
                                                    const employee = e as { _id: string; name?: string };
                                                    return (
                                                        <span key={employee._id || index} className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shadow -ml-2 border-2 border-white">
                                                            {getInitials(employee.name || 'E')}
                                                        </span>
                                                    );
                                                })}
                                                {Array.isArray(project.employees) && project.employees.length > 2 && (
                                                    <span className="ml-1 text-xs text-gray-400">+{project.employees.length - 2}</span>
                                                )}
                                            </div>
                                            {/* Progress Bar (if tasks available) */}
                                            {Array.isArray(project.tasks) && project.tasks.length > 0 ? (
                                                <div className="mb-1">
                                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-0.5">
                                                        <span>Progress</span>
                                                        <span>{Math.round(((project.tasks as unknown as { status: string }[]).filter(t => t.status === 'Done').length / project.tasks.length) * 100)}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                        <div className="bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.round(((project.tasks as unknown as { status: string }[]).filter(t => t.status === 'Done').length / project.tasks.length) * 100)}%` }}></div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mb-1 text-xs text-gray-400">No tasks yet</div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Link>
                            </div>
                        ))}
                        {filteredProjects.length === 0 && (
                            <div className="col-span-full text-center py-16 flex flex-col items-center">
                                <svg width="60" height="60" fill="none" viewBox="0 0 80 80" className="mb-3">
                                    <circle cx="40" cy="40" r="38" stroke="#6366f1" strokeWidth="4" fill="#f1f5ff" />
                                    <path d="M25 40h30M40 25v30" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
                                </svg>
                                <div className="text-xl font-bold text-indigo-400 mb-1">No projects found</div>
                                <div className="text-sm text-gray-400 mb-4">Start by creating your first project!</div>
                                <Link href="/projects/create">
                                    <Button className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 text-white font-bold px-5 py-2 rounded-lg shadow hover:scale-105 transition-transform text-base">Create Project</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectsPage;