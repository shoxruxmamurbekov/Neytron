import { describe, expect, it } from 'vitest';
import { searchAll, searchIndex } from '../../../lib/globalSearch';
import { isNavActive, navItems } from '../navConfig';

const item = (to: string) => navItems.find((n) => n.to === to)!;

describe('navConfig', () => {
  it('9 ta asosiy bo‘lim, mobil panelda 5 tasi doimiy', () => {
    expect(navItems).toHaveLength(9);
    expect(navItems.filter((n) => n.primary)).toHaveLength(5);
  });

  it('yo‘llar takrorlanmaydi', () => {
    const paths = navItems.map((n) => n.to);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('ichki sahifalarda ota bo‘lim faol bo‘ladi, o‘xshash nomli bo‘lim emas', () => {
    expect(isNavActive(item('/academy'), '/academy/ohm')).toBe(true);
    expect(isNavActive(item('/visual-montage'), '/visual-montage/abc')).toBe(true);
    expect(isNavActive(item('/library'), '/libraryx')).toBe(false);
    expect(isNavActive(item('/dashboard'), '/assistant')).toBe(false);
  });

  it('/settings Profil va sozlamalar bo‘limini faol qiladi', () => {
    expect(isNavActive(item('/profile'), '/settings')).toBe(true);
  });
});

describe('globalSearch', () => {
  it('bo‘sh so‘rov natija bermaydi', () => {
    expect(searchAll('   ')).toEqual([]);
  });

  it('kalkulyator va bo‘limlarni topadi', () => {
    const hits = searchAll('om');
    expect(hits.some((h) => h.to === '/calculators')).toBe(true);
    expect(searchAll('diagnostika').some((h) => h.to === '/diagnostics')).toBe(true);
  });

  it('barcha indeks manzillari mavjud marshrut prefikslaridan biri bilan boshlanadi', () => {
    const known = ['/dashboard', '/assistant', '/diagnostics', '/calculators', '/visual-montage', '/academy', '/library', '/projects', '/profile'];
    for (const e of searchIndex) {
      expect(known.some((k) => e.to === k || e.to.startsWith(`${k}/`) || e.to.startsWith(`${k}?`))).toBe(true);
    }
  });
});
