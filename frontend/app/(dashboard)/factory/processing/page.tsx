'use client';

import { useState, useEffect } from 'react';
import { Factory, Play, CheckCircle2, Thermometer, Clock, ArrowUpRight, X, Zap } from 'lucide-react';
import { fetchProcessingRuns, fetchBatches, fetchSKUs, createProcessingRun, completeProcessingRun } from '@/lib/api';

export default function ProcessingPage() {
    const [runs, setRuns] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [skus, setSkus] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [completing, setCompleting] = useState<string | null>(null);
    const [completeForm, setCompleteForm] = useState({ dry_weight_kg: '', sku_id: '', location: 'FG Warehouse' });

    const [form, setForm] = useState({
        batch_id: '',
        machine_type: 'DEHYDRATOR',
        fresh_weight_kg: '',
        slice_weight_kg: '',
        drying_time_hours: '',
    });

    const loadData = async () => {
        try {
            const [runsData, batchData, skuData] = await Promise.all([
                fetchProcessingRuns(),
                fetchBatches(),
                fetchSKUs(),
            ]);
            setRuns(Array.isArray(runsData) ? runsData : []);
            setBatches(Array.isArray(batchData) ? batchData.filter((b: any) => b.status === 'CREATED' || b.status === 'IN_PROCESS') : []);
            setSkus(Array.isArray(skuData) ? skuData : []);
        } catch (err) {
            console.error("Failed to load data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createProcessingRun({
                batch_id: form.batch_id,
                machine_type: form.machine_type,
                fresh_weight_kg: Number(form.fresh_weight_kg),
                slice_weight_kg: form.slice_weight_kg ? Number(form.slice_weight_kg) : null,
                drying_time_hours: form.drying_time_hours ? Number(form.drying_time_hours) : null,
            });
            setShowForm(false);
            setForm({ batch_id: '', machine_type: 'DEHYDRATOR', fresh_weight_kg: '', slice_weight_kg: '', drying_time_hours: '' });
            loadData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleComplete = async (runId: string) => {
        try {
            await completeProcessingRun(runId, {
                dry_weight_kg: Number(completeForm.dry_weight_kg),
                sku_id: completeForm.sku_id || null,
                location: completeForm.location,
            });
            setCompleting(null);
            setCompleteForm({ dry_weight_kg: '', sku_id: '', location: 'FG Warehouse' });
            loadData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const conversionRate = (run: any) => {
        if (!run.fresh_weight_kg || !run.dry_weight_kg) return null;
        return ((run.dry_weight_kg / run.fresh_weight_kg) * 100).toFixed(1);
    };

    return (
        <div className="animate-in fade-in duration-500 relative pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                            <Factory size={24} />
                        </div>
                        Processing & Drying
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-lg">
                        Track fresh weight → slice weight → dry weight conversions. Link each run to a batch for full traceability.
                    </p>
                </div>
                
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                    <Play size={18} />
                    Start New Run
                </button>
            </div>

            {/* Create Processing Run Form */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                    <h3 className="font-bold text-slate-800 mb-4">New Processing Run</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Batch</label>
                            <select required value={form.batch_id} onChange={e => setForm({ ...form, batch_id: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none">
                                <option value="">Select Batch...</option>
                                {batches.map(b => <option key={b.id} value={b.id}>{b.batch_code}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Machine Type</label>
                            <select required value={form.machine_type} onChange={e => setForm({ ...form, machine_type: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none">
                                <option value="DEHYDRATOR">Dehydrator</option>
                                <option value="SOLAR_TUNNEL_DRYER">Solar Tunnel Dryer</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fresh Weight (kg)</label>
                            <input required type="number" step="0.01" value={form.fresh_weight_kg} 
                                onChange={e => setForm({ ...form, fresh_weight_kg: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                                placeholder="e.g. 100" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Slice Weight (kg) <span className="text-slate-300">optional</span></label>
                            <input type="number" step="0.01" value={form.slice_weight_kg}
                                onChange={e => setForm({ ...form, slice_weight_kg: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                                placeholder="After slicing" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Drying Time (hours) <span className="text-slate-300">optional</span></label>
                            <input type="number" step="0.5" value={form.drying_time_hours}
                                onChange={e => setForm({ ...form, drying_time_hours: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                                placeholder="e.g. 24" />
                        </div>
                        <div className="flex items-end gap-2">
                            <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all">
                                Start Run
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 px-4 py-2.5 text-sm font-bold">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                            <tr>
                                <th className="px-6 py-5">Run / Machine</th>
                                <th className="px-6 py-5">Batch</th>
                                <th className="px-6 py-5 text-right">Fresh Wt</th>
                                <th className="px-6 py-5 text-right">Slice Wt</th>
                                <th className="px-6 py-5 text-right">Dry Wt</th>
                                <th className="px-6 py-5 text-center">Duration</th>
                                <th className="px-6 py-5 text-center">Yield %</th>
                                <th className="px-6 py-5 text-center">Status</th>
                                <th className="px-6 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={9} className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : runs.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-16 text-center text-slate-400">
                                        No processing runs found. Click "Start New Run" to begin.
                                    </td>
                                </tr>
                            ) : (
                                runs.map((run) => (
                                    <tr key={run.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                                                    <Thermometer size={16} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{run.machine_type?.replace('_', ' ')}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">#{run.id.slice(0, 6).toUpperCase()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 font-mono text-xs text-slate-600">
                                            {run.batches?.batch_code || '---'}
                                        </td>
                                        <td className="px-6 py-5 text-right font-bold text-slate-800">
                                            {run.fresh_weight_kg} <span className="text-slate-400 font-normal">kg</span>
                                        </td>
                                        <td className="px-6 py-5 text-right text-slate-600">
                                            {run.slice_weight_kg || '—'} {run.slice_weight_kg && <span className="text-slate-400 font-normal">kg</span>}
                                        </td>
                                        <td className="px-6 py-5 text-right font-black text-emerald-700">
                                            {run.dry_weight_kg || '??'} <span className="text-slate-400 font-normal">kg</span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex items-center justify-center gap-2 text-slate-500 font-bold text-xs">
                                                <Clock size={12} />
                                                {run.drying_time_hours || '--'} hrs
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            {conversionRate(run) ? (
                                                <span className="font-black text-emerald-600">{conversionRate(run)}%</span>
                                            ) : (
                                                <span className="text-slate-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black uppercase rounded-lg ${
                                                run.completed_at ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                                {run.completed_at ? 'COMPLETED' : 'IN PROGRESS'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {!run.completed_at && (
                                                <button 
                                                    onClick={() => { setCompleting(run.id); setCompleteForm({ ...completeForm, dry_weight_kg: '' }); }}
                                                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1 transition-colors ml-auto"
                                                >
                                                    <CheckCircle2 size={14} /> Mark Complete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Complete Run Modal */}
            {completing && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Zap size={18} className="text-emerald-600" /> Complete Processing Run
                            </h3>
                            <button onClick={() => setCompleting(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dry Weight (kg)</label>
                                <input required type="number" step="0.01" value={completeForm.dry_weight_kg}
                                    onChange={e => setCompleteForm({ ...completeForm, dry_weight_kg: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none"
                                    placeholder="Final dry weight after processing" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Output SKU</label>
                                <select value={completeForm.sku_id} onChange={e => setCompleteForm({ ...completeForm, sku_id: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none">
                                    <option value="">Select SKU (optional)...</option>
                                    {skus.map(s => <option key={s.id} value={s.id}>{s.product_name} — {s.weight_grams}g</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">FG Location</label>
                                <input value={completeForm.location}
                                    onChange={e => setCompleteForm({ ...completeForm, location: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none"
                                    placeholder="FG Warehouse" />
                            </div>
                            <button onClick={() => handleComplete(completing)}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all">
                                Complete & Generate FG Inventory
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
