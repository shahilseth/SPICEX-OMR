'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UploadCloud, Trash2, CheckCircle2, AlertCircle, ChevronLeft, Package, ClipboardCheck, ArrowRight, Plus } from 'lucide-react';
import { fetchPurchaseOrders, createGRN } from '@/lib/api';

export default function CreateGRNPage() {
    const router = useRouter();
    const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingPOs, setFetchingPOs] = useState(true);

    const [selectedPO, setSelectedPO] = useState<any>(null);
    const [formData, setFormData] = useState({
        poId: '',
        receivedQty: 0,
        receivedDate: new Date().toISOString().split('T')[0],
        warehouse: 'Main Raw Material Warehouse',
        qualityStatus: 'PENDING'
    });

    useEffect(() => {
        const loadPOs = async () => {
            try {
                const data = await fetchPurchaseOrders();
                // Only show POs that aren't fully received (mock logic)
                setPurchaseOrders(data);
            } catch (err) {
                console.error("Failed to load POs:", err);
            } finally {
                setFetchingPOs(false);
            }
        };
        loadPOs();
    }, []);

    const handlePOChange = (poId: string) => {
        const po = purchaseOrders.find(p => p.id === poId);
        setSelectedPO(po);
        setFormData({ ...formData, poId, receivedQty: po ? po.quantity_kg : 0 });
    };

    const handleConfirm = async () => {
        if (!formData.poId || formData.receivedQty <= 0) {
            alert('Please select a valid PO and enter received quantity.');
            return;
        }

        setLoading(true);
        try {
            await createGRN({
                po_id: formData.poId,
                received_quantity_kg: formData.receivedQty,
                quality_status: formData.qualityStatus
            });
            alert('Goods Receipt Note (GRN) created successfully!');
            router.push('/procurement/grn');
        } catch (err) {
            console.error(err);
            alert('Failed to save GRN. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    const difference = selectedPO ? formData.receivedQty - selectedPO.quantity_kg : 0;
    const diffPercentage = selectedPO ? (difference / selectedPO.quantity_kg) * 100 : 0;

    return (
        <div className="animate-in fade-in duration-500 relative pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <Link href="/procurement/grn" className="flex items-center text-sm text-slate-500 hover:text-primary mb-2 transition-colors group">
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Goods Receipts
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inwarding (GRN)</h1>
                    <p className="text-slate-500 mt-1">Record material arrival and perform initial quantity check.</p>
                </div>
                
                <div className="flex gap-3">
                    <button
                        onClick={handleConfirm}
                        disabled={loading || !selectedPO}
                        className="bg-primary hover:bg-primary-dark text-white px-8 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Processing...' : 'Confirm Receipt'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Form */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Reference Selection */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                            <ClipboardCheck size={18} className="text-primary" />
                            <h2 className="font-bold text-slate-800">Inwarding Reference</h2>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Select Purchase Order</label>
                                    <select
                                        value={formData.poId}
                                        onChange={(e) => handlePOChange(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                                    >
                                        <option value="">Choose an active PO...</option>
                                        {purchaseOrders.map(po => (
                                            <option key={po.id} value={po.id}>
                                                {po.po_number || 'Unnamed PO'} - {po.suppliers?.name} ({po.product})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Date Received</label>
                                    <input
                                        type="date"
                                        value={formData.receivedDate}
                                        onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Warehouse Location</label>
                                <select
                                    value={formData.warehouse}
                                    onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                                >
                                    <option>Main Raw Material Warehouse</option>
                                    <option>Secondary Storage (Block B)</option>
                                    <option>Cold Storage Unit 1</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Quantity Verification */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                            <Package size={18} className="text-primary" />
                            <h2 className="font-bold text-slate-800">Delivered Material Verification</h2>
                        </div>
                        
                        <div className="p-8">
                            {selectedPO ? (
                                <div className="space-y-8">
                                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-6 flex gap-4">
                                        <AlertCircle className="text-orange-500 shrink-0" size={24} />
                                        <div>
                                            <h4 className="font-bold text-orange-900 text-sm">Quality Inspection Required</h4>
                                            <p className="text-orange-700 text-xs mt-1 leading-relaxed">
                                                Please accurately record the received weights. 
                                                The system will flag discrepancies larger than 5% for management approval.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                                        <div className="p-4 bg-slate-50 rounded-xl text-center">
                                            <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Expected (PO)</span>
                                            <span className="text-xl font-black text-slate-700">{selectedPO.quantity_kg} kg</span>
                                        </div>
                                        
                                        <div className="flex justify-center text-slate-300">
                                            <ArrowRight size={32} />
                                        </div>

                                        <div className="space-y-2 text-center">
                                            <span className="text-[10px] font-black uppercase text-primary block mb-1">Actual Received</span>
                                            <input
                                                type="number"
                                                value={formData.receivedQty}
                                                onChange={(e) => setFormData({ ...formData, receivedQty: Number(e.target.value) })}
                                                className="w-full bg-white border-2 border-primary/20 rounded-xl px-4 py-3 text-center text-2xl font-black text-primary hover:border-primary focus:border-primary outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {difference !== 0 && (
                                        <div className={`p-4 rounded-xl text-center font-bold text-sm ${difference < 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                            Variance: {difference > 0 ? '+' : ''}{difference} kg ({diffPercentage.toFixed(1)}%)
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-slate-400">
                                    <Package size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="font-medium text-sm">Select a Purchase Order to verify items.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Photos/Docs */}
                <div className="space-y-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                            <h2 className="font-bold text-slate-800">Verification Artifacts</h2>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-slate-700">Delivery Challan / Bill</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-primary hover:bg-primary-light/5 transition-all group cursor-pointer">
                                    <UploadCloud size={32} className="text-slate-300 group-hover:text-primary mb-2 transition-colors" />
                                    <p className="text-xs font-bold text-slate-500 group-hover:text-primary">Click to upload doc</p>
                                    <p className="text-[10px] text-slate-400 mt-1">PDF, JPG up to 5MB</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                <label className="text-sm font-semibold text-slate-700">Material Photos <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-200 hover:border-primary transition-all cursor-pointer text-slate-400 hover:text-primary">
                                        <Plus size={24} />
                                    </div>
                                    <div className="aspect-square bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
                                        <Package size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800 rounded-2xl p-8 text-white">
                        <h4 className="font-bold text-lg mb-4">Stock Update</h4>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Confirming this receipt will automatically update the <strong>Raw Material Inventory</strong>.
                        </p>
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="w-10 h-10 bg-primary/20 text-primary rounded-lg flex items-center justify-center">
                                <CheckCircle2 size={20} />
                            </div>
                            <div className="text-xs">
                                <span className="block font-bold">Auto-Batching</span>
                                <span className="text-slate-500">A new batch number will be generated.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
