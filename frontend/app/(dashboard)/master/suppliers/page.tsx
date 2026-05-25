'use client';

import { useState, useEffect } from 'react';
import { User, Search, Plus, Mail, Phone, MapPin, ArrowUpRight, Shield } from 'lucide-react';

export default function SuppliersMasterPage() {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSuppliers = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/suppliers');
                const data = await res.json();
                setSuppliers(data);
            } catch (err) {
                console.error("Failed to load suppliers:", err);
            } finally {
                setLoading(false);
            }
        };
        loadSuppliers();
    }, []);

    return (
        <div className="animate-in fade-in duration-500 relative pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                            <Shield size={24} />
                        </div>
                        Verified Suppliers
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-lg">
                        Directory of all active FPOs, farmers, and raw material vendors for the SpiceX supply chain.
                    </p>
                </div>
                
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 group">
                    <Plus size={18} />
                    Onboard New Supplier
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse h-48"></div>
                    ))
                ) : suppliers.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-400">
                        No suppliers found in registry.
                    </div>
                ) : (
                    suppliers.map((supplier) => (
                        <div key={supplier.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowUpRight size={18} className="text-slate-300" />
                            </div>
                            
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-bold text-xl uppercase">
                                    {supplier.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 leading-tight">{supplier.name}</h3>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                                        supplier.supplier_type === 'FPO' ? 'text-primary' : 'text-orange-500'
                                    }`}>
                                        {supplier.supplier_type} ENTITY
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-slate-500 text-sm italic">
                                    <MapPin size={14} className="shrink-0" />
                                    <span>{supplier.state}, {supplier.block}</span>
                                </div>
                                {supplier.phone && (
                                    <div className="flex items-center gap-3 text-slate-500 text-sm">
                                        <Phone size={14} className="shrink-0" />
                                        <span>{supplier.phone}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center">
                                <div className="text-[10px] font-bold text-slate-400 uppercase">Onboarded</div>
                                <div className="text-xs font-bold text-slate-800">
                                    {new Date(supplier.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
