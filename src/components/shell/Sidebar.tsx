import { Link, useLocation } from 'react-router-dom';
import Brand from './Brand';
import { aboutLink, isNavActive, navItems } from './navConfig';

export default function Sidebar() {
  const { pathname } = useLocation();
  const AboutIcon = aboutLink.icon;

  return (
    <aside className="sticky top-0 hidden h-dvh w-[264px] shrink-0 flex-col gap-6 overflow-y-auto border-r border-[var(--border)] bg-[var(--surface)] p-4 lg:flex">
      <div className="px-2 pt-1">
        <Brand />
      </div>

      <nav aria-label="Asosiy navigatsiya" className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active = isNavActive(item, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={[
                'flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-100'
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]',
              ].join(' ')}
            >
              <Icon className="size-[18px] shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <div className="rounded-xl border border-danger/30 bg-danger-soft p-3 text-xs text-danger">
          <p className="font-semibold">Xavf bo‘lsa</p>
          <p className="mt-1">
            Tok urishi, tutun yoki kuyish hidi — avval elektrni o‘chiring, so‘ng favqulodda xizmatga qo‘ng‘iroq qiling
            (raqamni o‘z hududingiz bo‘yicha tasdiqlang).
          </p>
        </div>
        <Link
          to={aboutLink.to}
          className="flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
        >
          <AboutIcon className="size-[18px]" aria-hidden />
          {aboutLink.label}
        </Link>
      </div>
    </aside>
  );
}
