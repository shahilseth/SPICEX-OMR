'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Search, Plus, Filter, ArrowUpRight, ShieldCheck, Database } from 'lucide-react';

export default function SKUListPage() {
    const [skus, setSkus] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSKUs = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/skus');
                const data = await res.json();
                setSkus(data);
            } catch (err) {
                console.error("Failed to load SKUs:", err);
            } finally {
                setLoading(false);
            }
        };
        loadSKUs();
    }, []);

    return (
        <div className="animate-in fade-in duration-500 relative pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                            <Database size={24} />
                        </div>
                        Product SKUs
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-lg">
                        Manage all product definitions, weights, and ERP configurations for the SpiceX product catalog.
                    </p>
                </div>
                
                <button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 group">
                    <Plus size={18} />
                    New SKU Definition
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                            <tr>
                                <th className="px-6 py-5">Product Name</th>
                                <th className="px-6 py-5">Net Weight</th>
                                <th className="px-6 py-5 text-right">MRP (Rp)</th>
                                <th className="px-6 py-5 text-center">Status</th>
                                <th className="px-6 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : skus.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                                        No Product SKUs defined in master data.
                                    </td>
                                </tr>
                            ) : (
                                skus.map((sku) => (
                                    <tr key={sku.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                                    <Tag className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{sku.product_name}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">SKU-{sku.id.slice(0, 8).toUpperCase()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-slate-600 font-black">
                                            {sku.weight_grams} <span className="text-slate-400 font-bold uppercase text-[10px]">grams</span>
                                        </td>
                                        <td className="px-6 py-5 text-right font-black text-slate-900">
                                            Rp {sku.mrp.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black uppercase rounded-lg ${sku.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {sku.is_active ? 'Active' : 'Archived'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-2 text-slate-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                                                <ArrowUpRight size={18} />
                                            </button>
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

// Minimal icon for tag if not imported
function Tag(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  );
}
