import { knowledgeEntries } from '../data/knowledge';
import { learningTopics } from '../data/learning';
import { problems } from '../data/problems';
import { navItems } from '../components/shell/navConfig';
import { matchesQuery } from './search';

export interface SearchEntry {
  id: string;
  title: string;
  hint: string;
  group: 'Bo‘limlar' | 'Kalkulyatorlar' | 'Diagnostika' | 'Akademiya' | 'Kutubxona';
  to: string;
  /** Qo‘shimcha qidiruv matni */
  extra: string;
}

const calculatorEntries: SearchEntry[] = [
  { title: 'Om qonuni', hint: 'U = I × R', extra: 'kuchlanish tok qarshilik' },
  { title: 'Quvvat kalkulyatori', hint: 'P = U × I', extra: 'vatt quvvat' },
  { title: 'Tok kalkulyatori', hint: 'I = P / U', extra: 'amper tok' },
  { title: 'Energiya sarfi', hint: 'kVt·soat va narx', extra: 'elektr narxi tarif energiya' },
].map((c, i) => ({ id: `calc-${i}`, group: 'Kalkulyatorlar' as const, to: '/calculators', ...c }));

/** Global qidiruv indeksi: faqat haqiqiy mavjud sahifalar va yozuvlar. */
export const searchIndex: SearchEntry[] = [
  ...navItems.map((n) => ({
    id: `nav-${n.to}`,
    title: n.label,
    hint: 'Bo‘lim',
    group: 'Bo‘limlar' as const,
    to: n.to,
    extra: '',
  })),
  ...calculatorEntries,
  ...problems.map((p) => ({
    id: `prob-${p.id}`,
    title: p.title,
    hint: p.summary,
    group: 'Diagnostika' as const,
    to: `/diagnostics?problem=${encodeURIComponent(p.id)}`,
    extra: p.category,
  })),
  ...learningTopics.map((t) => ({
    id: `learn-${t.slug}`,
    title: t.title,
    hint: t.summary,
    group: 'Akademiya' as const,
    to: `/academy/${t.slug}`,
    extra: t.level,
  })),
  ...knowledgeEntries.map((k) => ({
    id: `kb-${k.id}`,
    title: k.term,
    hint: k.definition,
    group: 'Kutubxona' as const,
    to: `/library?q=${encodeURIComponent(k.term)}`,
    extra: k.category,
  })),
];

export function searchAll(query: string, limit = 24): SearchEntry[] {
  if (!query.trim()) return [];
  return searchIndex.filter((e) => matchesQuery(query, e.title, e.hint, e.extra)).slice(0, limit);
}
