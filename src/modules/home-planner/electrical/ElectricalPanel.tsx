import { useState, type FormEvent } from 'react';
import { Button, Card, Field, Input, Select } from '../../../components/ui';
import { OBJECT_CATALOG, POINT_KINDS } from '../data/constants';
import type { CableRoute, ElectricalObject, LightType, Room } from '../types';
import type { Selection } from '../editor-2d/PlanSvg';
import { placeObjectPoint, polylineLength, round } from '../utils/geometry';
import { validateObjectDraft, type Errors } from '../utils/validation';
import { fmtM } from '../utils/format';

interface Props {
  room: Room;
  selectedObject: ElectricalObject | null;
  selectedRoute: CableRoute | null;
  onSelect: (s: Selection) => void;
  onSaveObject: (id: string, patch: Partial<ElectricalObject>) => void;
  onSaveRoute: (id: string, patch: Partial<CableRoute>) => void;
}

/** Tanlangan jihoz/kabel xossalari va xona bo‘yicha jihozlar ro‘yxati. */
export default function ElectricalPanel({ room, selectedObject, selectedRoute, onSelect, onSaveObject, onSaveRoute }: Props) {
  return (
    <aside aria-label="Elektr jihozlari" className="flex w-full flex-col gap-4 lg:w-[320px] lg:shrink-0">
      {selectedObject ? (
        <ObjectEditor key={selectedObject.id} obj={selectedObject} room={room} onSave={(patch) => onSaveObject(selectedObject.id, patch)} />
      ) : selectedRoute ? (
        <RouteEditor key={selectedRoute.id} route={selectedRoute} onSave={(patch) => onSaveRoute(selectedRoute.id, patch)} />
      ) : (
        <Card className="text-sm text-[var(--text-muted)]">
          Jihozni chizmada tanlang — uning xossalari shu yerda ko‘rinadi va tahrirlanadi.
        </Card>
      )}
      <ObjectList room={room} selection={selectedObject ? { type: 'object', id: selectedObject.id } : selectedRoute ? { type: 'route', id: selectedRoute.id } : null} onSelect={onSelect} />
    </aside>
  );
}

function ObjectEditor({ obj, room, onSave }: { obj: ElectricalObject; room: Room; onSave: (patch: Partial<ElectricalObject>) => void }) {
  const cat = OBJECT_CATALOG[obj.kind];
  const isLight = obj.kind === 'ceiling_light' || obj.kind === 'spotlight';
  const switches = room.objects.filter((o) => o.kind === 'switch');
  const [name, setName] = useState(obj.name);
  const [mountingHeight, setMountingHeight] = useState(String(obj.mountingHeight));
  const [group, setGroup] = useState(obj.group);
  const [circuit, setCircuit] = useState(obj.circuit);
  const [notes, setNotes] = useState(obj.notes);
  const [x, setX] = useState(String(obj.x));
  const [y, setY] = useState(String(obj.y));
  const [lightType, setLightType] = useState<LightType>(obj.lightType ?? (obj.kind === 'spotlight' ? 'spot' : 'ceiling'));
  const [switchId, setSwitchId] = useState<string>(obj.switchId ?? '');
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const { errors: errs, values } = validateObjectDraft({ name, mountingHeight, group, circuit, x, y }, room);
    setErrors(errs);
    if (!values) return;
    const pos = placeObjectPoint(obj.kind, { x: values.x, y: values.y }, room);
    const patch: Partial<ElectricalObject> = {
      name: values.name,
      mountingHeight: round(values.mountingHeight, 2),
      group: values.group,
      circuit: values.circuit,
      notes: notes.trim(),
      x: round(pos.x, 3),
      y: round(pos.y, 3),
    };
    if (isLight) {
      patch.lightType = lightType;
      patch.switchId = switchId || undefined;
    }
    onSave(patch);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  return (
    <Card as="section" className="flex flex-col gap-4">
      <div>
        <p className="text-xs text-[var(--text-muted)]">Tanlangan jihoz</p>
        <h2 className="text-lg font-semibold">{cat.label}</h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {cat.wallMounted ? 'Devorga o‘rnatiladi — chizmada eng yaqin devorga yopishadi.' : 'Shiftga yoki xona ichiga o‘rnatiladi.'}
        </p>
      </div>

      <form noValidate onSubmit={submit} className="flex flex-col gap-3">
        <Field id="ob-name" label="Nomi" error={errors.name}>
          <Input id="ob-name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field id="ob-x" label="X (m)" error={errors.x}>
            <Input id="ob-x" inputMode="decimal" value={x} onChange={(e) => setX(e.target.value)} />
          </Field>
          <Field id="ob-y" label="Y (m)" error={errors.y}>
            <Input id="ob-y" inputMode="decimal" value={y} onChange={(e) => setY(e.target.value)} />
          </Field>
        </div>
        <Field
          id="ob-height"
          label="O‘rnatish balandligi (m)"
          error={errors.mountingHeight}
          hint={`Pol sathidan. Xona balandligi: ${fmtM(room.height)} m`}
        >
          <Input id="ob-height" inputMode="decimal" value={mountingHeight} onChange={(e) => setMountingHeight(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field id="ob-group" label="Elektr guruhi">
            <Input id="ob-group" value={group} onChange={(e) => setGroup(e.target.value)} />
          </Field>
          <Field id="ob-circuit" label="Zanjir">
            <Input id="ob-circuit" value={circuit} onChange={(e) => setCircuit(e.target.value)} />
          </Field>
        </div>

        {isLight && (
          <>
            <Field id="ob-ltype" label="Chiroq turi">
              <Select id="ob-ltype" value={lightType} onChange={(e) => setLightType(e.target.value as LightType)}>
                <option value="ceiling">Shiftdagi chiroq</option>
                <option value="spot">Spot chiroq</option>
              </Select>
            </Field>
            <Field
              id="ob-switch"
              label="Bog‘liq kalit"
              hint={switches.length === 0 ? 'Xonada kalit yo‘q. Avval kalit qo‘shing.' : undefined}
            >
              <Select id="ob-switch" value={switchId} onChange={(e) => setSwitchId(e.target.value)}>
                <option value="">— Bog‘lanmagan —</option>
                {switches.map((s, i) => (
                  <option key={s.id} value={s.id}>
                    {s.name || `Kalit ${i + 1}`}
                  </option>
                ))}
              </Select>
            </Field>
          </>
        )}

        <Field id="ob-notes" label="Izoh">
          <textarea
            id="ob-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </Field>

        <div className="flex items-center justify-between gap-3">
          <span role="status" className="text-xs text-success">
            {saved ? 'Saqlandi' : ''}
          </span>
          <Button type="submit">Saqlash</Button>
        </div>
      </form>
    </Card>
  );
}

function RouteEditor({ route, onSave }: { route: CableRoute; onSave: (patch: Partial<CableRoute>) => void }) {
  const [name, setName] = useState(route.name);
  const [circuit, setCircuit] = useState(route.circuit);
  const [notes, setNotes] = useState(route.notes);
  const [errors, setErrors] = useState<Errors>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Errors = {};
    if (!name.trim()) errs.name = 'Nom kiriting';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave({ name: name.trim(), circuit: circuit.trim(), notes: notes.trim() });
  };

  return (
    <Card as="section" className="flex flex-col gap-4">
      <div>
        <p className="text-xs text-[var(--text-muted)]">Tanlangan kabel yo‘li</p>
        <h2 className="text-lg font-semibold">{route.name}</h2>
        <p className="mt-1 text-sm">
          Taxminiy uzunlik: <span className="font-semibold">{round(polylineLength(route.points))} m</span>
          <span className="text-xs text-[var(--text-muted)]"> · {route.points.length} nuqta</span>
        </p>
      </div>
      <form noValidate onSubmit={submit} className="flex flex-col gap-3">
        <Field id="rt-name" label="Nomi" error={errors.name}>
          <Input id="rt-name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field id="rt-circuit" label="Zanjir">
          <Input id="rt-circuit" value={circuit} onChange={(e) => setCircuit(e.target.value)} />
        </Field>
        <Field id="rt-notes" label="Izoh">
          <textarea
            id="rt-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </Field>
        <p className="text-xs text-[var(--text-muted)]">
          Uzunlik faqat chizma bo‘yicha taxmin. Kabel kesimi bu yerda tanlanmaydi.
        </p>
        <div className="flex justify-end">
          <Button type="submit">Saqlash</Button>
        </div>
      </form>
    </Card>
  );
}

function ObjectList({ room, selection, onSelect }: { room: Room; selection: Selection | null; onSelect: (s: Selection) => void }) {
  const counts = POINT_KINDS.map((k) => ({ kind: k, count: room.objects.filter((o) => o.kind === k).length })).filter((c) => c.count > 0);
  return (
    <Card as="section" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Elektr jihozlari ({room.objects.length})</h2>
        {room.routes.length > 0 && <span className="text-xs text-[var(--text-muted)]">Kabel yo‘llari: {room.routes.length}</span>}
      </div>
      {room.objects.length === 0 && room.routes.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">Hali jihoz yo‘q. Shablon qo‘llang yoki chizmada joylashtiring.</p>
      ) : (
        <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto pr-1">
          {room.objects.map((o) => {
            const active = selection?.type === 'object' && selection.id === o.id;
            return (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => onSelect({ type: 'object', id: o.id })}
                  aria-current={active ? 'true' : undefined}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    active ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100' : 'hover:bg-[var(--surface-muted)]'
                  }`}
                >
                  <span className="truncate">{o.name}</span>
                  <span className="shrink-0 text-xs text-[var(--text-muted)]">
                    {OBJECT_CATALOG[o.kind].shortLabel} · {fmtM(o.mountingHeight)} m
                  </span>
                </button>
              </li>
            );
          })}
          {room.routes.map((r) => {
            const active = selection?.type === 'route' && selection.id === r.id;
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => onSelect({ type: 'route', id: r.id })}
                  aria-current={active ? 'true' : undefined}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    active ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100' : 'hover:bg-[var(--surface-muted)]'
                  }`}
                >
                  <span className="truncate">{r.name}</span>
                  <span className="shrink-0 text-xs text-[var(--text-muted)]">Kabel · {round(polylineLength(r.points))} m</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {counts.length > 0 && (
        <p className="text-xs text-[var(--text-muted)]">
          {counts.map((c) => `${OBJECT_CATALOG[c.kind].shortLabel}: ${c.count}`).join(' · ')}
        </p>
      )}
    </Card>
  );
}
