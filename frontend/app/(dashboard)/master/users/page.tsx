'use client';

import { useState, useEffect } from 'react';
import { UserCircle2, Mail, ShieldCheck, MapPin, MoreVertical, Plus, BadgeCheck } from 'lucide-react';

export default function UsersMasterPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/users');
                const data = await res.json();
                setUsers(data);
            } catch (err) {
                console.error("Failed to load users:", err);
            } finally {
                setLoading(false);
            }
        };
        loadUsers();
    }, []);

    return (
        <div className="animate-in fade-in duration-500 relative pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center">
                            <ShieldCheck size={24} />
                        </div>
                        IAM & User Access
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-lg">
                        Manage system operators, role-based access control (RBAC), and regional location assignments.
                    </p>
                </div>
                
                <button className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 group">
                    <Plus size={18} />
                    Invite Team Member
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse h-48"></div>
                    ))
                ) : users.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-400">
                        No team members registered.
                    </div>
                ) : (
                    users.map((user) => (
                        <div key={user.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-800 border border-slate-100 relative shadow-inner">
                                    <UserCircle2 size={32} strokeWidth={1.5} />
                                    {user.is_active && (
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full" />
                                    )}
                                </div>
                                <button className="p-2 text-slate-300 hover:text-slate-800 transition-colors">
                                    <MoreVertical size={20} />
                                </button>
                            </div>

                            <div className="mb-6">
                                <h3 className="font-bold text-slate-900 text-lg leading-tight flex items-center gap-2">
                                    {user.name}
                                    {user.role === 'ADMIN' && <BadgeCheck size={16} className="text-blue-500" />}
                                </h3>
                                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
                                    {user.role}
                                </div>
                            </div>

                            <div className="space-y-3 pt-6 border-t border-slate-50">
                                <div className="flex items-center gap-3 text-slate-500 text-xs font-medium">
                                    <Mail size={14} className="shrink-0" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500 text-xs font-medium">
                                    <MapPin size={14} className="shrink-0" />
                                    <span>{user.location || 'Remote/Unset'}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
