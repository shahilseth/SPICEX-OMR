'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Plus, Search, Filter, ArrowUpRight } from 'lucide-react';
import { fetchPurchaseOrders } from '@/lib/api';

export default function POListPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPOs = async () => {
            try {
                const data = await fetchPurchaseOrders();
                if (Array.isArray(data)) {
                    setOrders(data);
                } else {
                    console.error("Data received is not an array:", data);
                    setOrders([]);
                }
            } catch (err) {
                console.error("Failed to load POs:", err);
            } finally {
                setLoading(false);
            }
        };
        loadPOs();
    }, []);

    return (
        <div className="animate-in fade-in duration-500 relative pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                            <Package size={24} />
                        </div>
                        Purchase Orders
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-lg">
                        Manage active procurement cycles with farmers, FPOs, and vendors. Track expected deliveries and sourcing costs.
                    </p>
                </div>
                
                <Link
                    href="/procurement/po/create"
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 group"
                >
                    <Plus size={18} />
                    Issue New PO
                </Link>
            </div>

            {/* Filters/Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by PO#, Supplier, or Product..." 
                        className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                    />
                </div>
                <button className="px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                    <Filter size={18} />
                    Filters
                </button>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                            <tr>
                                <th className="px-6 py-5">PO Number</th>
                                <th className="px-6 py-5">Supplier</th>
                                <th className="px-6 py-5">Material (Type)</th>
                                <th className="px-6 py-5 text-right">Quantity</th>
                                <th className="px-6 py-5 text-right">Value (Rp)</th>
                                <th className="px-6 py-5 text-center">Status</th>
                                <th className="px-6 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-40">
                                            <Package size={48} className="mb-4" />
                                            <p className="text-lg font-medium">No purchase orders found</p>
                                            <p className="text-sm">Click 'Issue New PO' to start your first sourcing cycle.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((po) => (
                                    <tr key={po.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5 font-bold text-slate-900">
                                            {po.po_number || `PO-${po.id.slice(0, 8).toUpperCase()}`}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="font-medium text-slate-800">{po.suppliers?.name || 'Self Pickup'}</div>
                                            <div className="text-xs text-slate-400">ID: {po.supplier_id.slice(0, 8)}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="font-medium text-slate-800">{po.product}</div>
                                            <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded inline-block mt-1 ${po.material_type === 'FRESH' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {po.material_type}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right font-black text-slate-900">
                                            {po.quantity_kg.toLocaleString()} <span className="text-slate-400 font-normal">kg</span>
                                        </td>
                                        <td className="px-6 py-5 text-right font-bold text-slate-700">
                                            Rp {(po.quantity_kg * po.rate_per_kg).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${
                                                po.status === 'CREATED' || po.status === 'PENDING' ? 'bg-blue-100 text-blue-700' :
                                                po.status === 'RECEIVED' ? 'bg-green-100 text-green-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                                                    po.status === 'CREATED' || po.status === 'PENDING' ? 'bg-blue-500' :
                                                    po.status === 'RECEIVED' ? 'bg-green-500' :
                                                    'bg-slate-400'
                                                }`} />
                                                {po.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-2 text-slate-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
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
            
            {/* Quick Stats Footnote */}
            {!loading && orders.length > 0 && (
                <div className="mt-6 flex gap-8">
                    <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Total Active Volume</span>
                        <span className="text-lg font-black text-slate-800">
                            {orders.reduce((sum, po) => sum + po.quantity_kg, 0).toLocaleString()} <small className="font-normal text-slate-400">kg</small>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
