import type { ReactNode } from 'react';
import { Copy, Cable, Grid3x3, Hand, Lightbulb, Maximize2, MousePointer2, Plug, Redo2, RotateCw, Tag, Target, ToggleLeft, Trash2, Undo2, ZoomIn, ZoomOut, Zap, Check, X } from 'lucide-react';
import { OBJECT_CATALOG, POINT_KINDS } from '../data/constants';
import type { ObjectKind } from '../types';

export type Tool = 'select' | 'place' | 'route' | 'pan';

interface Props {
  tool: Tool;
  onTool: (t: Tool) => void;
  placeKind: ObjectKind;
  onPlaceKind: (k: ObjectKind) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canEditSelection: boolean;
  canDuplicate: boolean;
  canRotate: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
  onRotate: () => void;
  routeCount: number;
  onFinishRoute: () => void;
  onCancelRoute: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
}

const ICONS: Record<ObjectKind, typeof Lightbulb> = {
  ceiling_light: Lightbulb,
  spotlight: Target,
  switch: ToggleLeft,
  socket: Plug,
  double_socket: Plug,
  appliance_outlet: Zap,
  distribution_board: Tag,
};

function Btn({
  label,
  onClick,
  disabled,
  active,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      aria-pressed={active === undefined ? undefined : active}
      className={[
        'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-sm transition-colors disabled:opacity-40',
        active
          ? 'border-brand-500 bg-brand-500 text-white'
          : danger
            ? 'border-[var(--border)] text-danger hover:bg-danger-soft'
            : 'border-[var(--border)] hover:bg-[var(--surface-muted)]',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

const Divider = () => <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-[var(--border)]" />;

/** 2D editor asboblar paneli. Mobil uchun gorizontal aylantiriladi. */
export default function Toolbar2D(p: Props) {
  return (
    <div role="toolbar" aria-label="Chizma asboblari" className="flex items-center gap-1.5 overflow-x-auto pb-1">
      <Btn label="Tanlash" active={p.tool === 'select'} onClick={() => p.onTool('select')}>
        <MousePointer2 className="size-4" aria-hidden /> <span className="hidden md:inline">Tanlash</span>
      </Btn>
      <Btn label="Ekranni surish" active={p.tool === 'pan'} onClick={() => p.onTool('pan')}>
        <Hand className="size-4" aria-hidden /> <span className="hidden md:inline">Surish</span>
      </Btn>
      <Divider />

      <label className="sr-only" htmlFor="place-kind">
        Joylashtiriladigan jihoz turi
      </label>
      <select
        id="place-kind"
        value={p.placeKind}
        onChange={(e) => p.onPlaceKind(e.target.value as ObjectKind)}
        className="h-9 shrink-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-sm"
      >
        {POINT_KINDS.map((k) => (
          <option key={k} value={k}>
            {OBJECT_CATALOG[k].label}
          </option>
        ))}
      </select>
      <Btn label={`Joylashtirish: ${OBJECT_CATALOG[p.placeKind].label}`} active={p.tool === 'place'} onClick={() => p.onPlaceKind(p.placeKind)}>
        {(() => {
          const Icon = ICONS[p.placeKind];
          return <Icon className="size-4" aria-hidden />;
        })()}
        <span className="hidden md:inline">Qo‘shish</span>
      </Btn>

      <Btn label="Kabel yo‘li chizish" active={p.tool === 'route'} onClick={() => p.onTool('route')}>
        <Cable className="size-4" aria-hidden /> <span className="hidden md:inline">Kabel</span>
      </Btn>
      {p.tool === 'route' && p.routeCount > 0 && (
        <>
          <Btn label="Kabel yo‘lini tugatish" onClick={p.onFinishRoute}>
            <Check className="size-4" aria-hidden /> Tugatish
          </Btn>
          <Btn label="Kabel yo‘lini bekor qilish" onClick={p.onCancelRoute}>
            <X className="size-4" aria-hidden />
          </Btn>
        </>
      )}
      <Divider />

      <Btn label="Bekor qilish (Ctrl+Z)" onClick={p.onUndo} disabled={!p.canUndo}>
        <Undo2 className="size-4" aria-hidden />
      </Btn>
      <Btn label="Qayta bajarish (Ctrl+Y)" onClick={p.onRedo} disabled={!p.canRedo}>
        <Redo2 className="size-4" aria-hidden />
      </Btn>
      <Btn label="Nusxalash (Ctrl+D)" onClick={p.onDuplicate} disabled={!p.canDuplicate}>
        <Copy className="size-4" aria-hidden />
      </Btn>
      <Btn label="Aylantirish (R)" onClick={p.onRotate} disabled={!p.canRotate}>
        <RotateCw className="size-4" aria-hidden />
      </Btn>
      <Btn label="O‘chirish (Delete)" onClick={p.onDelete} disabled={!p.canEditSelection} danger>
        <Trash2 className="size-4" aria-hidden />
      </Btn>
      <Divider />

      <Btn label="Kattalashtirish" onClick={p.onZoomIn}>
        <ZoomIn className="size-4" aria-hidden />
      </Btn>
      <Btn label="Kichiklashtirish" onClick={p.onZoomOut}>
        <ZoomOut className="size-4" aria-hidden />
      </Btn>
      <Btn label="Xonaga sig‘dirish" onClick={p.onFit}>
        <Maximize2 className="size-4" aria-hidden />
      </Btn>
      <Btn label="To‘r (setka)" active={p.showGrid} onClick={p.onToggleGrid}>
        <Grid3x3 className="size-4" aria-hidden />
      </Btn>
      <Btn label="O‘lcham yozuvlari" active={p.showLabels} onClick={p.onToggleLabels}>
        <span className="text-xs font-semibold">1,0m</span>
      </Btn>
    </div>
  );
}
