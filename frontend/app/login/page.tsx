'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getRedirectForRole } from '@/lib/role-redirect';
import { Eye, EyeOff, Loader2, LogIn, UserPlus, AlertCircle, ChevronDown } from 'lucide-react';
import type { UserRole } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, user, profile, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('SALES_PERSON');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // If already logged in, redirect based on role
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(getRedirectForRole(profile?.role ?? null));
    }
  }, [authLoading, user, profile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error: loginError } = await signIn(email, password);
        if (loginError) {
          setError(loginError.message);
        } else {
          // Fetch profile to determine role-based redirect
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', authUser.id)
              .single();
            const role = profileData?.role as UserRole | null;
            router.replace(getRedirectForRole(role));
          } else {
            router.replace('/dashboard');
          }
        }
      } else {
        if (!fullName.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }
        const { error: signupError } = await signUp(email, password, fullName, signupRole);
        if (signupError) {
          setError(signupError.message);
        } else {
          setSuccess('Account created! Check your email to confirm, then log in.');
          setMode('login');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions: { value: UserRole; label: string; description: string }[] = [
    { value: 'SOURCING_MANAGER', label: 'Sourcing Manager', description: 'POs, Suppliers, Procurement' },
    { value: 'FACTORY_MANAGER', label: 'Factory Manager', description: 'GRNs, Processing, Batches' },
    { value: 'SALES_MANAGER', label: 'Sales Manager', description: 'B2B Orders, Customers' },
    { value: 'WAREHOUSE_MANAGER', label: 'Warehouse Manager', description: 'Packing, Dispatch, Inventory' },
    { value: 'DISTRIBUTION_MANAGER', label: 'Distribution Manager', description: 'Partners, Partner Orders' },
    { value: 'SALES_PERSON', label: 'Sales Person', description: 'Basic sales access' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6bTAtMzBWNkgydjJoMzR6TTYgMzRIMnYyaDR2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/20">
              <span className="-translate-y-[2px]">^</span>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white">
              SpiceX <span className="text-orange-400">OMS</span>
            </span>
          </div>
          <p className="text-slate-400 text-sm">Operations Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Tab Switcher */}
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-8">
            <button
              onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn size={14} className="inline mr-1.5 -mt-0.5" /> Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus size={14} className="inline mr-1.5 -mt-0.5" /> Sign Up
            </button>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6 flex items-start gap-2">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-6">
              <p className="text-sm text-green-300">✓ {success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Joyanta Das"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 outline-none transition-all"
                  required
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@spicex.com"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 outline-none transition-all"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 pr-12 text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 outline-none transition-all"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Role Selector (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Role</label>
                <div className="relative">
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value as UserRole)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm appearance-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 outline-none transition-all"
                  >
                    {roleOptions.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-slate-800 text-white">
                        {opt.label} — {opt.description}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          SpiceX OMS v2.0 · Secure login powered by Supabase Auth
        </p>
      </div>
    </div>
  );
}
