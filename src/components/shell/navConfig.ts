import {
  Calculator,
  FolderKanban,
  GraduationCap,
  House,
  Info,
  Library,
  LayoutDashboard,
  Sparkles,
  Stethoscope,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  /** Mobil pastki panel uchun qisqa yorliq */
  short: string;
  icon: LucideIcon;
  /** true bo‘lsa mobil pastki panelda doim ko‘rinadi, aks holda "Yana" menyusida */
  primary: boolean;
  /** Shu yo‘llarda ham faol deb belgilanadi (masalan, /settings → Profil) */
  alsoActive?: string[];
}

/** Asosiy navigatsiya — sidebar, mobil panel va global qidiruv uchun yagona manba. */
export const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Boshqaruv paneli', short: 'Panel', icon: LayoutDashboard, primary: true },
  { to: '/assistant', label: 'NEYTRON AI', short: 'AI', icon: Sparkles, primary: true },
  { to: '/diagnostics', label: 'Diagnostika', short: 'Diagnostika', icon: Stethoscope, primary: true },
  { to: '/calculators', label: 'Kalkulyatorlar', short: 'Hisob', icon: Calculator, primary: true },
  { to: '/visual-montage', label: 'Vizual montaj', short: 'Montaj', icon: House, primary: true },
  { to: '/academy', label: 'Elektr akademiyasi', short: 'Akademiya', icon: GraduationCap, primary: false },
  { to: '/library', label: 'Texnik kutubxona', short: 'Kutubxona', icon: Library, primary: false },
  { to: '/projects', label: 'Loyihalarim', short: 'Loyihalar', icon: FolderKanban, primary: false },
  {
    to: '/profile',
    label: 'Profil va sozlamalar',
    short: 'Profil',
    icon: UserRound,
    primary: false,
    alsoActive: ['/settings'],
  },
];

export const aboutLink = { to: '/about', label: 'NEYTRON haqida', icon: Info };

const within = (pathname: string, base: string) => pathname === base || pathname.startsWith(`${base}/`);

export function isNavActive(item: NavItem, pathname: string): boolean {
  return within(pathname, item.to) || (item.alsoActive?.some((p) => within(pathname, p)) ?? false);
}
