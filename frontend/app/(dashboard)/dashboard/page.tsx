'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Box, Factory, ShoppingBag, Truck, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ConnectionTestPanel from '@/components/ConnectionTestPanel';

export default function DashboardPage() {
    const [metrics, setMetrics] = useState({
        totalBatches: 0,
        activeBatches: 0,
        fgItems: 0,
        rmStock: 0,
        processingRuns: 0,
        b2bOrders: 0,
        partnerOrders: 0,
        pendingOrders: 0,
    });
    const [recentBatches, setRecentBatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const safeCount = async (query: PromiseLike<{ count: number | null; error: any }>): Promise<number> => {
            try {
                const { count, error } = await query;
                if (error) return 0;
                return count ?? 0;
            } catch {
                return 0;
            }
        };

        const loadDashboard = async () => {
            try {
                // Core tables (schema.sql) — always available
                const [totalBatches, activeBatches, fgItems] = await Promise.all([
                    safeCount(supabase.from('batches').select('*', { count: 'exact', head: true })),
                    safeCount(supabase.from('batches').select('*', { count: 'exact', head: true }).in('status', ['CREATED', 'IN_PROCESS'])),
                    safeCount(supabase.from('finished_goods_inventory').select('*', { count: 'exact', head: true })),
                ]);

                const { data: recentBatchData } = await supabase
                    .from('batches')
                    .select('id, batch_code, status, created_at')
                    .order('created_at', { ascending: false })
                    .limit(5);

                const { data: rmData } = await supabase
                    .from('raw_material_inventory')
                    .select('quantity_kg');
                const rmStock = (rmData ?? []).reduce((sum: number, r: any) => sum + (Number(r.quantity_kg) || 0), 0);

                // Extended tables (schema_v2.sql) — fail-safe if not yet applied
                const [processingRuns, b2bOrders, b2bPending, partnerOrders, partnerPending] = await Promise.all([
                    safeCount(supabase.from('processing_runs').select('*', { count: 'exact', head: true })),
                    safeCount(supabase.from('b2b_orders').select('*', { count: 'exact', head: true })),
                    safeCount(supabase.from('b2b_orders').select('*', { count: 'exact', head: true }).eq('order_status', 'PENDING')),
                    safeCount(supabase.from('partner_orders').select('*', { count: 'exact', head: true })),
                    safeCount(supabase.from('partner_orders').select('*', { count: 'exact', head: true }).eq('order_status', 'PENDING')),
                ]);

                setMetrics({
                    totalBatches,
                    activeBatches,
                    fgItems,
                    rmStock,
                    processingRuns,
                    b2bOrders,
                    partnerOrders,
                    pendingOrders: b2bPending + partnerPending,
                });
                setRecentBatches(recentBatchData ?? []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    const cards = [
        { label: 'Total Batches', value: metrics.totalBatches, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active Batches', value: metrics.activeBatches, icon: Factory, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'FG Stock Entries', value: metrics.fgItems, icon: Box, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Raw Material (kg)', value: metrics.rmStock.toLocaleString(), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Processing Runs', value: metrics.processingRuns, icon: Factory, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'B2B Orders', value: metrics.b2bOrders, icon: ShoppingBag, color: 'text-violet-600', bg: 'bg-violet-50' },
        { label: 'Partner Orders', value: metrics.partnerOrders, icon: Users, color: 'text-pink-600', bg: 'bg-pink-50' },
        { label: 'Pending Orders', value: metrics.pendingOrders, icon: Truck, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    ];

    return (
        <div className="animate-in fade-in duration-500 relative pb-12">
            <div className="mb-8 pb-4 border-b border-slate-100">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center">
                        <LayoutDashboard size={24} />
                    </div>
                    Operations Dashboard
                </h1>
                <p className="text-slate-500 mt-2">Real-time overview of SpiceX OMS operations across all modules.</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-800 font-bold text-sm">Supabase Error</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                    <p className="text-xs text-red-400 mt-2">Check Supabase RLS policies and table permissions.</p>
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array(8).fill(0).map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse h-28"></div>
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {cards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <div key={card.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{card.label}</p>
                                        <div className={`w-8 h-8 ${card.bg} ${card.color} rounded-lg flex items-center justify-center`}>
                                            <Icon size={16} />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-black text-slate-900">{card.value}</p>
                                </div>
                            );
                        })}
                    </div>

                    {recentBatches.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="font-bold text-slate-800">Recent Batches</h2>
                            </div>
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Batch Code</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentBatches.map((batch: any) => (
                                        <tr key={batch.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-mono font-bold text-slate-900">{batch.batch_code}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black uppercase rounded-lg ${
                                                    batch.status === 'CREATED' ? 'bg-blue-100 text-blue-700' :
                                                    batch.status === 'IN_PROCESS' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                    {batch.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-xs">
                                                {batch.created_at ? new Date(batch.created_at).toLocaleDateString() : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Connection & RBAC Diagnostics */}
                    <div className="mt-8">
                        <ConnectionTestPanel />
                    </div>
                </>
            )}
        </div>
    );
}