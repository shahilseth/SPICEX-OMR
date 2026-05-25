'use client';

import { useState, useEffect } from 'react';
import { PackageCheck, Plus, BarChart3, Package, X } from 'lucide-react';
import { fetchMonthlyPacking, createMonthlyPacking, updateMonthlyPacking, fetchSKUs } from '@/lib/api';

export default function MonthlyPackingPage() {
    const [records, setRecords] = useState<any[]>([]);
    const [skus, setSkus] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ month_year: '', sku_id: '', packed_quantity: '', dispatched_quantity: '' });

    const loadData = async () => {
        try {
            const [packingData, skuData] = await Promise.all([
                fetchMonthlyPacking(),
                fetchSKUs(),
            ]);
            setRecords(Array.isArray(packingData) ? packingData : []);
            setSkus(Array.isArray(skuData) ? skuData : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createMonthlyPacking({
                month_year: form.month_year,
                sku_id: form.sku_id,
                packed_quantity: Number(form.packed_quantity),
                dispatched_quantity: Number(form.dispatched_quantity),
            });
            setShowForm(false);
            setForm({ month_year: '', sku_id: '', packed_quantity: '', dispatched_quantity: '' });
            loadData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Summary
    const totalPacked = records.reduce((s, r) => s + (r.packed_quantity || 0), 0);
    const totalDispatched = records.reduce((s, r) => s + (r.dispatched_quantity || 0), 0);
    const totalBalance = totalPacked - totalDispatched;

    return (
        <div className="animate-in fade-in duration-500 relative pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                            <PackageCheck size={24} />
                        </div>
                        Monthly Packing Summary
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-lg">
                        Track packed vs dispatched quantities per SKU per month. Balance = Packed - Dispatched.
                    </p>
                </div>
                
                <button onClick={() => setShowForm(!showForm)}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                    <Plus size={18} /> Add Record
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-black text-amber-400 uppercase tracking-wider mb-1">Total Packed</p>
                    <h3 className="text-2xl font-black text-slate-900">{totalPacked.toLocaleString()} <span className="text-slate-400 font-bold text-sm">units</span></h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-black text-blue-400 uppercase tracking-wider mb-1">Total Dispatched</p>
                    <h3 className="text-2xl font-black text-slate-900">{totalDispatched.toLocaleString()} <span className="text-slate-400 font-bold text-sm">units</span></h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-1">Balance In Stock</p>
                    <h3 className="text-2xl font-black text-emerald-700">{totalBalance.toLocaleString()} <span className="text-slate-400 font-bold text-sm">units</span></h3>
                </div>
            </div>

            {/* Add Record Form */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                    <h3 className="font-bold text-slate-800 mb-4">New Packing Record</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Month-Year</label>
                            <input required type="month" value={form.month_year} 
                                onChange={e => setForm({ ...form, month_year: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">SKU</label>
                            <select required value={form.sku_id} onChange={e => setForm({ ...form, sku_id: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none">
                                <option value="">Select SKU...</option>
                                {skus.map(s => <option key={s.id} value={s.id}>{s.product_name} — {s.weight_grams}g</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Packed Qty</label>
                            <input required type="number" min="0" value={form.packed_quantity}
                                onChange={e => setForm({ ...form, packed_quantity: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="e.g. 500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dispatched Qty</label>
                            <input required type="number" min="0" value={form.dispatched_quantity}
                                onChange={e => setForm({ ...form, dispatched_quantity: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="e.g. 300" />
                        </div>
                        <div className="flex items-end gap-2">
                            <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm">Save</button>
                            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 px-4 py-2.5 text-sm font-bold">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Records Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                            <tr>
                                <th className="px-6 py-5">Month</th>
                                <th className="px-6 py-5">Product / SKU</th>
                                <th className="px-6 py-5 text-right">Packed</th>
                                <th className="px-6 py-5 text-right">Dispatched</th>
                                <th className="px-6 py-5 text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : records.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                                        No packing records yet. Click "Add Record" above.
                                    </td>
                                </tr>
                            ) : (
                                records.map((r) => (
                                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-5 font-bold text-slate-900">{r.month_year}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <Package size={14} className="text-slate-300" />
                                                <span className="font-medium text-slate-700">
                                                    {r.skus?.product_name || 'SKU'} {r.skus?.weight_grams ? `— ${r.skus.weight_grams}g` : ''}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right font-bold text-amber-700">{r.packed_quantity?.toLocaleString()}</td>
                                        <td className="px-6 py-5 text-right font-bold text-blue-700">{r.dispatched_quantity?.toLocaleString()}</td>
                                        <td className="px-6 py-5 text-right">
                                            <span className={`font-black ${r.balance_in_stock > 0 ? 'text-emerald-600' : r.balance_in_stock === 0 ? 'text-slate-400' : 'text-red-600'}`}>
                                                {r.balance_in_stock?.toLocaleString()}
                                            </span>
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
