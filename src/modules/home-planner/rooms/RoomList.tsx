import { Plus } from 'lucide-react';
import { Badge, Button } from '../../../components/ui';
import { ROOM_TYPES } from '../data/constants';
import type { Room } from '../types';
import { fmtArea, fmtM } from '../utils/format';
import { roomArea } from '../utils/geometry';
import { TEMPLATE_BY_ID } from '../data/templates';

interface Props {
  rooms: Room[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

/** Tanlangan qavatdagi xonalar ro‘yxati. */
export default function RoomList({ rooms, selectedId, onSelect, onAdd }: Props) {
  return (
    <section aria-labelledby="rooms-h" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 id="rooms-h" className="text-sm font-semibold">
          Xonalar ({rooms.length})
        </h2>
        <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={onAdd}>
          <Plus className="size-3.5" aria-hidden /> Xona qo‘shish
        </Button>
      </div>

      {rooms.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--text-muted)]">
          Bu qavatda xona yo‘q. “Xona qo‘shish” tugmasi bilan birinchi xonani qo‘shing.
        </p>
      ) : (
        <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          {rooms.map((r) => {
            const active = r.id === selectedId;
            const typeLabel = ROOM_TYPES.find((t) => t.value === r.type)?.label ?? r.type;
            const tpl = r.templateId ? TEMPLATE_BY_ID.get(r.templateId) : undefined;
            return (
              <li key={r.id} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  onClick={() => onSelect(r.id)}
                  aria-pressed={active}
                  className={`flex w-48 flex-col gap-1.5 rounded-xl border px-3 py-2.5 text-left transition-colors lg:w-full ${
                    active ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/15' : 'border-[var(--border)] bg-[var(--surface)] hover:border-brand-500/50'
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{r.name || 'Nomsiz xona'}</span>
                    {r.objects.length > 0 ? <Badge tone="success">{r.objects.length}</Badge> : <Badge tone="neutral">0</Badge>}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {typeLabel} · {fmtM(r.length)} × {fmtM(r.width)} m · {fmtArea(roomArea(r))}
                  </span>
                  {tpl && <span className="truncate text-[11px] text-brand-600 dark:text-brand-100">Shablon: {tpl.name}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
