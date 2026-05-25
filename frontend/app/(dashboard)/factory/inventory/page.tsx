'use client';

import { useState, useEffect } from 'react';
import { Layers, Search, Plus, QrCode, ClipboardCheck, History, ArrowUpRight } from 'lucide-react';

export default function BatchesPage() {
    const [batches, setBatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBatches = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/batches');
                const data = await res.json();
                setBatches(data);
            } catch (err) {
                console.error("Failed to load batches:", err);
            } finally {
                setLoading(false);
            }
        };
        loadBatches();
    }, []);

    return (
        <div className="animate-in fade-in duration-500 relative pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center">
                            <Layers size={24} />
                        </div>
                        Production Batches
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-lg">
                        Archive and tracking of all material batches generated during processing. Full farm-to-fork visibility.
                    </p>
                </div>
                
                <div className="flex gap-3">
                    <button className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 group">
                        <QrCode size={18} />
                        Scan Batch QR
                    </button>
                    <button className="bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm hover:bg-slate-50 flex items-center gap-2">
                        <Plus size={18} />
                        Manual Entry
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                            <tr>
                                <th className="px-6 py-5">Batch Code</th>
                                <th className="px-6 py-5">GRN Reference</th>
                                <th className="px-6 py-5">Generated On</th>
                                <th className="px-6 py-5 text-center">Lifecycle Status</th>
                                <th className="px-6 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : batches.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                                        No production batches found.
                                    </td>
                                </tr>
                            ) : (
                                batches.map((batch) => (
                                    <tr key={batch.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5 font-black text-slate-900 tracking-tight">
                                            {batch.batch_code}
                                        </td>
                                        <td className="px-6 py-5 font-mono text-xs text-slate-400">
                                            {batch.grn_id?.slice(0, 8) || 'N/A'}
                                        </td>
                                        <td className="px-6 py-5 text-slate-600">
                                            <div className="flex items-center gap-2 text-xs font-medium">
                                                <History size={12} className="text-slate-300" />
                                                {new Date(batch.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black uppercase rounded-lg ${
                                                batch.status === 'CREATED' ? 'bg-blue-100 text-blue-700' :
                                                batch.status === 'IN_PROCESS' ? 'bg-orange-100 text-orange-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                                {batch.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors opacity-0 group-hover:opacity-100 text-xs font-bold uppercase flex items-center gap-1">
                                                Trace <ArrowUpRight size={14} />
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
