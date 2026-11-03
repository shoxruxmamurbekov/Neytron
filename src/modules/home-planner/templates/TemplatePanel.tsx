import { useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, Info, ShieldAlert } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Disclaimer } from '../../../components/ui';
import { ROOM_TYPES, MOUNT_TYPES } from '../data/constants';
import { TEMPLATES } from '../data/templates';
import type { LayoutTemplate, Room, TemplateMatch } from '../types';
import { explainExclusions, matchTemplates } from '../utils/templateMatch';
import { applyTemplateToRoom } from '../utils/factory';
import { RoomPlanStatic, LIVE_PALETTE } from '../editor-2d/PlanSvg';
import { fitView } from '../editor-2d/viewport';
import { fmtM } from '../utils/format';

interface Props {
  room: Room;
  onApply: (room: Room) => void;
}

export default function TemplatePanel({ room, onApply }: Props) {
  const [confirming, setConfirming] = useState<string | null>(null);
  const [applied, setApplied] = useState<string | null>(null);

  const input = {
    roomType: room.type,
    length: room.length,
    width: room.width,
    mountType: room.mountType,
    furniture: room.furniture,
  };
  const matches = matchTemplates(input);
  const excluded = explainExclusions(input);

  const apply = (t: LayoutTemplate) => {
    onApply(applyTemplateToRoom(room, t));
    setConfirming(null);
    setApplied(t.id);
  };

  const roomTypeLabel = ROOM_TYPES.find((r) => r.value === room.type)?.label ?? room.type;
  const mountLabel = MOUNT_TYPES.find((m) => m.value === room.mountType)?.label ?? room.mountType;

  return (
    <div className="flex flex-col gap-5">
      <Disclaimer>
        Shablonlar mahalliy kutubxonadan olinadi va <strong>demo</strong> holatda. Ular mutaxassis tomonidan tasdiqlanmagan; haqiqiy
        o‘rnatish oldidan malakali elektrik bilan tekshirilishi shart.
      </Disclaimer>

      <Card className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <span>
          Xona: <strong>{room.name || '—'}</strong> ({roomTypeLabel})
        </span>
        <span>
          O‘lcham: <strong>{fmtM(room.length)} × {fmtM(room.width)} m</strong>
        </span>
        <span>
          Montaj: <strong>{mountLabel.split(' ')[0]}</strong>
        </span>
        <span>
          Mebel teglari: <strong>{room.furniture.length}</strong>
        </span>
      </Card>

      {matches.length === 0 ? (
        <EmptyState
          title="Bu xona uchun mos shablon topilmadi"
          description="Xona turi, o‘lchamlari yoki montaj turi shablon talablariga mos kelmadi. Xona o‘lchamini yoki mebel tanlovini tekshiring, yoki jihozlarni 2D chizmada qo‘lda joylashtiring."
        />
      ) : (
        <section aria-labelledby="matches-h" className="flex flex-col gap-3">
          <h3 id="matches-h" className="text-sm font-semibold">
            Mos shablonlar ({matches.length})
          </h3>
          {matches.map((m) => (
            <MatchCard
              key={m.template.id}
              match={m}
              room={room}
              confirming={confirming === m.template.id}
              applied={applied === m.template.id}
              hasObjects={room.objects.length > 0}
              onAskConfirm={() => setConfirming(m.template.id)}
              onCancelConfirm={() => setConfirming(null)}
              onApply={() => apply(m.template)}
            />
          ))}
        </section>
      )}

      {excluded.length > 0 && <ExcludedList items={excluded} />}

      <p className="text-xs text-[var(--text-muted)]">
        Kutubxonada jami {TEMPLATES.length} ta shablon bor. Ulardan hech biri AI tomonidan yaratilmagan.
      </p>
    </div>
  );
}

function MatchCard({
  match,
  room,
  confirming,
  applied,
  hasObjects,
  onAskConfirm,
  onCancelConfirm,
  onApply,
}: {
  match: TemplateMatch;
  room: Room;
  confirming: boolean;
  applied: boolean;
  hasObjects: boolean;
  onAskConfirm: () => void;
  onCancelConfirm: () => void;
  onApply: () => void;
}) {
  const [open, setOpen] = useState(false);
  const t = match.template;
  return (
    <Card as="article" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap gap-2">
            <Badge tone="brand">Moslik {match.score}%</Badge>
            <Badge tone="warning">Demo — tasdiqlanmagan</Badge>
            <Badge tone="neutral">v{t.version}</Badge>
          </div>
          <h4 className="font-semibold">{t.name}</h4>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{t.description}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Nega mos keldi</p>
          <ul className="flex flex-col gap-1.5 text-sm">
            {match.reasons.map((r) => (
              <li key={r} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                <span>{r}</span>
              </li>
            ))}
          </ul>
          {match.warnings.length > 0 && (
            <ul className="mt-1 flex flex-col gap-1.5 text-sm">
              {match.warnings.map((w) => (
                <li key={w} className="flex gap-2 text-[var(--text-muted)]">
                  <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <TemplateThumb template={t} />
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-fit items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-100"
      >
        <ChevronDown className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
        {open ? 'Tafsilotni yashirish' : 'Tafsilotlar: yoritish, rozetka, kalit, o‘rnatish va xavfsizlik'}
      </button>

      {open && (
        <div className="grid gap-4 text-sm md:grid-cols-2">
          <Detail title="Yoritish" text={t.lighting} />
          <Detail title="Rozetkalar" text={t.sockets} />
          <Detail title="Kalitlar" text={t.switches} />
          <Detail title="Montaj" text={MOUNT_TYPES.find((m) => m.value === t.mountType)?.label ?? 'Har qanday'} />
          <ListBlock title="O‘rnatish eslatmalari" items={t.installationNotes} icon={<Info className="size-4 text-brand-600" aria-hidden />} />
          <ListBlock title="Xavfsizlik eslatmalari" items={t.safetyNotes} icon={<ShieldAlert className="size-4 text-warning" aria-hidden />} />
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
        {applied && !confirming && (
          <p role="status" className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="size-4" aria-hidden /> Shablon qo‘llandi. Jihozlarni 2D chizmada tahrirlashingiz mumkin.
          </p>
        )}
        {!applied && !confirming && <span className="text-xs text-[var(--text-muted)]">Shablon jihozlarni xona o‘lchamiga moslab joylashtiradi.</span>}
        {confirming ? (
          <div role="alertdialog" aria-label="Shablonni qo‘llashni tasdiqlash" className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <p className="flex items-center gap-2 text-sm text-warning">
              <AlertTriangle className="size-4" aria-hidden />
              {hasObjects ? `Xonadagi ${room.objects.length} ta jihoz almashtiriladi.` : 'Shablon qo‘llanadi.'}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onCancelConfirm}>
                Bekor qilish
              </Button>
              <Button onClick={onApply}>Tasdiqlash</Button>
            </div>
          </div>
        ) : (
          <Button onClick={hasObjects ? onAskConfirm : onApply}>Shablonni qo‘llash</Button>
        )}
      </div>
    </Card>
  );
}

function Detail({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl bg-[var(--surface-muted)] p-3">
      <p className="text-xs font-semibold text-[var(--text-muted)]">{title}</p>
      <p className="mt-1">{text}</p>
    </div>
  );
}

function ListBlock({ title, items, icon }: { title: string; items: string[]; icon: ReactNode }) {
  return (
    <div className="rounded-xl bg-[var(--surface-muted)] p-3">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
        {icon}
        {title}
      </p>
      <ul className="flex list-disc flex-col gap-1 pl-5">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

/** Mos kelmagan shablonlar va sabablari — tanlov shaffof bo‘lishi uchun. */
function ExcludedList({ items }: { items: { template: LayoutTemplate; reason: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <section aria-label="Mos kelmagan shablonlar" className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-fit items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
      >
        <ChevronDown className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
        Mos kelmagan shablonlar ({items.length})
      </button>
      {open && (
        <ul className="flex flex-col gap-2 text-sm">
          {items.map(({ template, reason }) => (
            <li key={template.id} className="rounded-xl border border-[var(--border)] px-3 py-2">
              <span className="font-medium">{template.name}</span>
              <span className="block text-xs text-[var(--text-muted)]">{reason}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Shablonning kichik ko‘rinishi: o‘rtacha o‘lchamli xonada joylashuv. */
function TemplateThumb({ template }: { template: LayoutTemplate }) {
  const L = (template.minLength + template.maxLength) / 2;
  const W = (template.minWidth + template.maxWidth) / 2;
  const fake: Room = applyTemplateToRoom(
    {
      id: 'thumb',
      name: '',
      type: template.roomType,
      length: L,
      width: W,
      height: 2.8,
      mountType: template.mountType === 'any' ? 'concealed' : template.mountType,
      furniture: [],
      openings: [],
      objects: [],
      routes: [],
      x: 0,
      y: 0,
    },
    template,
  );
  const w = 220;
  const h = 170;
  const view = fitView({ minX: 0, minY: 0, maxX: L, maxY: W }, w, h);
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-2" aria-label={`${template.name} — ko‘rinishi (taxminiy)`}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-hidden>
        <RoomPlanStatic room={fake} view={view} offset={{ x: 0, y: 0 }} palette={LIVE_PALETTE} showLabels={false} />
      </svg>
      <span className="text-[11px] text-[var(--text-muted)]">Taxminiy joylashuv ({fmtM(L)} × {fmtM(W)} m)</span>
    </div>
  );
}
