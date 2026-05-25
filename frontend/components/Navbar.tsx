'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Batches', href: '/batches' },
    { name: 'Production', href: '/production' },
    { name: 'Quality Control', href: '/quality' },
    { name: 'Inventory', href: '/inventory' },
  ];

  return (
    <nav className="bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo - Link to home */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-xl font-bold tracking-wider text-orange-500 hover:text-orange-400 transition-colors cursor-pointer">
              SpiceX <span className="text-white">OMS</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-orange-400'
                        : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Profile Placeholder */}
          <div className="hidden md:block">
            <div className="flex items-center ml-4 md:ml-6">
              <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs border border-slate-500">
                OP
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu - simple version */}
      <div className="md:hidden px-4 pb-3">
        <div className="flex flex-col space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-slate-800 text-orange-400'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;