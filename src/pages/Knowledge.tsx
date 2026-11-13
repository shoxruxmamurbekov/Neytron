import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge, Card, EmptyState, Field, Input, PageHeader, Spinner } from '../components/ui';
import { knowledgeCategories, knowledgeEntries } from '../data/knowledge';
import { matchesQuery } from '../lib/search';
import { useDebounced } from '../hooks/useDebounced';

export default function Knowledge() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [category, setCategory] = useState<string>('Barchasi');
  const debounced = useDebounced(query, 250);
  const loading = query !== debounced;

  const results = useMemo(
    () =>
      knowledgeEntries.filter(
        (e) =>
          (category === 'Barchasi' || e.category === category) &&
          matchesQuery(debounced, e.term, e.definition, e.category),
      ),
    [debounced, category],
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Bilimlar kutubxonasi" description="Jihozlar, komponentlar, asboblar va atamalar. Namuna ma’lumotlar bilan." />

      <div className="flex flex-col gap-4">
        <Field id="kb-search" label="Qidiruv" hint="Atama yoki ta’rif bo‘yicha qidiring">
          <Input id="kb-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="masalan: RCD, avtomat, kabel" />
        </Field>

        <div role="group" aria-label="Kategoriya filtri" className="flex flex-wrap gap-2">
          {knowledgeCategories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                category === c
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-[var(--border)] hover:bg-[var(--surface-muted)]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner label="Qidirilmoqda…" />
      ) : results.length === 0 ? (
        <EmptyState title="Natija topilmadi" description="Boshqa kalit so‘z yoki kategoriyani sinab ko‘ring." />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-live="polite">
          {results.map((e) => (
            <li key={e.id}>
              <Card as="article" className="flex h-full flex-col gap-2">
                <Badge tone="brand">{e.category}</Badge>
                <h2 className="font-semibold">{e.term}</h2>
                <p className="text-sm text-[var(--text-muted)]">{e.definition}</p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
