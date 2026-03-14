'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  BrainCircuit,
  Calendar,
  ChartNoAxesCombined,
  ClipboardList,
  ClipboardPlus,
  Database,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/context';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { ScrivaLogo } from '@/components/ui/ScrivaLogo';
import type { TranslationKey } from '@/lib/i18n/translations';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  onSignOut: () => void;
}

export function Sidebar({ isOpen, onClose, userEmail, onSignOut }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems: { labelKey: TranslationKey; href: string; icon: typeof LayoutDashboard }[] = [
    { labelKey: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
    { labelKey: 'nav.newConsultation', href: '/consultation/new', icon: ClipboardPlus },
    { labelKey: 'nav.aiAssistant', href: '/ai-assistant', icon: BrainCircuit },
    { labelKey: 'nav.patients', href: '/patients', icon: Users },
    { labelKey: 'nav.analytics', href: '/analytics', icon: ChartNoAxesCombined },
    { labelKey: 'nav.calendar', href: '/calendar', icon: Calendar },
    { labelKey: 'nav.templates', href: '/templates', icon: FileText },
    { labelKey: 'nav.portal' as TranslationKey, href: '/portal', icon: MessageSquare },
    { labelKey: 'nav.followUps' as TranslationKey, href: '/follow-ups', icon: ClipboardList },
    { labelKey: 'nav.admin' as TranslationKey, href: '/admin', icon: Database },
    { labelKey: 'nav.settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/consultation/new') return pathname.startsWith('/consultation');
    return pathname.startsWith(href);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-[1px] lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-medical-border/60 bg-white/95 px-5 pb-5 pt-6 backdrop-blur-xl transition-transform duration-300 lg:z-auto lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Link href="/dashboard" className="group mb-8 flex items-center gap-3.5" onClick={onClose}>
          <ScrivaLogo
            size={40}
            className="shrink-0 transition group-hover:opacity-90"
          />
          <div>
            <p className="text-[19px] font-semibold tracking-[-0.02em] text-medical-text">Scriva</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-brand-600">Clinical AI</p>
          </div>
        </Link>

        <nav className="flex-1 space-y-0.5 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150',
                  active
                    ? 'bg-brand-50 text-brand-800 font-semibold'
                    : 'text-medical-muted hover:bg-gray-50 hover:text-medical-text'
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0 transition-transform group-hover:scale-110', active ? 'text-brand-700' : 'text-medical-muted')} />
                <span>{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-5 space-y-3 rounded-2xl border border-medical-border bg-white p-3">
          <LanguageSwitcher />
          {userEmail && (
            <div className="rounded-xl bg-gray-50 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.12em] text-medical-muted">{t('sidebar.signedInAs')}</p>
              <p className="mt-1 truncate text-sm font-semibold text-medical-text">{userEmail}</p>
            </div>
          )}
          <button
            onClick={onSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-medical-border bg-white px-3 py-2 text-sm font-medium text-medical-muted transition hover:border-gray-300 hover:text-medical-text"
          >
            <LogOut className="h-4 w-4" />
            <span>{t('sidebar.signOut')}</span>
          </button>
          <div className="flex items-center justify-center gap-3 text-[11px] text-medical-muted">
            <Link href="/privacy" className="transition hover:text-medical-text">Privacy</Link>
            <span>·</span>
            <Link href="/terms" className="transition hover:text-medical-text">Terms</Link>
          </div>
        </div>
      </aside>
    </>
  );
}
