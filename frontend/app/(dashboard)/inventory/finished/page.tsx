'use client';

import { useState, useEffect } from 'react';
import { Box, Package, ShoppingCart, History, ArrowUpRight, Info, MapPin } from 'lucide-react';
import { fetchFinishedGoods, fetchTraceability } from '@/lib/api';

export default function FinishedGoodsInventoryPage() {
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [traceData, setTraceData] = useState<any>(null);

    useEffect(() => {
        const loadInventory = async () => {
            try {
                const data = await fetchFinishedGoods();
                setInventory(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to load FG inventory:", err);
            } finally {
                setLoading(false);
            }
        };
        loadInventory();
    }, []);

    const handleTrace = async (fgId: string) => {
        try {
            const data = await fetchTraceability(fgId);
            setTraceData(data);
        } catch (err) {
            console.error("Traceability error:", err);
        }
    };

    const totalKg = inventory.reduce((sum, item) => sum + (item.quantity_kg || 0), 0);

    return (
        <div className="animate-in fade-in duration-500 relative pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Box size={24} />
                        </div>
                        Finished Goods Inventory
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-lg">
                        Processed products ready for packaging and dispatch. Click "Trace" to see the source batch, GRN and supplier.
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Total FG Stock</p>
                    <h3 className="text-2xl font-black text-slate-900">
                        {totalKg.toLocaleString()} <span className="text-slate-400 font-bold text-sm">kg</span>
                    </h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Stock Entries</p>
                    <h3 className="text-2xl font-black text-slate-900">{inventory.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Unique SKUs</p>
                    <h3 className="text-2xl font-black text-slate-900">
                        {new Set(inventory.filter(i => i.sku_id).map(i => i.sku_id)).size}
                    </h3>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                            <tr>
                                <th className="px-6 py-5">Product / SKU</th>
                                <th className="px-6 py-5">Batch</th>
                                <th className="px-6 py-5">Warehouse</th>
                                <th className="px-6 py-5 text-right">Available Qty</th>
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
                                        No finished goods found in warehouse.
                                    </td>
                                </tr>
                            ) : (
                                inventory.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                                    <Package size={16} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">
                                                        {item.skus?.product_name || item.product || 'Processed Product'}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                        {item.skus ? `${item.skus.weight_grams}g · ₹${item.skus.mrp}` : `SKU: ${item.sku_id?.slice(0, 8) || 'N/A'}`}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 font-mono text-xs text-slate-600">
                                            {item.batches?.batch_code || `#${item.batch_id?.slice(0, 8).toUpperCase()}`}
                                        </td>
                                        <td className="px-6 py-5 text-slate-600 font-medium flex items-center gap-1">
                                            <MapPin size={12} className="text-slate-300" />
                                            {item.location || 'Central Warehouse'}
                                        </td>
                                        <td className="px-6 py-5 text-right font-black text-slate-900">
                                            {item.quantity_kg?.toLocaleString()} <span className="text-slate-400 font-normal">kg</span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button 
                                                onClick={() => handleTrace(item.id)}
                                                className="px-3 py-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 text-xs font-bold uppercase flex items-center gap-1 ml-auto"
                                            >
                                                <Info size={14} /> Trace
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Traceability Modal */}
            {traceData && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setTraceData(null)}>
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                            <ArrowUpRight size={18} className="text-indigo-600" /> Batch Traceability
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="bg-indigo-50 p-4 rounded-xl">
                                <p className="text-xs font-black uppercase text-indigo-400 mb-1">Finished Good</p>
                                <p className="font-bold text-indigo-900">
                                    {traceData.finished_good?.skus?.product_name || 'Product'} — {traceData.finished_good?.quantity_kg}kg
                                </p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl">
                                <p className="text-xs font-black uppercase text-slate-400 mb-1">Batch</p>
                                <p className="font-bold text-slate-900">{traceData.batch?.batch_code || 'N/A'}</p>
                                <p className="text-xs text-slate-500">Status: {traceData.batch?.status}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl">
                                <p className="text-xs font-black uppercase text-slate-400 mb-1">GRN → Purchase Order → Supplier</p>
                                <p className="font-bold text-slate-900">
                                    GRN: {traceData.grn?.received_quantity_kg}kg received
                                </p>
                                <p className="text-xs text-slate-500">
                                    PO: {traceData.grn?.purchase_orders?.product} | Supplier: {traceData.grn?.purchase_orders?.suppliers?.name || 'Unknown'}
                                </p>
                            </div>
                            {traceData.processing_runs && traceData.processing_runs.length > 0 && (
                                <div className="bg-orange-50 p-4 rounded-xl">
                                    <p className="text-xs font-black uppercase text-orange-400 mb-1">Processing Runs ({traceData.processing_runs.length})</p>
                                    {traceData.processing_runs.map((r: any) => (
                                        <p key={r.id} className="text-xs text-orange-800">
                                            {r.machine_type}: {r.fresh_weight_kg}kg fresh → {r.dry_weight_kg || '?'}kg dry ({r.drying_time_hours || '?'}hrs)
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={() => setTraceData(null)} className="mt-4 w-full text-center text-sm font-bold text-slate-400 hover:text-slate-600">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
