'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClipboardCheck, Plus, Search, Filter, Calendar, Tag } from 'lucide-react';

export default function GRNListPage() {
    // Note: Use the real API call here if available, otherwise mock data for list
    const [grns, setGrns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadGRNs = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/grns');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setGrns(data);
                } else {
                    console.error("Data received is not an array:", data);
                    setGrns([]);
                }
            } catch (err) {
                console.error("Failed to load GRNs:", err);
            } finally {
                setLoading(false);
            }
        };
        loadGRNs();
    }, []);

    return (
        <div className="animate-in fade-in duration-500 relative pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <ClipboardCheck size={24} />
                        </div>
                        Goods Receipt Notes (GRN)
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-lg">
                        Track incoming material inventory, quality status, and inwarding records (In-Gate / GRN).
                    </p>
                </div>
                
                <Link
                    href="/procurement/grn/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 group"
                >
                    <Plus size={18} />
                    New Goods Receipt
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by GRN#, PO Reference..." 
                        className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                            <tr>
                                <th className="px-6 py-5">GRN Code</th>
                                <th className="px-6 py-5">PO Reference</th>
                                <th className="px-6 py-5">Date Received</th>
                                <th className="px-6 py-5 text-right">Received Qty</th>
                                <th className="px-6 py-5 text-center">Quality Status</th>
                                <th className="px-6 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : grns.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-40">
                                            <ClipboardCheck size={48} className="mb-4" />
                                            <p className="text-lg font-medium">No goods receipts found</p>
                                            <p className="text-sm">New materials arriving? Create a GRN to record them.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                grns.map((grn) => (
                                    <tr key={grn.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5 font-bold text-slate-900">
                                            GRN-{grn.id.slice(0, 8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-5 font-mono text-xs text-blue-600">
                                            {grn.po_id.slice(0, 8)}...
                                        </td>
                                        <td className="px-6 py-5 text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-400" />
                                                {new Date(grn.received_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right font-black text-slate-900">
                                            {grn.received_quantity_kg.toLocaleString()} <span className="text-slate-400 font-normal">kg</span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black uppercase rounded-lg ${
                                                grn.quality_status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                grn.quality_status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                'bg-orange-100 text-orange-700'
                                            }`}>
                                                {grn.quality_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="px-3 py-1.5 bg-slate-50 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all font-bold text-[10px] uppercase">
                                                Details
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
