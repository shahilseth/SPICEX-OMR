'use client';

import { useState, useEffect } from 'react';
import { Network, Search, Plus, MapPin, Percent, Phone, ArrowUpRight, ShieldCheck, User } from 'lucide-react';
import { fetchPartners } from '@/lib/api';

export default function PartnersMasterPage() {
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPartners = async () => {
            try {
                const data = await fetchPartners();
                setPartners(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to load partners:", err);
            } finally {
                setLoading(false);
            }
        };
        loadPartners();
    }, []);

    return (
        <div className="animate-in fade-in duration-500 relative pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center">
                            <Network size={24} />
                        </div>
                        Distribution Partners
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-lg">
                        Manage regional distributors, franchisees, and their commercial margins / territory assignments.
                    </p>
                </div>
                
                <button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 group">
                    <Plus size={18} />
                    Onboard Partner
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse h-48"></div>
                    ))
                ) : partners.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-400">
                        No distribution partners onboarded yet.
                    </div>
                ) : (
                    partners.map((partner) => (
                        <div key={partner.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                             <div className="absolute -right-4 -top-4 w-24 h-24 bg-pink-50 rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center pt-4 pr-4">
                                <ArrowUpRight size={24} className="text-pink-200" />
                            </div>

                            <div className="flex items-center gap-4 mb-6 relative">
                                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600 font-black text-xs uppercase shadow-sm border border-pink-100/50">
                                    {partner.partner_type[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 leading-tight truncate">{partner.business_name}</h3>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-pink-500">
                                        {partner.partner_type}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4 relative">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                                        <Percent size={12} /> Commercial Margin
                                    </div>
                                    <div className="font-black text-slate-900">{partner.margin_percentage}%</div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold">
                                        <User size={12} className="text-slate-300" />
                                        <span>Mgr: {partner.assigned_salesperson?.name || 'Unassigned'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 text-[11px] italic truncate">
                                        <MapPin size={12} className="text-slate-300" />
                                        <span>{partner.address || 'Location unlisted'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold text-slate-400">
                                <div className="flex items-center gap-1 uppercase tracking-tighter">
                                    <ShieldCheck size={10} className="text-green-500" /> Verified Partner
                                </div>
                                <div>ID: {partner.id.slice(0, 8).toUpperCase()}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
