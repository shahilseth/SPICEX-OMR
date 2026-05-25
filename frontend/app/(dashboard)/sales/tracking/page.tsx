'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, Package, Truck, CheckCircle, Clock, DollarSign, ArrowRight } from 'lucide-react';
import { fetchB2BOrders, fetchPartnerOrders, fetchDispatches } from '@/lib/api';

export default function OrderTrackingPage() {
    const [b2bOrders, setB2bOrders] = useState<any[]>([]);
    const [partnerOrders, setPartnerOrders] = useState<any[]>([]);
    const [dispatches, setDispatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'b2b' | 'partner'>('b2b');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [b2b, partner, disp] = await Promise.all([
                    fetchB2BOrders(),
                    fetchPartnerOrders(),
                    fetchDispatches(),
                ]);
                setB2bOrders(Array.isArray(b2b) ? b2b : []);
                setPartnerOrders(Array.isArray(partner) ? partner : []);
                setDispatches(Array.isArray(disp) ? disp : []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const orders = tab === 'b2b' ? b2bOrders : partnerOrders;

    const statusIcon = (status: string) => {
        switch (status) {
            case 'DELIVERED': return <CheckCircle size={14} className="text-green-500" />;
            case 'DISPATCHED': return <Truck size={14} className="text-purple-500" />;
            case 'FULFILLED': return <Package size={14} className="text-blue-500" />;
            default: return <Clock size={14} className="text-yellow-500" />;
        }
    };

    // Summary stats
    const pending = orders.filter(o => o.order_status === 'PENDING').length;
    const fulfilled = orders.filter(o => o.order_status === 'FULFILLED').length;
    const dispatched = orders.filter(o => o.order_status === 'DISPATCHED').length;
    const totalValue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

    return (
        <div className="animate-in fade-in duration-500 relative pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
                            <ClipboardList size={24} />
                        </div>
                        Order Tracking
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-lg">
                        Track the lifecycle of all orders from creation through fulfillment, dispatch, and delivery.
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-yellow-500 uppercase tracking-wider mb-1">Pending</p>
                    <h3 className="text-2xl font-black text-slate-900">{pending}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider mb-1">Fulfilled</p>
                    <h3 className="text-2xl font-black text-slate-900">{fulfilled}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-purple-500 uppercase tracking-wider mb-1">Dispatched</p>
                    <h3 className="text-2xl font-black text-slate-900">{dispatched}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider mb-1">Total Value</p>
                    <h3 className="text-2xl font-black text-slate-900">₹{totalValue.toLocaleString()}</h3>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-2 mb-6">
                <button onClick={() => setTab('b2b')}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'b2b' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                    B2B Orders ({b2bOrders.length})
                </button>
                <button onClick={() => setTab('partner')}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'partner' ? 'bg-pink-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                    Partner Orders ({partnerOrders.length})
                </button>
            </div>

            {/* Orders Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                            <tr>
                                <th className="px-6 py-5">Order ID</th>
                                <th className="px-6 py-5">{tab === 'b2b' ? 'Customer' : 'Partner'}</th>
                                <th className="px-6 py-5">Created</th>
                                <th className="px-6 py-5 text-right">Amount</th>
                                <th className="px-6 py-5 text-center">Payment</th>
                                <th className="px-6 py-5 text-center">Lifecycle</th>
                                <th className="px-6 py-5">Courier</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-slate-400">No orders found.</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-5 font-bold text-slate-900">
                                            #{order.id.slice(0, 8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-5 text-slate-600 font-medium">
                                            {tab === 'b2b' 
                                                ? order.b2b_customers?.company_name 
                                                : order.distribution_partners?.business_name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-5 text-slate-500 text-xs">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5 text-right font-black text-slate-900">
                                            ₹{order.total_amount?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black uppercase rounded-lg ${
                                                order.payment_status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                order.payment_status === 'PARTIAL' ? 'bg-orange-100 text-orange-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>{order.payment_status}</span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                {statusIcon(order.order_status)}
                                                <span className={`text-[10px] font-black uppercase ${
                                                    order.order_status === 'DELIVERED' ? 'text-green-600' :
                                                    order.order_status === 'DISPATCHED' ? 'text-purple-600' :
                                                    order.order_status === 'FULFILLED' ? 'text-blue-600' :
                                                    'text-yellow-600'
                                                }`}>{order.order_status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-slate-500 text-xs italic max-w-[200px] truncate">
                                            {order.courier_details || '—'}
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
