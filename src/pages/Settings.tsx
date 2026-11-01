import { Monitor, Moon, Sun } from 'lucide-react';
import { Card, PageHeader } from '../components/ui';
import { useTheme, type ThemeMode } from '../hooks/useTheme';

const options: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Yorug‘', icon: Sun },
  { value: 'dark', label: 'Qorong‘i', icon: Moon },
  { value: 'system', label: 'Tizim', icon: Monitor },
];

export default function Settings() {
  const { mode, setMode } = useTheme();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Sozlamalar" description="Interfeys ko‘rinishini o‘zgartiring." />

      <Card as="section" className="flex flex-col gap-4">
        <div>
          <h2 className="font-semibold">Mavzu</h2>
          <p className="text-sm text-[var(--text-muted)]">Tanlov brauzerda saqlanadi.</p>
        </div>
        <div role="radiogroup" aria-label="Mavzu" className="grid grid-cols-3 gap-3">
          {options.map(({ value, label, icon: Icon }) => {
            const active = mode === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setMode(value)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-colors ${
                  active ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100' : 'border-[var(--border)] hover:bg-[var(--surface-muted)]'
                }`}
              >
                <Icon className="size-5" aria-hidden />
                {label}
              </button>
            );
          })}
        </div>
      </Card>

      <Card as="section" className="flex flex-col gap-2">
        <h2 className="font-semibold">Til</h2>
        <p className="text-sm text-[var(--text-muted)]">O‘zbek (lotin). Ko‘p tillilik (ru, en) keyingi bosqichda qo‘shiladi.</p>
      </Card>
    </div>
  );
}
