'use client';

import { useState, useEffect } from 'react';
import { Warehouse, Search, CheckCircle, XCircle, AlertCircle, ArrowUpRight } from 'lucide-react';
import { NEXT_PUBLIC_API_BASE_URL } from '@/lib/api';

export default function FactoryReceivingPage() {
    const [grns, setGrns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    const loadGRNs = async () => {
        try {
            const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/api/grns`);
            const data = await res.json();
            if (Array.isArray(data)) {
                // Only show PENDING ones for factory receiving
                setGrns(data.filter(g => g.quality_status === 'PENDING'));
            } else {
                setGrns([]);
            }
        } catch (err) {
            console.error("Failed to load GRNs:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGRNs();
    }, []);

    const handleQC = async (grnId: string, action: 'APPROVE' | 'REJECT') => {
        setProcessing(grnId);
        try {
            // First, update GRN status
            // Note: Our current mock backend doesn't have a PUT /api/grns route.
            // Ideally we'd hit /api/qc/approve 
            const endpoint = action === 'APPROVE' ? '/api/qc/approve' : '/api/qc/reject';
            await fetch(`${NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: grnId })
            });
            
            if (action === 'APPROVE') {
                // Note: The UI layer here simulates what would happen in a real backend transaction.
                // 1. Create a Batch
                const batchCode = `BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
                const batchRes = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/api/batches`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ batch_code: batchCode, status: 'CREATED', grn_id: grnId })
                });
                const batchData = await batchRes.json();
                
                // 2. Put into Raw Material Inventory
                if (batchData && batchData.length > 0) {
                    const grn = grns.find(g => g.id === grnId);
                    await fetch(`${NEXT_PUBLIC_API_BASE_URL}/api/raw-inventory`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            batch_id: batchData[0].id, 
                            quantity_kg: grn.received_quantity_kg,
                            location: 'Factory Check-in'
                        })
                    });
                }
            }
            alert(`GRN quality ${action.toLowerCase()}d successfully.`);
            loadGRNs(); // Refresh list
        } catch (err) {
            console.error(err);
            alert("Failed to process QC. Check console.");
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 relative pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                            <Warehouse size={24} />
                        </div>
                        Material Receiving (QC)
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-lg">
                        Inspect incoming GRNs at the factory gate. Approved materials will automatically trigger batch creation and enter raw inventory.
                    </p>
                </div>
            </div>

            {/* Inwarding Queue */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <AlertCircle className="text-orange-500" size={18} />
                        Pending Quality Checks ({grns.length})
                    </h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                            <tr>
                                <th className="px-6 py-5">GRN Code</th>
                                <th className="px-6 py-5">PO Reference</th>
                                <th className="px-6 py-5">Received Date</th>
                                <th className="px-6 py-5 text-right">Qty Received (kg)</th>
                                <th className="px-6 py-5 text-center">QC Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : grns.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-40">
                                            <CheckCircle size={48} className="mb-4 text-green-500" />
                                            <p className="text-lg font-medium">All caught up!</p>
                                            <p className="text-sm text-slate-500">No pending GRNs require factory QC inspection.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                grns.map((grn) => (
                                    <tr key={grn.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5 font-bold text-slate-900">
                                            GRN-{grn.id.slice(0, 8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-5 font-mono text-xs text-blue-600">
                                            {grn.po_id.slice(0, 8)}...
                                        </td>
                                        <td className="px-6 py-5 text-slate-600 font-medium">
                                            {new Date(grn.received_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5 text-right font-black text-slate-900">
                                            {grn.received_quantity_kg.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            {processing === grn.id ? (
                                                <span className="text-xs font-bold text-slate-400">Processing...</span>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        onClick={() => handleQC(grn.id, 'APPROVE')}
                                                        className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1 transition-colors"
                                                    >
                                                        <CheckCircle size={14} /> Approve & Batch
                                                    </button>
                                                    <button 
                                                        onClick={() => handleQC(grn.id, 'REJECT')}
                                                        className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1 transition-colors"
                                                    >
                                                        <XCircle size={14} /> Reject
                                                    </button>
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
            
            <div className="mt-8 bg-slate-800 rounded-2xl p-6 text-white text-sm">
                <h4 className="font-bold flex items-center gap-2 mb-2"><AlertCircle size={16}/> QC Workflow Details</h4>
                <p className="text-slate-400">
                    Approving a GRN automatically registers the material into the <strong className="text-white">Raw Material Inventory</strong> and generates a traceable <strong className="text-white">Batch Code</strong> required for further processing runs.
                </p>
            </div>
        </div>
    );
}
