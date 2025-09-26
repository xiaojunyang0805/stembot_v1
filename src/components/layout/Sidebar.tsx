'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItemProps {
  href: string;
  icon: string;
  label: string;
  isActive: boolean;
}

const NavItem = ({ href, icon, label, isActive }: NavItemProps) => {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors
        ${isActive
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }
      `}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

export default function Sidebar() {
  const pathname = usePathname();

  const isActiveRoute = (route: string) => {
    if (route === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/dashboard/dashboard';
    }
    return pathname.startsWith(route);
  };

  const navItems = [
    {
      href: '/dashboard',
      icon: '📊',
      label: 'Dashboard',
    },
    {
      href: '/dashboard/projects',
      icon: '📁',
      label: 'Projects',
    },
    {
      href: '/dashboard/progress',
      icon: '📈',
      label: 'Progress',
    },
    {
      href: '/dashboard/settings',
      icon: '⚙️',
      label: 'Settings',
    },
  ];

  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white">
      {/* Sidebar Header */}
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Navigation
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={isActiveRoute(item.href)}
          />
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
          <div>
            <p className="text-xs font-medium text-green-700">System Status</p>
            <p className="text-xs text-green-600">All systems operational</p>
          </div>
        </div>
      </div>
    </div>
  );
}