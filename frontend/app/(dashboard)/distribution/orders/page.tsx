'use client';

import { useState, useEffect } from 'react';
import { Network, Plus, User, CheckCircle2, Truck, X, DollarSign, Percent } from 'lucide-react';
import { fetchPartnerOrders, fetchPartners, fetchSKUs, createPartnerOrder, fulfillPartnerOrder, dispatchPartnerOrder, calculatePartnerPrice } from '@/lib/api';

export default function PartnerOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [partners, setPartners] = useState<any[]>([]);
    const [skus, setSkus] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [processing, setProcessing] = useState<string | null>(null);

    const [form, setForm] = useState({ partner_id: '', tracking_notes: '' });
    const [items, setItems] = useState<{ sku_id: string; quantity: number; mrp: number; selling_price: number }[]>([]);
    const [selectedPartnerMargin, setSelectedPartnerMargin] = useState(0);

    const loadData = async () => {
        try {
            const [ordersData, partnerData, skuData] = await Promise.all([
                fetchPartnerOrders(),
                fetchPartners(),
                fetchSKUs(),
            ]);
            setOrders(Array.isArray(ordersData) ? ordersData : []);
            setPartners(Array.isArray(partnerData) ? partnerData : []);
            setSkus(Array.isArray(skuData) ? skuData : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const selectPartner = (partnerId: string) => {
        const partner = partners.find(p => p.id === partnerId);
        setForm({ ...form, partner_id: partnerId });
        setSelectedPartnerMargin(partner?.margin_percentage || 0);
        // Recalculate existing items with new margin
        if (partner) {
            setItems(items.map(item => {
                const sku = skus.find(s => s.id === item.sku_id);
                const mrp = sku?.mrp || item.mrp;
                return { ...item, mrp, selling_price: mrp - (mrp * partner.margin_percentage / 100) };
            }));
        }
    };

    const addItem = () => setItems([...items, { sku_id: '', quantity: 1, mrp: 0, selling_price: 0 }]);
    const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

    const updateItem = (idx: number, field: string, value: any) => {
        const updated = [...items];
        (updated[idx] as any)[field] = value;
        if (field === 'sku_id') {
            const sku = skus.find(s => s.id === value);
            if (sku) {
                updated[idx].mrp = sku.mrp;
                updated[idx].selling_price = Number((sku.mrp - (sku.mrp * selectedPartnerMargin / 100)).toFixed(2));
            }
        }
        setItems(updated);
    };

    const totalAmount = items.reduce((sum, it) => sum + (it.quantity * it.selling_price), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) return alert("Add at least one item.");
        try {
            await createPartnerOrder({
                ...form,
                total_amount: totalAmount,
                items: items.map(it => ({ sku_id: it.sku_id, quantity: it.quantity, mrp: it.mrp })),
            });
            setShowForm(false);
            setForm({ partner_id: '', tracking_notes: '' });
            setItems([]);
            loadData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleFulfill = async (orderId: string) => {
        if (!confirm("Deduct from FG inventory and mark as fulfilled?")) return;
        setProcessing(orderId);
        try {
            await fulfillPartnerOrder(orderId);
            loadData();
        } catch (err: any) { alert(err.message); }
        finally { setProcessing(null); }
    };

    const handleDispatch = async (orderId: string) => {
        const transport = prompt("Enter courier/transport details:");
        if (!transport) return;
        setProcessing(orderId);
        try {
            const order = orders.find(o => o.id === orderId);
            await dispatchPartnerOrder(orderId, { 
                transport_details: transport,
                partner_type: order?.distribution_partners?.partner_type || 'DISTRIBUTOR',
            });
            loadData();
        } catch (err: any) { alert(err.message); }
        finally { setProcessing(null); }
    };

    return (
        <div className="animate-in fade-in duration-500 relative pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center">
                            <Network size={24} />
                        </div>
                        Partner Orders
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-lg">
                        Orders placed on behalf of distributors & franchisees. Pricing auto-calculates using partner margins (Selling Price = MRP - MRP × Margin%).
                    </p>
                </div>
                
                <button 
                    onClick={() => { setShowForm(!showForm); if (!showForm) addItem(); }}
                    className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                    <Plus size={18} />
                    Create Partner Order
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                    <h3 className="font-bold text-slate-800 mb-4">New Partner Order</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Partner</label>
                                <select required value={form.partner_id} onChange={e => selectPartner(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none">
                                    <option value="">Select Partner...</option>
                                    {partners.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.business_name} ({p.partner_type}) — {p.margin_percentage}% margin
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Applied Margin</label>
                                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2.5 bg-pink-50">
                                    <Percent size={14} className="text-pink-600" />
                                    <span className="font-black text-pink-700">{selectedPartnerMargin}%</span>
                                    <span className="text-xs text-pink-400">auto-applied</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes</label>
                                <input value={form.tracking_notes} onChange={e => setForm({ ...form, tracking_notes: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="Optional" />
                            </div>
                        </div>

                        <div className="mb-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Order Items (Margin-Adjusted)</h4>
                            {items.map((item, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-3 mb-2 items-center">
                                    <div className="col-span-4">
                                        <select required value={item.sku_id} onChange={e => updateItem(idx, 'sku_id', e.target.value)}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none">
                                            <option value="">Select SKU...</option>
                                            {skus.map(s => <option key={s.id} value={s.id}>{s.product_name} — {s.weight_grams}g</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <input type="number" min="1" required value={item.quantity}
                                            onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" placeholder="Qty" />
                                    </div>
                                    <div className="col-span-2 text-center">
                                        <span className="text-xs text-slate-400 line-through">₹{item.mrp}</span>
                                    </div>
                                    <div className="col-span-2 text-center">
                                        <span className="text-sm font-black text-pink-700">₹{item.selling_price}</span>
                                    </div>
                                    <div className="col-span-2 flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-600">= ₹{(item.quantity * item.selling_price).toLocaleString()}</span>
                                        <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addItem} className="text-pink-600 hover:text-pink-800 text-xs font-bold mt-1 flex items-center gap-1">
                                <Plus size={14} /> Add Item
                            </button>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="text-lg font-black text-slate-900">Total: ₹{totalAmount.toLocaleString()}</div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => { setShowForm(false); setItems([]); }} className="text-slate-400 px-4 py-2.5 text-sm font-bold">Cancel</button>
                                <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm">Create Order</button>
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
                                <th className="px-6 py-5">Order / Partner</th>
                                <th className="px-6 py-5">Type</th>
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
                                        No partner orders yet.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-slate-900">#PO-{order.id.slice(0, 6).toUpperCase()}</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">
                                                {order.distribution_partners?.business_name || 'Partner'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                                                order.distribution_partners?.partner_type === 'FRANCHISEE' 
                                                    ? 'bg-purple-100 text-purple-700' 
                                                    : 'bg-teal-100 text-teal-700'
                                            }`}>
                                                {order.distribution_partners?.partner_type || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right font-black text-slate-900">₹{order.total_amount?.toLocaleString()}</td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black uppercase rounded-lg ${
                                                order.payment_status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                order.payment_status === 'PARTIAL' ? 'bg-orange-100 text-orange-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>{order.payment_status}</span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black uppercase rounded-lg ${
                                                order.order_status === 'DISPATCHED' ? 'bg-purple-100 text-purple-700' :
                                                order.order_status === 'FULFILLED' ? 'bg-blue-100 text-blue-700' :
                                                order.order_status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>{order.order_status}</span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {processing === order.id ? (
                                                <span className="text-xs text-slate-400 font-bold">Processing...</span>
                                            ) : (
                                                <div className="flex items-center justify-end gap-1">
                                                    {order.order_status === 'PENDING' && (
                                                        <button onClick={() => handleFulfill(order.id)}
                                                            className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1"><CheckCircle2 size={12} /> Fulfill</button>
                                                    )}
                                                    {order.order_status === 'FULFILLED' && (
                                                        <button onClick={() => handleDispatch(order.id)}
                                                            className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1"><Truck size={12} /> Dispatch</button>
                                                    )}
                                                </div>
                                            )}
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
