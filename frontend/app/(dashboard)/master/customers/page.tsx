'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Building2, UserCircle2, ArrowUpRight, Search, Plus } from 'lucide-react';

export default function CustomersMasterPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCustomers = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/b2b-customers');
                const data = await res.json();
                setCustomers(data);
            } catch (err) {
                console.error("Failed to load customers:", err);
            } finally {
                setLoading(false);
            }
        };
        loadCustomers();
    }, []);

    return (
        <div className="animate-in fade-in duration-500 relative pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                            <Building2 size={24} />
                        </div>
                        B2B Customer Directory
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-lg">
                        Profiles, payment terms, and contact details for all SpiceX wholesale and B2B clients.
                    </p>
                </div>
                
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 group">
                    <Plus size={18} />
                    Register New Client
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                            <tr>
                                <th className="px-6 py-5">Company / Client</th>
                                <th className="px-6 py-5">Contact Person</th>
                                <th className="px-6 py-5">Location</th>
                                <th className="px-6 py-5">Payment Terms</th>
                                <th className="px-6 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                                        No active B2B customers registered.
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 font-black text-xs">
                                                    {customer.company_name.split(' ').map((n: string) => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{customer.company_name}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold">GST: {customer.gst_number || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-slate-700 font-medium">{customer.contact_person}</div>
                                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                <Mail size={10} /> {customer.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-slate-600 text-xs italic">
                                            {customer.billing_address || 'Address unlisted'}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-600">
                                                {customer.payment_terms || 'Standard'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-2 text-slate-400 hover:text-purple-600 transition-colors opacity-0 group-hover:opacity-100">
                                                <ArrowUpRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
