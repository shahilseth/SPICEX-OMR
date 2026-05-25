'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UploadCloud, Trash2, CheckCircle2, ChevronLeft, Package, Calendar, User, Info } from 'lucide-react';
import { fetchSuppliers, createPurchaseOrder } from '@/lib/api';

export default function CreatePOPage() {
    const router = useRouter();
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    const [formData, setFormData] = useState({
        supplierId: '',
        expectedDate: '',
        notes: '',
        product: 'Raw Turmeric Root',
        quantity: 500,
        rate: 150,
        materialType: 'FRESH' as 'FRESH' | 'DRY',
        poNumber: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    });

    useEffect(() => {
        const loadSuppliers = async () => {
            try {
                const data = await fetchSuppliers();
                setSuppliers(data);
            } catch (err) {
                console.error("Failed to load suppliers:", err);
            } finally {
                setPageLoading(false);
            }
        };
        loadSuppliers();
    }, []);

    const handleSave = async () => {
        if (!formData.supplierId || !formData.expectedDate) {
            alert('Please select a supplier and expected delivery date.');
            return;
        }

        setLoading(true);
        try {
            await createPurchaseOrder({
                supplier_id: formData.supplierId,
                product: formData.product,
                quantity_kg: formData.quantity,
                rate_per_kg: formData.rate,
                material_type: formData.materialType,
                expected_delivery_date: formData.expectedDate,
                notes: formData.notes,
                po_number: formData.poNumber
            });
            alert('Purchase Order created successfully!');
            router.push('/procurement/po');
        } catch (err) {
            console.error(err);
            alert('Failed to save PO. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 relative pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <Link href="/procurement/po" className="flex items-center text-sm text-slate-500 hover:text-primary mb-2 transition-colors group">
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Purchase Orders
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create Purchase Order</h1>
                    <p className="text-slate-500 mt-1">Initial setup for raw material sourcing from suppliers.</p>
                </div>
                
                <div className="flex gap-3">
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-primary hover:bg-primary-dark text-white px-8 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : 'Issue Purchase Order'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form Area */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Order Details Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                            <Info size={18} className="text-primary" />
                            <h2 className="font-bold text-slate-800">Order Information</h2>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        PO Number
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.poNumber}
                                        onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-600 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        Supplier <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.supplierId}
                                            onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                                        >
                                            <option value="">Select a supplier...</option>
                                            {suppliers.map(s => (
                                                <option key={s.id} value={s.id}>{s.name} ({s.supplier_type})</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <User size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        Expected Delivery Date <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={formData.expectedDate}
                                            onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <Calendar size={18} />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        Material Type
                                    </label>
                                    <div className="flex p-1 bg-slate-100 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, materialType: 'FRESH' })}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.materialType === 'FRESH' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Fresh Material
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, materialType: 'DRY' })}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.materialType === 'DRY' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Dry Material
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Package size={18} className="text-primary" />
                                <h2 className="font-bold text-slate-800">Materials & Quantities</h2>
                            </div>
                        </div>
                        
                        <div className="p-0">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 uppercase text-[11px] tracking-wider font-bold">
                                        <th className="px-8 py-4">Item Name / Specification</th>
                                        <th className="px-4 py-4 w-32">Qty (kg)</th>
                                        <th className="px-4 py-4 w-40">Unit Rate (Rp/kg)</th>
                                        <th className="px-8 py-4 w-40 text-right">Estimate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <tr className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <input
                                                type="text"
                                                value={formData.product}
                                                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                                                placeholder="Enter material name..."
                                                className="w-full bg-slate-50 border border-transparent hover:border-slate-200 focus:bg-white focus:border-primary rounded-lg px-3 py-2 outline-none transition-all font-medium text-slate-800"
                                            />
                                        </td>
                                        <td className="px-4 py-6">
                                            <input
                                                type="number"
                                                value={formData.quantity}
                                                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                                className="w-full bg-slate-50 border border-transparent hover:border-slate-200 focus:bg-white focus:border-primary rounded-lg px-3 py-2 outline-none transition-all text-center font-semibold"
                                            />
                                        </td>
                                        <td className="px-4 py-6">
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={formData.rate}
                                                    onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
                                                    className="w-full bg-slate-50 border border-transparent hover:border-slate-200 focus:bg-white focus:border-primary rounded-lg pl-3 pr-8 py-2 outline-none transition-all text-right font-semibold"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right font-bold text-slate-900 text-lg">
                                            {(formData.quantity * formData.rate).toLocaleString()}
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr className="bg-primary/5 border-t border-primary/10">
                                        <td colSpan={3} className="px-8 py-6 text-right font-bold text-primary tracking-tight">Purchase Value Total</td>
                                        <td className="px-8 py-6 text-right font-black text-primary text-2xl">
                                            Rp {(formData.quantity * formData.rate).toLocaleString()}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info/Docs Area */}
                <div className="space-y-8">
                    {/* Notes Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                            <h2 className="font-bold text-slate-800">Additional Notes</h2>
                        </div>
                        <div className="p-6">
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Payment terms, delivery instructions, or special quality remarks..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all h-32 resize-none text-sm"
                            />
                        </div>
                    </div>

                    {/* Guidelines Card */}
                    <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-lg p-6 text-white">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <CheckCircle2 size={20} />
                            PO Guidelines
                        </h3>
                        <ul className="space-y-3 text-white/90 text-sm">
                            <li className="flex gap-2">
                                <span className="opacity-60">•</span>
                                PO status will be set to <strong>PENDING</strong> upon issuance.
                            </li>
                            <li className="flex gap-2">
                                <span className="opacity-60">•</span>
                                Supplier will receive notification (if enabled).
                            </li>
                            <li className="flex gap-2">
                                <span className="opacity-60">•</span>
                                You can track material arrival via the <strong>GRN</strong> module once material arrives.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
