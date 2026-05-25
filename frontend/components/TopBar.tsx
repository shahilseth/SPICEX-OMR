'use client';

import { Bell, User } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const TopBar = () => {
    const { profile, role } = useAuth();

    const roleLabel = role?.replace(/_/g, ' ') || 'User';

    // Role-based avatar colors
    const avatarColorMap: Record<string, string> = {
        ADMIN: 'bg-amber-100 text-amber-700',
        SOURCING_MANAGER: 'bg-emerald-100 text-emerald-700',
        FACTORY_MANAGER: 'bg-orange-100 text-orange-700',
        SALES_MANAGER: 'bg-indigo-100 text-indigo-700',
        WAREHOUSE_MANAGER: 'bg-teal-100 text-teal-700',
        DISTRIBUTION_MANAGER: 'bg-pink-100 text-pink-700',
        SALES_PERSON: 'bg-sky-100 text-sky-700',
    };
    const avatarColor = role ? avatarColorMap[role] || 'bg-gray-200 text-gray-500' : 'bg-gray-200 text-gray-500';

    // Get initials from full name
    const initials = profile?.full_name
        ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '??';

    return (
        <header className="h-16 bg-white border-b flex items-center justify-end px-8 z-10 sticky top-0">
            <div className="flex items-center gap-6">
                <div className="relative cursor-pointer hover:text-primary transition-colors text-slate-500">
                    <Bell size={20} />
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                        3
                    </span>
                </div>

                <div className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${avatarColor}`}>
                        {initials}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-semibold text-slate-800 leading-tight">
                            {profile?.full_name || 'Loading...'}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">{roleLabel}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
