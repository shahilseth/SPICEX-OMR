'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Receipt, Package, Box, Settings, HelpCircle,
  Network, Warehouse, ChevronDown, ChevronUp, Database, LogOut
} from 'lucide-react';
import { useAuth, UserRole } from '@/lib/auth-context';

// ============================================================
// Role → allowed sidebar groups mapping
// ADMIN sees everything. Others see only their modules.
// ============================================================

const ROLE_ACCESS: Record<UserRole, string[]> = {
  ADMIN: ['Sourcing', 'Factory', 'Warehouse & Dispatch', 'B2B Sales', 'Distribution', 'Master Data'],
  SOURCING_MANAGER: ['Sourcing', 'Master Data'],
  FACTORY_MANAGER: ['Factory', 'Master Data'],
  SALES_MANAGER: ['B2B Sales', 'Master Data'],
  WAREHOUSE_MANAGER: ['Warehouse & Dispatch', 'Master Data'],
  DISTRIBUTION_MANAGER: ['Distribution', 'Master Data'],
  SALES_PERSON: ['B2B Sales'],
};

const Sidebar = () => {
  const pathname = usePathname();
  const { profile, role, signOut } = useAuth();

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const allNavGroups = [
    {
      title: 'Sourcing',
      icon: Package,
      basePath: '/procurement',
      items: [
        { name: 'Purchase Orders', href: '/procurement/po' },
        { name: 'Goods Receipt (GRN)', href: '/procurement/grn' },
      ]
    },
    {
      title: 'Factory',
      icon: Warehouse,
      basePath: '/factory',
      items: [
        { name: 'Material Receiving', href: '/factory/receiving' },
        { name: 'Processing & Drying', href: '/factory/processing' },
        { name: 'Factory Inventory', href: '/factory/inventory' },
        { name: 'Factory Dispatch', href: '/factory/dispatch' },
      ]
    },
    {
      title: 'Warehouse & Dispatch',
      icon: Box,
      basePath: '/warehouse',
      items: [
        { name: 'Central Inventory', href: '/warehouse/inventory' },
        { name: 'Fulfillment & Dispatch', href: '/warehouse/fulfillment' },
        { name: 'Monthly Packing', href: '/warehouse/packing' },
      ]
    },
    {
      title: 'B2B Sales',
      icon: Receipt,
      basePath: '/sales',
      items: [
        { name: 'Sales Orders', href: '/sales/b2b' },
        { name: 'Order Tracking', href: '/sales/tracking' },
      ]
    },
    {
      title: 'Distribution',
      icon: Network,
      basePath: '/distribution',
      items: [
        { name: 'Partners', href: '/distribution/partners' },
        { name: 'Partner Orders', href: '/distribution/orders' },
      ]
    },
    {
      title: 'Master Data',
      icon: Database,
      basePath: '/master',
      items: [
        { name: 'Products', href: '/master/products' },
        { name: 'Suppliers', href: '/master/suppliers' },
        { name: 'Customers', href: '/master/customers' },
        { name: 'Users', href: '/master/users' },
      ]
    }
  ];

  // Filter nav groups based on user role
  const allowedTitles = role ? ROLE_ACCESS[role] || [] : [];
  const navGroups = allNavGroups.filter(g => allowedTitles.includes(g.title));

  useEffect(() => {
    const currentGroup = navGroups.find(group => pathname.startsWith(group.basePath));
    if (currentGroup) {
      setOpenMenus(prev => ({ ...prev, [currentGroup.title]: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // Role display formatting
  const roleLabel = role?.replace(/_/g, ' ') || 'Unknown Role';
  const roleColorMap: Record<string, string> = {
    ADMIN: 'text-amber-600 bg-amber-50',
    SOURCING_MANAGER: 'text-emerald-600 bg-emerald-50',
    FACTORY_MANAGER: 'text-orange-600 bg-orange-50',
    SALES_MANAGER: 'text-indigo-600 bg-indigo-50',
    WAREHOUSE_MANAGER: 'text-teal-600 bg-teal-50',
    DISTRIBUTION_MANAGER: 'text-pink-600 bg-pink-50',
    SALES_PERSON: 'text-sky-600 bg-sky-50',
  };
  const roleColor = role ? roleColorMap[role] || 'text-slate-600 bg-slate-50' : 'text-slate-600 bg-slate-50';

  return (
    <aside className="w-64 bg-white border-r h-full flex flex-col pt-6 pb-4 shadow-sm overflow-y-auto hidden md:flex">
      {/* Logo */}
      <div className="px-6 mb-6 flex items-center gap-2 cursor-pointer">
        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-bold text-xl">
          <span className="-translate-y-[2px]">^</span>
        </div>
        <span className="text-2xl font-bold tracking-tight text-slate-800">
          SpiceX <span className="text-primary">OMS</span>
        </span>
      </div>

      {/* User Info */}
      <div className="px-5 mb-6">
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-sm font-bold text-slate-800 truncate">{profile?.full_name || 'Loading...'}</p>
          <span className={`inline-block mt-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${roleColor}`}>
            {roleLabel}
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 text-sm font-medium text-slate-600">
        {/* Dashboard — always visible */}
        <div className="mb-4">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${pathname === '/dashboard' || pathname === '/' ? 'text-primary bg-primary-light font-semibold' : 'hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={18} className={pathname === '/dashboard' || pathname === '/' ? "text-primary" : "text-slate-400"} />
            Dashboard
          </Link>
        </div>

        {/* Role-filtered navigation groups */}
        <div className="space-y-1 mb-6 border-b pb-6">
          {navGroups.map((group) => {
            const Icon = group.icon;
            const isOpen = openMenus[group.title];
            const isActiveGroup = pathname.startsWith(group.basePath);

            return (
              <div key={group.title} className="mb-1">
                <div
                  onClick={() => toggleMenu(group.title)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-colors ${isActiveGroup ? 'text-primary font-semibold' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActiveGroup ? "text-primary" : "text-slate-400"} />
                    <span>{group.title}</span>
                  </div>
                  {isOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                </div>

                {isOpen && (
                  <ul className="mt-1 space-y-1">
                    {group.items.map((item) => {
                      const isItemActive = pathname === item.href;
                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className={`flex items-center pl-10 pr-3 py-2 rounded-md text-sm transition-colors ${isItemActive ? 'bg-primary-light text-primary font-semibold' : 'text-slate-500 hover:bg-gray-50 hover:text-slate-700'}`}
                          >
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom nav — Settings, Help always visible */}
        <ul className="space-y-1">
          <li>
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors hover:bg-gray-50 text-slate-600">
              <Settings size={18} className="text-slate-400" />
              Settings
            </Link>
          </li>
          <li>
            <Link href="/help" className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors hover:bg-gray-50 text-slate-600">
              <HelpCircle size={18} className="text-slate-400" />
              Help Center
            </Link>
          </li>
        </ul>
      </nav>

      {/* Sign Out button */}
      <div className="px-4 mt-2">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
