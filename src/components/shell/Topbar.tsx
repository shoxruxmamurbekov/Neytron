import { Link } from 'react-router-dom';
import { Bell, Moon, Settings, Sun, UserRound } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import Dropdown from '../Dropdown';
import Brand from './Brand';
import GlobalSearch from './GlobalSearch';

function ThemeToggle() {
  const { setMode } = useTheme();
  const toggle = () => setMode(document.documentElement.classList.contains('dark') ? 'light' : 'dark');
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Mavzuni almashtirish (yorug‘ / qorong‘i)"
      className="grid min-h-10 min-w-10 place-items-center rounded-xl text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
    >
      <Sun className="hidden size-5 dark:block" aria-hidden />
      <Moon className="size-5 dark:hidden" aria-hidden />
    </button>
  );
}

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-2 backdrop-blur sm:px-6 lg:px-10">
      <div className="lg:hidden">
        <Brand compact />
      </div>
      <div className="flex min-w-0 flex-1 justify-start">
        <GlobalSearch />
      </div>

      <ThemeToggle />

      <Dropdown label="Bildirishnomalar" trigger={<Bell className="size-5" aria-hidden />}>
        {() => (
          <div className="px-3 py-6 text-center">
            <p className="text-sm font-medium">Yangi bildirishnomalar yo‘q</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Bildirishnomalar server (backend) ulangandan keyin ishlaydi.
            </p>
          </div>
        )}
      </Dropdown>

      <Dropdown label="Foydalanuvchi menyusi" trigger={<UserRound className="size-5" aria-hidden />} panelClassName="w-60">
        {(close) => (
          <div className="flex flex-col">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">Mehmon</p>
              <p className="text-xs text-[var(--text-muted)]">Hisob tizimi hali ulanmagan</p>
            </div>
            <Link
              to="/profile"
              onClick={close}
              className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm hover:bg-[var(--surface-muted)]"
            >
              <UserRound className="size-4" aria-hidden /> Profil
            </Link>
            <Link
              to="/settings"
              onClick={close}
              className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm hover:bg-[var(--surface-muted)]"
            >
              <Settings className="size-4" aria-hidden /> Sozlamalar
            </Link>
          </div>
        )}
      </Dropdown>
    </header>
  );
}
