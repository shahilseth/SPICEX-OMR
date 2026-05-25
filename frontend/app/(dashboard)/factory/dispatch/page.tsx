'use client';

import { useState, useEffect } from 'react';
import { Truck, CheckCircle2, Box, Send, AlertCircle } from 'lucide-react';
import { fetchB2BOrders, fetchPartnerOrders, dispatchB2BOrder, dispatchPartnerOrder } from '@/lib/api';

export default function FactoryDispatchPage() {
    const [b2bOrders, setB2bOrders] = useState<any[]>([]);
    const [partnerOrders, setPartnerOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    const loadOrders = async () => {
        try {
            const [b2b, partner] = await Promise.all([
                fetchB2BOrders(),
                fetchPartnerOrders(),
            ]);
            setB2bOrders(Array.isArray(b2b) ? b2b.filter((o: any) => o.order_status === 'FULFILLED') : []);
            setPartnerOrders(Array.isArray(partner) ? partner.filter((o: any) => o.order_status === 'FULFILLED') : []);
        } catch (err) {
            console.error("Failed to load orders:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadOrders(); }, []);

    const handleDispatch = async (orderId: string, type: 'b2b' | 'partner', partnerType?: string) => {
        const transport = prompt("Enter courier/transport details:");
        if (!transport) return;
        setProcessing(orderId);
        try {
            if (type === 'b2b') {
                await dispatchB2BOrder(orderId, { transport_details: transport, destination: 'Client Address' });
            } else {
                await dispatchPartnerOrder(orderId, { transport_details: transport, partner_type: partnerType });
            }
            loadOrders();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setProcessing(null);
        }
    };

    const allOrders = [
        ...b2bOrders.map(o => ({ ...o, _type: 'b2b' as const, _label: o.b2b_customers?.company_name || 'B2B Client' })),
        ...partnerOrders.map(o => ({ ...o, _type: 'partner' as const, _label: o.distribution_partners?.business_name || 'Partner' })),
    ];

    return (
        <div className="animate-in fade-in duration-500 relative pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Truck size={24} />
                        </div>
                        Factory Dispatch
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-lg">
                        Coordinate outbound logistics of Finished Goods to warehouses or direct clients. Shows orders that are "Fulfilled" and ready for dispatch.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <Box className="text-indigo-500" size={18} />
                        Ready for Dispatch ({allOrders.length})
                    </h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                            <tr>
                                <th className="px-6 py-5">Order ID</th>
                                <th className="px-6 py-5">Type</th>
                                <th className="px-6 py-5">Client / Destination</th>
                                <th className="px-6 py-5">Value</th>
                                <th className="px-6 py-5 text-center">Payment</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : allOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-40">
                                            <CheckCircle2 size={48} className="mb-4 text-slate-400" />
                                            <p className="text-lg font-medium text-slate-500">No shipments pending</p>
                                            <p className="text-sm text-slate-400">All fulfilled orders have been dispatched.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                allOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5 font-bold text-slate-900">
                                            #{order.id.slice(0, 6).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                                                order._type === 'b2b' ? 'bg-indigo-100 text-indigo-700' : 'bg-pink-100 text-pink-700'
                                            }`}>
                                                {order._type === 'b2b' ? 'B2B' : order.distribution_partners?.partner_type || 'PARTNER'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-slate-700">{order._label}</div>
                                        </td>
                                        <td className="px-6 py-5 font-black text-slate-900">
                                            ₹{order.total_amount?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black uppercase rounded-lg ${
                                                order.payment_status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                order.payment_status === 'PARTIAL' ? 'bg-orange-100 text-orange-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {processing === order.id ? (
                                                <span className="text-xs font-bold text-slate-400">Processing...</span>
                                            ) : (
                                                <button 
                                                    onClick={() => handleDispatch(
                                                        order.id, 
                                                        order._type,
                                                        order._type === 'partner' ? order.distribution_partners?.partner_type : undefined
                                                    )}
                                                    className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl font-bold text-xs uppercase flex items-center justify-end gap-2 transition-all ml-auto group-hover:shadow-md"
                                                >
                                                    <Send size={14} /> Dispatch
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
            
            <div className="mt-8 bg-slate-800 rounded-2xl p-6 text-white text-sm">
                <h4 className="font-bold flex items-center gap-2 mb-2"><AlertCircle size={16}/> Dispatch Requirements</h4>
                <p className="text-slate-400">
                    Dispatching an order creates an entry in the <strong className="text-white">Dispatch Register</strong> and updates the order status to <strong className="text-white">DISPATCHED</strong>.
                </p>
            </div>
        </div>
    );
}
