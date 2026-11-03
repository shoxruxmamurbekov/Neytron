import { useMemo, useState, type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, Field, Input, Select } from '../../../components/ui';
import { FURNITURE_OPTIONS, MOUNT_TYPES, ROOM_TYPES, WALL_LABELS } from '../data/constants';
import type { Opening, OpeningKind, Room, WallSide } from '../types';
import { roomDraftFrom, validateRoomDraft, parseNumber, type Errors, type RoomDraft } from '../utils/validation';
import { floorHasOverlap, fitRoomContents, openingProblems, round, wallLength } from '../utils/geometry';
import { createOpening } from '../utils/factory';
import { fmtArea, fmtM } from '../utils/format';

interface OpeningDraft {
  id: string;
  kind: OpeningKind;
  wall: WallSide;
  offset: string;
  width: string;
  height: string;
  sillHeight: string;
}

const openingToDraft = (o: Opening): OpeningDraft => ({
  id: o.id,
  kind: o.kind,
  wall: o.wall,
  offset: String(o.offset),
  width: String(o.width),
  height: String(o.height),
  sillHeight: String(o.sillHeight),
});

function newOpeningDraft(): OpeningDraft {
  const o = createOpening('door', 'S', 0.5, 0.9, 2.1, 0);
  return openingToDraft(o);
}

interface Props {
  /** Tahrirlash uchun mavjud xona; yangi xona uchun to‘ldirilgan shablon */
  initial: Room;
  /** Shu qavatdagi boshqa xonalar (kesishishni tekshirish uchun) */
  floorRooms: Room[];
  submitLabel: string;
  onSave: (room: Room) => void;
  onCancel?: () => void;
  /** Dialog ichida ishlatilganda ixcham ko‘rinish */
  compact?: boolean;
}

export default function RoomForm({ initial, floorRooms, submitLabel, onSave, onCancel, compact = false }: Props) {
  const [draft, setDraft] = useState<RoomDraft>(() => roomDraftFrom(initial));
  const [openings, setOpenings] = useState<OpeningDraft[]>(() => initial.openings.map(openingToDraft));
  const [errors, setErrors] = useState<Errors>({});
  const [openingErrors, setOpeningErrors] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const set = <K extends keyof RoomDraft>(key: K, value: RoomDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => {
      if (!(key in e)) return e;
      const next = { ...e };
      delete next[key as string];
      return next;
    });
  };

  const liveArea = useMemo(() => {
    const l = parseNumber(draft.length);
    const w = parseNumber(draft.width);
    return l !== null && w !== null && l > 0 && w > 0 ? round(l * w, 2) : null;
  }, [draft.length, draft.width]);

  const toggleFurniture = (tag: string) =>
    set('furniture', draft.furniture.includes(tag) ? draft.furniture.filter((t) => t !== tag) : [...draft.furniture, tag]);

  const updateOpening = (id: string, patch: Partial<OpeningDraft>) =>
    setOpenings((list) => list.map((o) => (o.id === id ? { ...o, ...patch } : o)));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const { errors: errs, values } = validateRoomDraft(draft);
    setErrors(errs);
    if (!values) return;

    // Teshiklarni tekshirish
    const built: Opening[] = openings.map((o) => ({
      id: o.id,
      kind: o.kind,
      wall: o.wall,
      offset: parseNumber(o.offset) ?? NaN,
      width: parseNumber(o.width) ?? NaN,
      height: parseNumber(o.height) ?? NaN,
      sillHeight: o.kind === 'window' ? (parseNumber(o.sillHeight) ?? NaN) : 0,
    }));
    const probe = { length: values.length, width: values.width, height: values.height };
    const problems: string[] = [];
    built.forEach((op, i) => {
      const list = openingProblems(op, probe);
      if (list.length > 0) problems.push(`${i + 1}-teshik: ${list.join('; ')}`);
    });
    setOpeningErrors(problems);
    if (problems.length > 0) return;

    const candidate: Room = {
      ...initial,
      name: values.name,
      type: values.type,
      length: values.length,
      width: values.width,
      height: values.height,
      mountType: values.mountType,
      furniture: values.furniture,
      x: values.x,
      y: values.y,
      openings: built,
    };
    const overlap = floorHasOverlap({ id: 'tmp', name: '', height: 0, rooms: floorRooms }, candidate);
    if (overlap) {
      setFormError(`Bu xona “${overlap.name}” xonasi bilan kesishadi. Joylashuv (X, Y) ni o‘zgartiring.`);
      return;
    }
    onSave(fitRoomContents(candidate));
  };

  const fieldGap = compact ? 'gap-3' : 'gap-4';

  return (
    <form onSubmit={submit} noValidate className={`flex flex-col ${fieldGap}`}>
      {formError && (
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {formError}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="rf-name" label="Xona nomi" error={errors.name}>
          <Input id="rf-name" value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="masalan, Mehmonxona" />
        </Field>
        <Field id="rf-type" label="Xona turi">
          <Select id="rf-type" value={draft.type} onChange={(e) => set('type', e.target.value as RoomDraft['type'])}>
            {ROOM_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Xona o‘lchamlari (m)</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="rf-length" label="Uzunlik" error={errors.length} hint="0,5 – 40 m">
            <Input id="rf-length" inputMode="decimal" value={draft.length} onChange={(e) => set('length', e.target.value)} aria-invalid={Boolean(errors.length)} />
          </Field>
          <Field id="rf-width" label="Kenglik" error={errors.width} hint="0,5 – 40 m">
            <Input id="rf-width" inputMode="decimal" value={draft.width} onChange={(e) => set('width', e.target.value)} aria-invalid={Boolean(errors.width)} />
          </Field>
          <Field id="rf-height" label="Balandlik" error={errors.height} hint="2 – 6 m">
            <Input id="rf-height" inputMode="decimal" value={draft.height} onChange={(e) => set('height', e.target.value)} aria-invalid={Boolean(errors.height)} />
          </Field>
        </div>
        <p className="text-sm text-[var(--text-muted)]" aria-live="polite">
          Maydon (avtomatik): <span className="font-semibold text-[var(--text)]">{liveArea !== null ? fmtArea(liveArea) : '—'}</span>
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Montaj turi</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {MOUNT_TYPES.map((m) => (
            <label
              key={m.value}
              className={`flex cursor-pointer gap-3 rounded-xl border p-3 text-sm ${
                draft.mountType === m.value ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/15' : 'border-[var(--border)]'
              }`}
            >
              <input
                type="radio"
                name="mount"
                className="mt-1 accent-brand-600"
                checked={draft.mountType === m.value}
                onChange={() => set('mountType', m.value)}
              />
              <span>
                <span className="block font-medium">{m.label}</span>
                <span className="text-xs text-[var(--text-muted)]">{m.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Mebel va jihozlar</legend>
        <div className="flex flex-wrap gap-2">
          {FURNITURE_OPTIONS.map((f) => {
            const on = draft.furniture.includes(f.tag);
            return (
              <button
                key={f.tag}
                type="button"
                aria-pressed={on}
                onClick={() => toggleFurniture(f.tag)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  on ? 'border-brand-500 bg-brand-500 text-white' : 'border-[var(--border)] hover:bg-[var(--surface-muted)]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-[var(--text-muted)]">Shablonlarni tanlashda mebel teglari hisobga olinadi.</p>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <legend className="text-sm font-medium">Eshik va derazalar</legend>
          <Button type="button" variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setOpenings((l) => [...l, newOpeningDraft()])}>
            <Plus className="size-3.5" aria-hidden /> Qo‘shish
          </Button>
        </div>
        {openings.length === 0 && <p className="text-sm text-[var(--text-muted)]">Teshik qo‘shilmagan.</p>}
        {openings.map((o, idx) => (
          <Card key={o.id} className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {idx + 1}. {o.kind === 'door' ? 'Eshik' : 'Deraza'}
              </span>
              <button
                type="button"
                onClick={() => setOpenings((l) => l.filter((x) => x.id !== o.id))}
                aria-label={`${idx + 1}-teshikni o‘chirish`}
                className="grid size-8 place-items-center rounded-lg text-danger hover:bg-danger-soft"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field id={`op-kind-${o.id}`} label="Turi">
                <Select id={`op-kind-${o.id}`} value={o.kind} onChange={(e) => updateOpening(o.id, { kind: e.target.value as OpeningKind })}>
                  <option value="door">Eshik</option>
                  <option value="window">Deraza</option>
                </Select>
              </Field>
              <Field id={`op-wall-${o.id}`} label="Devor">
                <Select id={`op-wall-${o.id}`} value={o.wall} onChange={(e) => updateOpening(o.id, { wall: e.target.value as WallSide })}>
                  {(Object.keys(WALL_LABELS) as WallSide[]).map((w) => (
                    <option key={w} value={w}>
                      {WALL_LABELS[w]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field id={`op-offset-${o.id}`} label="Boshidan masofa (m)" hint={`Devor: ${fmtM(wallLength({ length: parseNumber(draft.length) ?? 0, width: parseNumber(draft.width) ?? 0 }, o.wall))} m`}>
                <Input id={`op-offset-${o.id}`} inputMode="decimal" value={o.offset} onChange={(e) => updateOpening(o.id, { offset: e.target.value })} />
              </Field>
              <Field id={`op-width-${o.id}`} label="Kenglik (m)">
                <Input id={`op-width-${o.id}`} inputMode="decimal" value={o.width} onChange={(e) => updateOpening(o.id, { width: e.target.value })} />
              </Field>
              <Field id={`op-height-${o.id}`} label="Balandlik (m)">
                <Input id={`op-height-${o.id}`} inputMode="decimal" value={o.height} onChange={(e) => updateOpening(o.id, { height: e.target.value })} />
              </Field>
              {o.kind === 'window' && (
                <Field id={`op-sill-${o.id}`} label="Parapet (m)" hint="Pol sathidan">
                  <Input id={`op-sill-${o.id}`} inputMode="decimal" value={o.sillHeight} onChange={(e) => updateOpening(o.id, { sillHeight: e.target.value })} />
                </Field>
              )}
            </div>
          </Card>
        ))}
        {openingErrors.length > 0 && (
          <ul role="alert" className="flex flex-col gap-1 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
            {openingErrors.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">Qavatdagi joylashuv</legend>
        <Field id="rf-x" label="Qavatda X (m)" error={errors.x} hint="Plan bo‘yicha chap chekka">
          <Input id="rf-x" inputMode="decimal" value={draft.x} onChange={(e) => set('x', e.target.value)} />
        </Field>
        <Field id="rf-y" label="Qavatda Y (m)" error={errors.y} hint="Plan bo‘yicha yuqori chekka">
          <Input id="rf-y" inputMode="decimal" value={draft.y} onChange={(e) => set('y', e.target.value)} />
        </Field>
      </fieldset>

      <div className="flex flex-wrap justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Bekor qilish
          </Button>
        )}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
