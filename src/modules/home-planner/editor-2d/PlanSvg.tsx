import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import type { CableRoute, ElectricalObject, Opening, Point, Room, WallSide } from '../types';
import { OBJECT_CATALOG } from '../data/constants';
import { polylineLength, round } from '../utils/geometry';
import { worldToScreen, type View } from './viewport';

/**
 * Chizma komponentlari. Ekrandagi editor va SVG/PDF eksport bir xil komponentlardan foydalanadi.
 * Ranglar palitra orqali beriladi: ekranda CSS o‘zgaruvchilari, eksportda aniq HEX qiymatlar.
 */
export interface PlanPalette {
  wall: string;
  floor: string;
  grid: string;
  text: string;
  muted: string;
  accent: string;
  glass: string;
  door: string;
  object: string;
  route: string;
  selected: string;
}

export const LIVE_PALETTE: PlanPalette = {
  wall: 'var(--text)',
  floor: 'var(--surface)',
  grid: 'var(--border)',
  text: 'var(--text)',
  muted: 'var(--text-muted)',
  accent: '#1758b0',
  glass: '#9ed3f5',
  door: '#8a6d3b',
  object: 'var(--text)',
  route: '#d97706',
  selected: '#1d6fd8',
};

export const EXPORT_PALETTE: PlanPalette = {
  wall: '#0f1b2d',
  floor: '#ffffff',
  grid: '#e3e8ef',
  text: '#0f1b2d',
  muted: '#5b6b82',
  accent: '#1758b0',
  glass: '#9ed3f5',
  door: '#8a6d3b',
  object: '#0f1b2d',
  route: '#d97706',
  selected: '#1d6fd8',
};

export interface Selection {
  type: 'object' | 'route';
  id: string;
}

export interface PlanHandlers {
  onObjectDown?: (id: string, e: ReactPointerEvent<SVGGElement>) => void;
  onRouteDown?: (id: string, e: ReactPointerEvent<SVGGElement>) => void;
}

const FONT = 'Inter, system-ui, sans-serif';

/* ---------- Grid ---------- */
export function GridLayer({ view, width, height, offset, palette }: { view: View; width: number; height: number; offset: Point; palette: PlanPalette }) {
  const step = view.scale > 150 ? 0.25 : view.scale > 60 ? 0.5 : 1;
  const lines: ReactNode[] = [];
  // Ekrandagi dunyo chegaralari (taxminiy)
  const left = (-view.panX - 48) / view.scale - offset.x;
  const right = (width - view.panX - 48) / view.scale - offset.x;
  const top = (-view.panY - 48) / view.scale - offset.y;
  const bottom = (height - view.panY - 48) / view.scale - offset.y;
  const x0 = Math.floor(left / step) * step;
  const y0 = Math.floor(top / step) * step;
  let count = 0;
  for (let x = x0; x <= right && count < 600; x += step, count += 1) {
    const p = worldToScreen({ x, y: 0 }, view, offset);
    lines.push(<line key={`gx${x.toFixed(3)}`} x1={p.x} x2={p.x} y1={0} y2={height} style={{ stroke: palette.grid }} strokeWidth={x % 1 === 0 ? 1 : 0.5} />);
  }
  for (let y = y0; y <= bottom && count < 1200; y += step, count += 1) {
    const p = worldToScreen({ x: 0, y }, view, offset);
    lines.push(<line key={`gy${y.toFixed(3)}`} y1={p.y} y2={p.y} x1={0} x2={width} style={{ stroke: palette.grid }} strokeWidth={y % 1 === 0 ? 1 : 0.5} />);
  }
  return <g aria-hidden>{lines}</g>;
}

/* ---------- Room shell: floor, walls, openings, dimensions ---------- */
export function RoomShell({
  room,
  view,
  offset,
  palette,
  showLabels,
}: {
  room: Room;
  view: View;
  offset: Point;
  palette: PlanPalette;
  showLabels: boolean;
}) {
  const p = (x: number, y: number) => worldToScreen({ x, y }, view, offset);
  const tl = p(0, 0);
  const br = p(room.length, room.width);
  const w = br.x - tl.x;
  const h = br.y - tl.y;
  const wallPx = Math.max(2, 0.12 * view.scale);

  return (
    <g>
      <rect x={tl.x} y={tl.y} width={w} height={h} style={{ fill: palette.floor }} />
      <rect x={tl.x} y={tl.y} width={w} height={h} fill="none" style={{ stroke: palette.wall }} strokeWidth={wallPx} />
      {room.openings.map((op) => (
        <OpeningSymbol key={op.id} op={op} room={room} view={view} offset={offset} palette={palette} />
      ))}
      {showLabels && (
        <g style={{ fontFamily: FONT }}>
          <text x={tl.x + w / 2} y={tl.y - 10} textAnchor="middle" fontSize={12} style={{ fill: palette.muted }}>
            {room.name} · {round(room.length)} m
          </text>
          <text
            x={tl.x - 10}
            y={tl.y + h / 2}
            textAnchor="middle"
            fontSize={12}
            transform={`rotate(-90 ${tl.x - 10} ${tl.y + h / 2})`}
            style={{ fill: palette.muted }}
          >
            {round(room.width)} m
          </text>
          <text x={tl.x + w / 2} y={br.y + 16} textAnchor="middle" fontSize={11} style={{ fill: palette.muted }}>
            {round(room.length * room.width)} m² · {round(room.height)} m balandlik
          </text>
        </g>
      )}
    </g>
  );
}

function OpeningSymbol({ op, room, view, offset, palette }: { op: Opening; room: Room; view: View; offset: Point; palette: PlanPalette }) {
  const p = (x: number, y: number) => worldToScreen({ x, y }, view, offset);
  const seg = segmentOf(op.wall, op.offset, op.width, room);
  const a = p(seg.x1, seg.y1);
  const b = p(seg.x2, seg.y2);
  const wallPx = Math.max(2, 0.12 * view.scale);
  const normal = inwardNormal(op.wall);

  if (op.kind === 'window') {
    const gap = 0.06 * view.scale;
    return (
      <g>
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth={wallPx + 2} style={{ stroke: palette.floor }} />
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth={1.5} style={{ stroke: palette.glass }} />
        <line x1={a.x + normal.x * gap} y1={a.y + normal.y * gap} x2={b.x + normal.x * gap} y2={b.y + normal.y * gap} strokeWidth={1.5} style={{ stroke: palette.glass }} />
        <line x1={a.x - normal.x * gap} y1={a.y - normal.y * gap} x2={b.x - normal.x * gap} y2={b.y - normal.y * gap} strokeWidth={1.5} style={{ stroke: palette.glass }} />
      </g>
    );
  }

  // Eshik: devor teshigi + to‘lqin (ochilish yoyi)
  const r = op.width * view.scale;
  const hx = a.x + normal.x * r;
  const hy = a.y + normal.y * r;
  return (
    <g>
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth={wallPx + 2} style={{ stroke: palette.floor }} />
      <line x1={a.x} y1={a.y} x2={hx} y2={hy} strokeWidth={2} style={{ stroke: palette.door }} />
      <path d={`M ${b.x} ${b.y} A ${r} ${r} 0 0 1 ${hx} ${hy}`} fill="none" strokeWidth={1} strokeDasharray="4 3" style={{ stroke: palette.door }} />
    </g>
  );
}

function segmentOf(wall: WallSide, offset: number, width: number, room: Pick<Room, 'length' | 'width'>) {
  switch (wall) {
    case 'N':
      return { x1: offset, y1: 0, x2: offset + width, y2: 0 };
    case 'S':
      return { x1: offset, y1: room.width, x2: offset + width, y2: room.width };
    case 'W':
      return { x1: 0, y1: offset, x2: 0, y2: offset + width };
    case 'E':
      return { x1: room.length, y1: offset, x2: room.length, y2: offset + width };
  }
}

function inwardNormal(wall: WallSide): Point {
  switch (wall) {
    case 'N':
      return { x: 0, y: 1 };
    case 'S':
      return { x: 0, y: -1 };
    case 'W':
      return { x: 1, y: 0 };
    case 'E':
      return { x: -1, y: 0 };
  }
}

/* ---------- Elektr belgilari ---------- */
export function ObjectSymbol({
  obj,
  view,
  offset,
  palette,
  selected,
  showLabel,
  position,
  handlers,
}: {
  obj: ElectricalObject;
  view: View;
  offset: Point;
  palette: PlanPalette;
  selected: boolean;
  showLabel: boolean;
  /** Sudrash paytida vaqtinchalik joylashuv */
  position?: Point;
  handlers?: PlanHandlers;
}) {
  const pos = position ?? { x: obj.x, y: obj.y };
  const c = worldToScreen(pos, view, offset);
  const h = Math.max(7, 0.1 * view.scale);
  const stroke = selected ? palette.selected : palette.object;
  const cat = OBJECT_CATALOG[obj.kind];

  return (
    <g
      data-object-id={obj.id}
      data-kind={obj.kind}
      style={{ cursor: handlers?.onObjectDown ? 'grab' : 'default' }}
      onPointerDown={handlers?.onObjectDown ? (e) => handlers.onObjectDown?.(obj.id, e) : undefined}
    >
      {/* Keng hit-zona: kichik belgilarni ham tanlash oson bo‘lishi uchun */}
      <circle cx={c.x} cy={c.y} r={h * 1.6} fill="transparent" />
      {selected && <circle cx={c.x} cy={c.y} r={h * 1.7} fill="none" strokeDasharray="4 3" strokeWidth={1.5} style={{ stroke: palette.selected }} />}
      <g transform={`rotate(${obj.rotation} ${c.x} ${c.y})`} style={{ fontFamily: FONT }}>
        <SymbolShape kind={obj.kind} cx={c.x} cy={c.y} h={h} stroke={stroke} palette={palette} />
      </g>
      {showLabel && (
        <text x={c.x} y={c.y + h * 2 + 10} textAnchor="middle" fontSize={11} style={{ fill: palette.text, fontFamily: FONT }}>
          {cat.shortLabel}
        </text>
      )}
    </g>
  );
}

function SymbolShape({ kind, cx, cy, h, stroke, palette }: { kind: ElectricalObject['kind']; cx: number; cy: number; h: number; stroke: string; palette: PlanPalette }) {
  const sw = 1.5;
  switch (kind) {
    case 'ceiling_light':
      return (
        <g style={{ stroke, fill: 'none' }} strokeWidth={sw}>
          <circle cx={cx} cy={cy} r={h} />
          <line x1={cx - h * 0.7} y1={cy - h * 0.7} x2={cx + h * 0.7} y2={cy + h * 0.7} />
          <line x1={cx + h * 0.7} y1={cy - h * 0.7} x2={cx - h * 0.7} y2={cy + h * 0.7} />
        </g>
      );
    case 'spotlight':
      return (
        <g>
          <circle cx={cx} cy={cy} r={h} style={{ fill: 'none', stroke }} strokeWidth={sw} strokeDasharray="3 2" />
          <circle cx={cx} cy={cy} r={h * 0.35} style={{ fill: stroke, stroke: 'none' }} />
        </g>
      );
    case 'switch':
      return (
        <g>
          <rect x={cx - h} y={cy - h} width={h * 2} height={h * 2} rx={2} style={{ fill: palette.floor, stroke }} strokeWidth={sw} />
          <text x={cx} y={cy + h * 0.45} textAnchor="middle" fontSize={h * 1.3} style={{ fill: stroke, fontFamily: FONT, fontWeight: 600 }}>
            K
          </text>
        </g>
      );
    case 'socket':
      return (
        <g>
          <rect x={cx - h} y={cy - h} width={h * 2} height={h * 2} style={{ fill: palette.floor, stroke }} strokeWidth={sw} />
          <circle cx={cx} cy={cy} r={h * 0.45} style={{ fill: 'none', stroke }} strokeWidth={sw} />
        </g>
      );
    case 'double_socket':
      return (
        <g>
          <rect x={cx - h * 1.6} y={cy - h} width={h * 3.2} height={h * 2} style={{ fill: palette.floor, stroke }} strokeWidth={sw} />
          <circle cx={cx - h * 0.8} cy={cy} r={h * 0.4} style={{ fill: 'none', stroke }} strokeWidth={sw} />
          <circle cx={cx + h * 0.8} cy={cy} r={h * 0.4} style={{ fill: 'none', stroke }} strokeWidth={sw} />
        </g>
      );
    case 'appliance_outlet':
      return (
        <g>
          <rect x={cx - h} y={cy - h} width={h * 2} height={h * 2} style={{ fill: palette.floor, stroke }} strokeWidth={sw} />
          <line x1={cx - h} y1={cy + h} x2={cx + h} y2={cy - h} style={{ stroke }} strokeWidth={sw} />
          <line x1={cx - h * 0.2} y1={cy + h} x2={cx + h} y2={cy - h * 0.2} style={{ stroke }} strokeWidth={1} />
        </g>
      );
    case 'distribution_board':
      return (
        <g>
          <rect x={cx - h * 1.3} y={cy - h * 0.9} width={h * 2.6} height={h * 1.8} style={{ fill: palette.floor, stroke }} strokeWidth={sw} />
          <text x={cx} y={cy + h * 0.4} textAnchor="middle" fontSize={h * 0.9} style={{ fill: stroke, fontFamily: FONT, fontWeight: 700 }}>
            SH
          </text>
        </g>
      );
  }
}

/* ---------- Cable routes ---------- */
export function RouteLayer({
  routes,
  view,
  offset,
  palette,
  selectedId,
  showLabels,
  handlers,
}: {
  routes: CableRoute[];
  view: View;
  offset: Point;
  palette: PlanPalette;
  selectedId: string | null;
  showLabels: boolean;
  handlers?: PlanHandlers;
}) {
  return (
    <g>
      {routes.map((r) => {
        if (r.points.length < 2) return null;
        const d = r.points
          .map((pt, i) => {
            const s = worldToScreen(pt, view, offset);
            return `${i === 0 ? 'M' : 'L'} ${s.x} ${s.y}`;
          })
          .join(' ');
        const mid = worldToScreen(r.points[Math.floor(r.points.length / 2)], view, offset);
        const selected = selectedId === r.id;
        return (
          <g
            key={r.id}
            data-route-id={r.id}
            onPointerDown={handlers?.onRouteDown ? (e) => handlers.onRouteDown?.(r.id, e) : undefined}
            style={{ cursor: handlers?.onRouteDown ? 'pointer' : 'default' }}
          >
            <path d={d} fill="none" stroke="transparent" strokeWidth={14} />
            <path
              d={d}
              fill="none"
              strokeWidth={selected ? 3 : 2}
              strokeDasharray="6 4"
              strokeLinejoin="round"
              style={{ stroke: selected ? palette.selected : palette.route }}
            />
            {showLabels && (
              <text x={mid.x + 6} y={mid.y - 6} fontSize={11} style={{ fill: palette.route, fontFamily: FONT }}>
                {round(polylineLength(r.points))} m
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

/** Chizilayotgan kabel yo‘li (hali tugallanmagan). */
export function RouteDraft({ points, view, offset, palette }: { points: Point[]; view: View; offset: Point; palette: PlanPalette }) {
  if (points.length === 0) return null;
  const d = points.map((pt, i) => {
    const s = worldToScreen(pt, view, offset);
    return `${i === 0 ? 'M' : 'L'} ${s.x} ${s.y}`;
  });
  return (
    <g aria-hidden>
      <path d={d.join(' ')} fill="none" strokeWidth={2} strokeDasharray="2 4" style={{ stroke: palette.route }} />
      {points.map((pt, i) => {
        const s = worldToScreen(pt, view, offset);
        return <circle key={`${i}-${s.x}-${s.y}`} cx={s.x} cy={s.y} r={3.5} style={{ fill: palette.route }} />;
      })}
    </g>
  );
}

/* ---------- Umumiy: xona chizmasi (tahrirlashsiz) ---------- */
export function RoomPlanStatic({
  room,
  view,
  offset,
  palette,
  showLabels,
}: {
  room: Room;
  view: View;
  offset: Point;
  palette: PlanPalette;
  showLabels: boolean;
}) {
  return (
    <g>
      <RoomShell room={room} view={view} offset={offset} palette={palette} showLabels={showLabels} />
      <RouteLayer routes={room.routes} view={view} offset={offset} palette={palette} selectedId={null} showLabels={showLabels} />
      {room.objects.map((o) => (
        <ObjectSymbol key={o.id} obj={o} view={view} offset={offset} palette={palette} selected={false} showLabel={showLabels} />
      ))}
    </g>
  );
}
