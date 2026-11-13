import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/dashboard" aria-label="NEYTRON — boshqaruv paneliga o‘tish" className="flex items-center gap-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
        <Zap className="size-5" aria-hidden />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block font-[var(--font-display)] text-base font-bold tracking-wide">NEYTRON</span>
          <span className="block text-[11px] text-[var(--text-muted)]">Elektr muhandislik platformasi</span>
        </span>
      )}
    </Link>
  );
}
