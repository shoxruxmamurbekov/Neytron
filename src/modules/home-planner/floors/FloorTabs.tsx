import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui';
import type { Floor } from '../types';

interface Props {
  floors: Floor[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** Qavatlar orasida o‘tish, qo‘shish, tahrirlash va o‘chirish. */
export default function FloorTabs({ floors, activeId, onSelect, onAdd, onEdit, onDelete }: Props) {
  const active = floors.find((f) => f.id === activeId);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Qavatlar" className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
          {floors.map((f) => {
            const on = f.id === activeId;
            return (
              <button
                key={f.id}
                role="tab"
                type="button"
                aria-selected={on}
                onClick={() => onSelect(f.id)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  on ? 'bg-brand-500 font-medium text-white' : 'text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]'
                }`}
              >
                {f.name}
                <span className="ml-1.5 text-xs opacity-80">({f.rooms.length})</span>
              </button>
            );
          })}
        </div>
        <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={onAdd}>
          <Plus className="size-3.5" aria-hidden /> Qavat qo‘shish
        </Button>
        {active && (
          <>
            <Button variant="secondary" className="px-2.5 py-1.5 text-xs" onClick={onEdit} aria-label={`${active.name} — tahrirlash`}>
              <Pencil className="size-3.5" aria-hidden />
            </Button>
            <Button variant="secondary" className="px-2.5 py-1.5 text-xs text-danger" onClick={onDelete} aria-label={`${active.name} — o‘chirish`}>
              <Trash2 className="size-3.5" aria-hidden />
            </Button>
          </>
        )}
      </div>
      {active && (
        <p className="text-xs text-[var(--text-muted)]">
          {active.name}: balandlik {active.height.toLocaleString('uz-UZ')} m · xonalar {active.rooms.length} ta
        </p>
      )}
    </div>
  );
}
