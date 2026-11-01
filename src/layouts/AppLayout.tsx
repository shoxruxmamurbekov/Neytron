import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Calculator,
  Info,
  Library,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Settings as SettingsIcon,
  Stethoscope,
  X,
  Zap,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export const navItems = [
  { to: '/', label: 'Bosh sahifa', icon: LayoutDashboard, end: true },
  { to: '/assistant', label: 'AI yordamchi', icon: MessageSquare },
  { to: '/diagnostics', label: 'Diagnostika', icon: Stethoscope },
  { to: '/learning', label: 'O‘quv markazi', icon: BookOpen },
  { to: '/calculators', label: 'Kalkulyatorlar', icon: Calculator },
  { to: '/knowledge', label: 'Bilimlar kutubxonasi', icon: Library },
  { to: '/about', label: 'NEYTRON haqida', icon: Info },
  { to: '/settings', label: 'Sozlamalar', icon: SettingsIcon },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white">
        <Zap className="size-5" aria-hidden />
      </div>
      <div className="leading-tight">
        <p className="text-base font-semibold tracking-wide">NEYTRON</p>
        <p className="text-[11px] text-[var(--text-muted)]">Elektr bilim platformasi</p>
      </div>
    </div>
  );
}

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Asosiy navigatsiya" className="flex flex-col gap-1">
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            [
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
              isActive
                ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-100'
                : 'text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]',
            ].join(' ')
          }
        >
          <Icon className="size-4.5 shrink-0" aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AppLayout() {
  useTheme();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col gap-8 border-r border-[var(--border)] bg-[var(--surface)] p-5 lg:flex">
        <Brand />
        <Nav />
        <div className="mt-auto rounded-xl border border-danger/20 bg-danger-soft p-3 text-xs text-danger">
          <p className="font-semibold">Xavf bo‘lsa</p>
          <p className="mt-1">Tok urishi, tutun yoki kuyish hidi — avval elektrni o‘chiring, so‘ng 103 ga qo‘ng‘iroq qiling.</p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Menyuni ochish"
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="grid size-10 place-items-center rounded-xl hover:bg-[var(--surface-muted)]"
        >
          <Menu className="size-5" aria-hidden />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigatsiya">
          <button
            type="button"
            aria-label="Menyuni yopish"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div id="mobile-menu" className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col gap-6 overflow-y-auto bg-[var(--surface)] p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <Brand />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Yopish"
                className="grid size-9 place-items-center rounded-lg hover:bg-[var(--surface-muted)]"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <Nav onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
