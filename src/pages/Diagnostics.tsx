import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ChevronLeft, Phone } from 'lucide-react';
import { Badge, Card, EmptyState, PageHeader, Select } from '../components/ui';
import { problemCategories, problems } from '../data/problems';
import type { Problem } from '../types';
import { matchesQuery } from '../lib/search';

const sectionsOf = (p: Problem) => [
  { title: 'Muammo tavsifi', items: [p.description] },
  { title: 'Mumkin bo‘lgan sabablar', items: p.possibleCauses },
  { title: 'Ogohlantiruvchi belgilar', items: p.warningSigns },
  { title: 'Xavfsiz dastlabki kuzatuv', items: p.safeObservations },
  { title: 'Tavsiya etiladigan keyingi qadamlar', items: p.nextSteps },
  { title: 'Qachon malakali elektrikni chaqirish kerak', items: p.contactElectrician },
];

export default function Diagnostics() {
  const [params, setParams] = useSearchParams();
  const [category, setCategory] = useState<string>('Barchasi');
  const [query, setQuery] = useState('');

  const selected = problems.find((p) => p.id === params.get('problem')) ?? null;

  const filtered = useMemo(
    () =>
      problems.filter(
        (p) =>
          (category === 'Barchasi' || p.category === category) &&
          matchesQuery(query, p.title, p.summary),
      ),
    [category, query],
  );

  const select = (id: string | null) => {
    if (id) setParams({ problem: id });
    else setParams({});
  };

  if (selected) {
    return (
      <div className="flex flex-col gap-6">
        <button
          type="button"
          onClick={() => select(null)}
          className="inline-flex w-fit items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          <ChevronLeft className="size-4" aria-hidden /> Muammolar ro‘yxati
        </button>

        {selected.emergency && (
          <div role="alert" className="flex gap-3 rounded-2xl border-2 border-danger bg-danger-soft p-5 text-danger">
            <AlertTriangle className="mt-0.5 size-6 shrink-0" aria-hidden />
            <div className="flex flex-col gap-2">
              <p className="text-lg font-semibold">Favqulodda vaziyat</p>
              <ol className="list-decimal space-y-1 pl-5 text-sm">
                <li>Elektr energiyasini asosiy avtomat orqali o‘chiring (agar xavfsiz bo‘lsa).</li>
                <li>Tutun yoki olov bo‘lsa — xonani tark eting.</li>
                <li>Olovni suv bilan o‘chirmang; 101 ga qo‘ng‘iroq qiling.</li>
                <li>Elektr jihozlariga qayta tegmang.</li>
              </ol>
              <a href="tel:103" className="mt-1 inline-flex w-fit items-center gap-2 rounded-xl bg-danger px-4 py-2 text-sm font-medium text-white">
                <Phone className="size-4" aria-hidden /> 103 — Tez tibbiy yordam
              </a>
            </div>
          </div>
        )}

        <header className="flex flex-col gap-2">
          <Badge tone="brand">{selected.category}</Badge>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{selected.title}</h1>
          <p className="max-w-2xl text-[var(--text-muted)]">{selected.summary}</p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {sectionsOf(selected).map((s, idx) => (
            <Card
              key={s.title}
              className={idx === 5 ? 'md:col-span-2 border-warning/40' : ''}
            >
              <h2 className="mb-3 text-sm font-semibold">{s.title}</h2>
              <ul className="flex flex-col gap-2 text-sm">
                {s.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          Bu ma’lumot umumiy yo‘riqnoma. Haqiqiy ta’mirlash ishlari malakali elektrik tomonidan bajarilishi kerak.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Elektr diagnostikasi"
        description="Muammoni tanlang — sabablar, ogohlantiruvchi belgilar va xavfsiz keyingi qadamlar ko‘rsatiladi."
      />

      <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
        <div>
          <label htmlFor="search" className="sr-only">
            Muammolarni qidirish
          </label>
          <input
            id="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Muammoni qidiring…"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div>
          <label htmlFor="cat" className="sr-only">
            Kategoriya
          </label>
          <Select id="cat" value={category} onChange={(e) => setCategory(e.target.value)}>
            {problemCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Mos muammo topilmadi" description="Qidiruvni o‘zgartiring yoki kategoriyani tanlang." />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => select(p.id)}
                className="flex h-full w-full flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-left transition-colors hover:border-brand-500/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge tone="neutral">{p.category}</Badge>
                  {p.emergency && <Badge tone="danger">Favqulodda</Badge>}
                </div>
                <p className="font-semibold">{p.title}</p>
                <p className="text-sm text-[var(--text-muted)]">{p.summary}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
