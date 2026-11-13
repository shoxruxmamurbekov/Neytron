import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { searchAll, type SearchEntry } from '../../lib/globalSearch';

/** Topbar qidiruv tugmasi + buyruq palitrasi (Ctrl/⌘+K yoki "/"). */
export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const results = useMemo(() => searchAll(query), [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === '/' && !typing) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setQuery('');
    setActive(0);
    triggerRef.current?.focus();
  };

  const go = (entry: SearchEntry) => {
    setOpen(false);
    setQuery('');
    setActive(0);
    navigate(entry.to);
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      go(results[active]);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Qidiruvni ochish"
        aria-haspopup="dialog"
        className="flex min-h-10 min-w-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm text-[var(--text-muted)] transition-colors hover:border-brand-500/50 md:w-full md:max-w-md"
      >
        <Search className="size-4 shrink-0" aria-hidden />
        <span className="hidden md:inline">Hisoblash, diagnostika, atama qidirish…</span>
        <kbd className="ml-auto hidden rounded border border-[var(--border)] px-1.5 text-[11px] font-formula md:inline">Ctrl K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10dvh]">
          <button type="button" aria-label="Qidiruvni yopish" tabIndex={-1} className="absolute inset-0 bg-black/40" onClick={close} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Global qidiruv"
            className="relative flex max-h-[70dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl"
          >
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-4">
              <Search className="size-4 text-[var(--text-muted)]" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onInputKey}
                role="combobox"
                aria-expanded={results.length > 0}
                aria-controls={listId}
                aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
                aria-label="Qidiruv so‘rovi"
                placeholder="Nima izlayapsiz?"
                className="min-h-12 w-full bg-transparent text-sm placeholder:text-[var(--text-muted)] focus:outline-none"
              />
            </div>

            <ul id={listId} role="listbox" aria-label="Natijalar" className="overflow-y-auto p-2">
              {results.map((r, i) => (
                <li
                  key={r.id}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(r)}
                  className={`flex cursor-pointer items-start justify-between gap-3 rounded-xl px-3 py-2.5 ${
                    i === active ? 'bg-brand-50 dark:bg-brand-500/15' : ''
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{r.title}</span>
                    <span className="block truncate text-xs text-[var(--text-muted)]">{r.hint}</span>
                  </span>
                  <span className="shrink-0 rounded-full border border-[var(--border)] px-2 py-0.5 text-[11px] text-[var(--text-muted)]">
                    {r.group}
                  </span>
                </li>
              ))}
            </ul>

            {query.trim() && results.length === 0 && (
              <p role="status" className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                «{query.trim()}» bo‘yicha hech narsa topilmadi.
              </p>
            )}
            {!query.trim() && (
              <p className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">
                Bo‘lim, kalkulyator, nosozlik, dars yoki atama nomini yozing.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
