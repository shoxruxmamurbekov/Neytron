import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Ellipsis } from 'lucide-react';
import { Modal } from '../ui';
import { aboutLink, isNavActive, navItems } from './navConfig';

const primary = navItems.filter((i) => i.primary);
const more = navItems.filter((i) => !i.primary);
const moreLinks = [...more.map(({ to, label, icon }) => ({ to, label, icon })), aboutLink];

export default function MobileNavigation() {
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = more.some((i) => isNavActive(i, pathname)) || pathname.startsWith(aboutLink.to);

  const slot =
    'flex min-h-14 w-full flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium transition-colors';
  const tone = (active: boolean) => (active ? 'text-brand-600 dark:text-brand-400' : 'text-[var(--text-muted)]');

  return (
    <>
      <nav
        aria-label="Asosiy navigatsiya (mobil)"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--surface)] pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="mx-auto flex max-w-xl items-stretch">
          {primary.map((item) => {
            const active = isNavActive(item, pathname);
            const Icon = item.icon;
            return (
              <li key={item.to} className="flex flex-1">
                <Link to={item.to} aria-current={active ? 'page' : undefined} className={`${slot} ${tone(active)}`}>
                  <Icon className="size-5" aria-hidden />
                  {item.short}
                </Link>
              </li>
            );
          })}
          <li className="flex flex-1">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              className={`${slot} ${tone(moreActive)}`}
            >
              <Ellipsis className="size-5" aria-hidden />
              Yana
            </button>
          </li>
        </ul>
      </nav>

      <Modal open={moreOpen} title="Boshqa bo‘limlar" onClose={() => setMoreOpen(false)}>
        <ul className="flex flex-col gap-1">
          {moreLinks.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                onClick={() => setMoreOpen(false)}
                className="flex min-h-12 items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-[var(--surface-muted)]"
              >
                <Icon className="size-5 text-[var(--text-muted)]" aria-hidden />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}
