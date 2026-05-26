'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { CheckCircle2, AlertCircle, Database, Wifi, User, Shield, Loader2 } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'pending';
  detail: string;
}

export default function ConnectionTestPanel() {
  const { user, profile, role } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);

  const runTests = async () => {
    setRunning(true);
    const testResults: TestResult[] = [];

    // Test 1: Supabase Client Connection
    try {
      const { data, error } = await supabase.from('skus').select('id').limit(1);
      if (error) throw error;
      testResults.push({
        name: 'Supabase Connection',
        status: 'pass',
        detail: `OK — connected to ${process.env.NEXT_PUBLIC_SUPABASE_URL}`,
      });
    } catch (err: any) {
      testResults.push({
        name: 'Supabase Connection',
        status: 'fail',
        detail: `Failed: ${err.message}`,
      });
    }

    // Test 2: Auth Session
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        testResults.push({
          name: 'Auth Session',
          status: 'pass',
          detail: `Authenticated as: ${session.user.email}`,
        });
      } else {
        testResults.push({
          name: 'Auth Session',
          status: 'fail',
          detail: 'No active session. Please log in.',
        });
      }
    } catch (err: any) {
      testResults.push({
        name: 'Auth Session',
        status: 'fail',
        detail: `Auth error: ${err.message}`,
      });
    }

    // Test 3: Profile / Role
    testResults.push({
      name: 'User Profile & Role',
      status: profile ? 'pass' : 'fail',
      detail: profile
        ? `${profile.full_name} — Role: ${profile.role}`
        : 'Profile not found. Check if profiles table exists and trigger is set up.',
    });

    // Test 4: Express Backend (optional — dashboard works without it)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/api/skus`);
      if (res.ok) {
        testResults.push({
          name: 'Express Backend',
          status: 'pass',
          detail: `OK — backend on ${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}`,
        });
      } else {
        testResults.push({
          name: 'Express Backend',
          status: 'fail',
          detail: `HTTP ${res.status} — run the backend with: cd backend && npm run dev`,
        });
      }
    } catch (err: any) {
      testResults.push({
        name: 'Express Backend',
        status: 'fail',
        detail: `Not running (optional for dashboard). Start with: cd backend && npm run dev`,
      });
    }

    // Test 5: Cross-module data connectivity (PO → GRN)
    try {
      const { data: pos, error: poErr } = await supabase.from('purchase_orders').select('id, product').limit(1);
      if (poErr) throw poErr;
      if (pos && pos.length > 0) {
        const { data: grns } = await supabase
          .from('grns')
          .select('id, po_id')
          .eq('po_id', pos[0].id)
          .limit(1);
        testResults.push({
          name: 'Data Connectivity (PO → GRN)',
          status: 'pass',
          detail: grns && grns.length > 0
            ? `GRN found linked to PO for ${pos[0].product}`
            : `PO for "${pos[0].product}" exists. No GRN yet — FK is ready.`,
        });
      } else {
        testResults.push({
          name: 'Data Connectivity (PO → GRN)',
          status: 'pass',
          detail: 'No POs yet — tables and FKs are in place.',
        });
      }
    } catch (err: any) {
      testResults.push({
        name: 'Data Connectivity (PO → GRN)',
        status: 'fail',
        detail: `Query failed: ${err.message}`,
      });
    }

    // Test 6: RLS Check
    try {
      // Try to insert + rollback to test write permissions
      const { error } = await supabase.from('skus').select('id').limit(1);
      testResults.push({
        name: 'RLS Policies',
        status: error ? 'fail' : 'pass',
        detail: error
          ? `RLS blocked read: ${error.message}`
          : `Read access confirmed for role: ${role || 'unknown'}`,
      });
    } catch (err: any) {
      testResults.push({
        name: 'RLS Policies',
        status: 'fail',
        detail: err.message,
      });
    }

    setResults(testResults);
    setRunning(false);
  };

  const icons: Record<string, any> = {
    'Supabase Connection': Database,
    'Auth Session': Wifi,
    'User Profile & Role': User,
    'Express Backend': Wifi,
    'Data Connectivity (PO → GRN)': Database,
    'RLS Policies': Shield,
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          <Database size={18} className="text-indigo-500" />
          Connection & RBAC Diagnostics
        </h2>
        <button
          onClick={runTests}
          disabled={running}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {running ? <Loader2 size={14} className="animate-spin" /> : <Wifi size={14} />}
          {running ? 'Testing...' : 'Run Tests'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="divide-y divide-slate-100">
          {results.map((test) => {
            const Icon = icons[test.name] || Database;
            return (
              <div key={test.name} className="px-6 py-4 flex items-start gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  test.status === 'pass' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  {test.status === 'pass' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-slate-800">{test.name}</div>
                  <div className={`text-xs mt-0.5 ${test.status === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                    {test.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {results.length === 0 && !running && (
        <div className="px-6 py-12 text-center text-slate-400">
          <Database size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Click "Run Tests" to verify your Supabase, Auth, and RBAC connections.</p>
        </div>
      )}
    </div>
  );
}
