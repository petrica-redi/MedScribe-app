'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [patientName] = useState('Maria Popescu');

  const navItems = [
    { href: '/portal', label: 'Dashboard', icon: '🏠' },
    { href: '/portal/mood', label: 'Mood Tracking', icon: '📊' },
    { href: '/portal/sessions', label: 'My Sessions', icon: '📋' },
    { href: '/portal/journal', label: 'Journal', icon: '📝' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">M</div>
            <span className="font-semibold text-gray-900">MindCare</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Patient Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {patientName}</span>
            <Link href="/login" className="text-sm text-blue-600 hover:underline">Sign Out</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 flex gap-1 pb-0">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition',
                pathname === item.href
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
