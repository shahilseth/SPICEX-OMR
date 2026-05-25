'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, DollarSign, ArrowUpRight, User, X, CheckCircle2, Truck, Package } from 'lucide-react';
import { fetchB2BOrders, fetchB2BCustomers, fetchSKUs, createB2BOrder, fulfillB2BOrder, dispatchB2BOrder } from '@/lib/api';

export default function B2BOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [skus, setSkus] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [processing, setProcessing] = useState<string | null>(null);

    const [form, setForm] = useState({
        b2b_customer_id: '',
        order_source: 'PHONE_CALL',
        tracking_notes: '',
    });
    const [items, setItems] = useState<{ sku_id: string; quantity: number; unit_price: number }[]>([]);

    const loadData = async () => {
        try {
            const [ordersData, cusData, skuData] = await Promise.all([
                fetchB2BOrders(),
                fetchB2BCustomers(),
                fetchSKUs(),
            ]);
            setOrders(Array.isArray(ordersData) ? ordersData : []);
            setCustomers(Array.isArray(cusData) ? cusData : []);
            setSkus(Array.isArray(skuData) ? skuData : []);
        } catch (err) {
            console.error("Failed to load:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const addItem = () => setItems([...items, { sku_id: '', quantity: 1, unit_price: 0 }]);
    const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
    const updateItem = (idx: number, field: string, value: any) => {
        const updated = [...items];
        (updated[idx] as any)[field] = value;
        // Auto-fill price when SKU selected
        if (field === 'sku_id') {
            const sku = skus.find(s => s.id === value);
            if (sku) updated[idx].unit_price = sku.mrp;
        }
        setItems(updated);
    };

    const totalAmount = items.reduce((sum, it) => sum + (it.quantity * it.unit_price), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) return alert("Please add at least one item.");
        try {
            await createB2BOrder({
                ...form,
                total_amount: totalAmount,
                items,
            });
            setShowForm(false);
            setForm({ b2b_customer_id: '', order_source: 'PHONE_CALL', tracking_notes: '' });
            setItems([]);
            loadData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleFulfill = async (orderId: string) => {
        if (!confirm("This will deduct items from Finished Goods inventory. Continue?")) return;
        setProcessing(orderId);
        try {
            await fulfillB2BOrder(orderId);
            loadData();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setProcessing(null);
        }
    };

    const handleDispatch = async (orderId: string) => {
        const transport = prompt("Enter courier/transport details:");
        if (!transport) return;
        setProcessing(orderId);
        try {
            await dispatchB2BOrder(orderId, { transport_details: transport });
            loadData();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 relative pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <ShoppingBag size={24} />
                        </div>
                        B2B Sales Orders
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-lg">
                        Manage wholesale orders, payment tracking, and fulfillment. Fulfilling an order deducts from FG inventory.
                    </p>
                </div>
                
                <button 
                    onClick={() => { setShowForm(!showForm); if (!showForm) addItem(); }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                    <Plus size={18} />
                    Create Sales Order
                </button>
            </div>

            {/* Create Order Form */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                    <h3 className="font-bold text-slate-800 mb-4">New B2B Order</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Customer</label>
                                <select required value={form.b2b_customer_id} onChange={e => setForm({ ...form, b2b_customer_id: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none">
                                    <option value="">Select Customer...</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Order Source</label>
                                <select value={form.order_source} onChange={e => setForm({ ...form, order_source: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none">
                                    <option value="PHONE_CALL">Phone Call</option>
                                    <option value="EMAIL">Email</option>
                                    <option value="WHATSAPP">WhatsApp</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes</label>
                                <input value={form.tracking_notes} onChange={e => setForm({ ...form, tracking_notes: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                                    placeholder="Optional notes" />
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="mb-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Order Items</h4>
                            {items.map((item, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-3 mb-2">
                                    <div className="col-span-5">
                                        <select required value={item.sku_id} onChange={e => updateItem(idx, 'sku_id', e.target.value)}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none">
                                            <option value="">Select SKU...</option>
                                            {skus.map(s => <option key={s.id} value={s.id}>{s.product_name} — {s.weight_grams}g (₹{s.mrp})</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <input type="number" min="1" required value={item.quantity} 
                                            onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" placeholder="Qty" />
                                    </div>
                                    <div className="col-span-3">
                                        <input type="number" step="0.01" required value={item.unit_price}
                                            onChange={e => updateItem(idx, 'unit_price', Number(e.target.value))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" placeholder="Unit Price" />
                                    </div>
                                    <div className="col-span-2 flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-600">₹{(item.quantity * item.unit_price).toLocaleString()}</span>
                                        <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addItem} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold mt-1 flex items-center gap-1">
                                <Plus size={14} /> Add Item
                            </button>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="text-lg font-black text-slate-900">
                                Total: ₹{totalAmount.toLocaleString()}
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => { setShowForm(false); setItems([]); }} className="text-slate-400 hover:text-slate-600 px-4 py-2.5 text-sm font-bold">Cancel</button>
                                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all">Create Order</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                            <tr>
                                <th className="px-6 py-5">Order / Client</th>
                                <th className="px-6 py-5">Source</th>
                                <th className="px-6 py-5 text-right">Value</th>
                                <th className="px-6 py-5 text-center">Payment</th>
                                <th className="px-6 py-5 text-center">Status</th>
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
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-medium">
                                        No B2B orders yet. Click "Create Sales Order" above.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-slate-900">#ORD-{order.id.slice(0, 6).toUpperCase()}</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter flex items-center gap-1 mt-0.5">
                                                <User size={10} /> {order.b2b_customers?.company_name || 'Client'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                {order.order_source?.replace('_', ' ') || 'Direct'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right font-black text-slate-900">
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
                                        <td className="px-6 py-5 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black uppercase rounded-lg ${
                                                order.order_status === 'DISPATCHED' ? 'bg-purple-100 text-purple-700' :
                                                order.order_status === 'FULFILLED' ? 'bg-blue-100 text-blue-700' :
                                                order.order_status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                order.order_status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                                {order.order_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {processing === order.id ? (
                                                    <span className="text-xs text-slate-400 font-bold">Processing...</span>
                                                ) : (
                                                    <>
                                                        {order.order_status === 'PENDING' && (
                                                            <button onClick={() => handleFulfill(order.id)}
                                                                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1 transition-colors">
                                                                <CheckCircle2 size={12} /> Fulfill
                                                            </button>
                                                        )}
                                                        {order.order_status === 'FULFILLED' && (
                                                            <button onClick={() => handleDispatch(order.id)}
                                                                className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1 transition-colors">
                                                                <Truck size={12} /> Dispatch
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
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
