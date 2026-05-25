'use client';

import { useState, useEffect } from 'react';
import { Package, Search, Filter, Warehouse, History, ArrowUpRight } from 'lucide-react';

export default function RawInventoryPage() {
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInventory = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/raw-inventory');
                const data = await res.json();
                setInventory(data);
            } catch (err) {
                console.error("Failed to load raw inventory:", err);
            } finally {
                setLoading(false);
            }
        };
        loadInventory();
    }, []);

    return (
        <div className="animate-in fade-in duration-500 relative pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                            <Warehouse size={24} />
                        </div>
                        Raw Material Inventory
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-lg">
                        Real-time stock levels of all incoming raw materials. Tracked by batch for full traceability.
                    </p>
                </div>
                
                <div className="flex gap-3">
                    <button className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm hover:bg-slate-50 flex items-center gap-2">
                        <History size={18} />
                        Stock History
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Total Raw Stock</p>
                    <h3 className="text-2xl font-black text-slate-900">
                        {inventory.reduce((sum, item) => sum + item.quantity_kg, 0).toLocaleString()} <span className="text-slate-400 font-bold text-sm">kg</span>
                    </h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Active Batches</p>
                    <h3 className="text-2xl font-black text-slate-900">{inventory.length}</h3>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                            <tr>
                                <th className="px-6 py-5">Batch ID</th>
                                <th className="px-6 py-5">Location</th>
                                <th className="px-6 py-5 text-right">Current Stock</th>
                                <th className="px-6 py-5 text-center">Last Updated</th>
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
                            ) : inventory.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                                        No raw material stock found in inventory.
                                    </td>
                                </tr>
                            ) : (
                                inventory.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5 font-mono text-xs font-bold text-slate-900 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            #{item.batch_id.slice(0, 8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-5 text-slate-600 font-medium">
                                            {item.location || 'Unassigned'}
                                        </td>
                                        <td className="px-6 py-5 text-right font-black text-slate-900">
                                            {item.quantity_kg.toLocaleString()} <span className="text-slate-400 font-normal">kg</span>
                                        </td>
                                        <td className="px-6 py-5 text-center text-slate-500 text-xs font-medium">
                                            {new Date(item.recorded_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors opacity-0 group-hover:opacity-100">
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
