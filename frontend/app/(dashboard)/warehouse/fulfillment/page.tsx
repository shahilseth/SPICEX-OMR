'use client';

import { useState, useEffect } from 'react';
import { Truck, CheckCircle2, Package, Send, Box, MapPin, Clock } from 'lucide-react';
import { fetchDispatches, fetchB2BOrders, fetchPartnerOrders } from '@/lib/api';

export default function FulfillmentPage() {
    const [dispatches, setDispatches] = useState<any[]>([]);
    const [pendingB2B, setPendingB2B] = useState<any[]>([]);
    const [pendingPartner, setPendingPartner] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [dispData, b2bData, partnerData] = await Promise.all([
                    fetchDispatches(),
                    fetchB2BOrders(),
                    fetchPartnerOrders(),
                ]);
                setDispatches(Array.isArray(dispData) ? dispData : []);
                setPendingB2B(Array.isArray(b2bData) ? b2bData.filter((o: any) => o.order_status === 'FULFILLED') : []);
                setPendingPartner(Array.isArray(partnerData) ? partnerData.filter((o: any) => o.order_status === 'FULFILLED') : []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const channelColors: Record<string, string> = {
        B2B: 'bg-indigo-100 text-indigo-700',
        DISTRIBUTOR: 'bg-teal-100 text-teal-700',
        FRANCHISEE: 'bg-purple-100 text-purple-700',
        ONLINE: 'bg-cyan-100 text-cyan-700',
    };

    return (
        <div className="animate-in fade-in duration-500 relative pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                            <Truck size={24} />
                        </div>
                        Fulfillment & Dispatch
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-lg">
                        Multi-channel fulfillment hub. View fulfilled orders awaiting dispatch and the complete dispatch register.
                    </p>
                </div>
            </div>

            {/* Awaiting Dispatch */}
            <div className="mb-8">
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Package size={16} /> Awaiting Dispatch ({pendingB2B.length + pendingPartner.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse h-32"></div>
                        ))
                    ) : (pendingB2B.length + pendingPartner.length) === 0 ? (
                        <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-8 text-center">
                            <CheckCircle2 size={48} className="mx-auto mb-3 text-slate-200" />
                            <p className="text-slate-400 font-medium">No orders awaiting dispatch</p>
                        </div>
                    ) : (
                        <>
                            {pendingB2B.map(order => (
                                <div key={order.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-700 px-2 py-1 rounded">B2B</span>
                                        <span className="text-xs font-bold text-slate-400">#{order.id.slice(0, 6).toUpperCase()}</span>
                                    </div>
                                    <div className="font-bold text-slate-900 mb-1">{order.b2b_customers?.company_name || 'Client'}</div>
                                    <div className="text-sm text-slate-500">₹{order.total_amount?.toLocaleString()}</div>
                                    <div className="mt-3 text-xs text-slate-400 flex items-center gap-1">
                                        <MapPin size={10} /> {order.b2b_customers?.shipping_address || 'Address pending'}
                                    </div>
                                </div>
                            ))}
                            {pendingPartner.map(order => (
                                <div key={order.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                                            order.distribution_partners?.partner_type === 'FRANCHISEE' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'
                                        }`}>{order.distribution_partners?.partner_type || 'PARTNER'}</span>
                                        <span className="text-xs font-bold text-slate-400">#{order.id.slice(0, 6).toUpperCase()}</span>
                                    </div>
                                    <div className="font-bold text-slate-900 mb-1">{order.distribution_partners?.business_name || 'Partner'}</div>
                                    <div className="text-sm text-slate-500">₹{order.total_amount?.toLocaleString()}</div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>

            {/* Dispatch Register */}
            <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Send size={16} /> Dispatch Register
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                            <tr>
                                <th className="px-6 py-5">Dispatch ID</th>
                                <th className="px-6 py-5">Channel</th>
                                <th className="px-6 py-5">Destination</th>
                                <th className="px-6 py-5">Transport Details</th>
                                <th className="px-6 py-5">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : dispatches.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                                        No dispatches recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                dispatches.map((d) => (
                                    <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-5 font-mono text-xs font-bold text-slate-900">
                                            #{d.id.slice(0, 8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${channelColors[d.channel] || 'bg-slate-100 text-slate-600'}`}>
                                                {d.channel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-slate-600 font-medium">{d.destination}</td>
                                        <td className="px-6 py-5 text-slate-500 text-xs italic max-w-[300px] truncate">
                                            {d.transport_details || '—'}
                                        </td>
                                        <td className="px-6 py-5 text-slate-500 text-xs flex items-center gap-1">
                                            <Clock size={12} className="text-slate-300" />
                                            {new Date(d.dispatch_date).toLocaleDateString()}
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
