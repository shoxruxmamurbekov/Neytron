import type { ElectricalObject, Floor, Opening, Point, Room, WallSide } from '../types';
import { OBJECT_CATALOG } from '../data/constants';

/** Joylashuv qadami (metr). 5 sm — chizmada aniq, lekin boshqarish oson. */
export const SNAP_STEP = 0.05;

/** Devor ichki yuzasidan wall-mounted belgilarning masofasi, m. */
export const WALL_INSET = 0.08;

export const round = (n: number, digits = 2): number => {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
};

export const snap = (v: number, step = SNAP_STEP): number => Math.round(v / step) * step;

export const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));

export const roomArea = (room: Pick<Room, 'length' | 'width'>): number => round(room.length * room.width, 2);

export function wallLength(room: Pick<Room, 'length' | 'width'>, side: WallSide): number {
  return side === 'N' || side === 'S' ? room.length : room.width;
}

/** Nuqtani xona ichiga qisqartiradi. */
export function clampToRoom(p: Point, room: Pick<Room, 'length' | 'width'>, margin = 0): Point {
  return {
    x: clamp(p.x, margin, room.length - margin),
    y: clamp(p.y, margin, room.width - margin),
  };
}

/** Nuqtaga eng yaqin devor tomonini topadi. */
export function nearestWall(p: Point, room: Pick<Room, 'length' | 'width'>): WallSide {
  const dists: [WallSide, number][] = [
    ['N', p.y],
    ['S', room.width - p.y],
    ['W', p.x],
    ['E', room.length - p.x],
  ];
  return dists.reduce((best, cur) => (cur[1] < best[1] ? cur : best))[0];
}

/** Devorga yopishtirilgan belgi koordinatasi (ichki yuzadan WALL_INSET masofada). */
export function snapToWall(p: Point, room: Pick<Room, 'length' | 'width'>): Point {
  const wall = nearestWall(p, room);
  switch (wall) {
    case 'N':
      return { x: clamp(p.x, WALL_INSET, room.length - WALL_INSET), y: WALL_INSET };
    case 'S':
      return { x: clamp(p.x, WALL_INSET, room.length - WALL_INSET), y: room.width - WALL_INSET };
    case 'W':
      return { x: WALL_INSET, y: clamp(p.y, WALL_INSET, room.width - WALL_INSET) };
    case 'E':
      return { x: room.length - WALL_INSET, y: clamp(p.y, WALL_INSET, room.width - WALL_INSET) };
  }
}

/** Belgi uchun to‘g‘ri joylashuv: devor belgisi bo‘lsa devorga, aks holda xona ichiga. */
export function placeObjectPoint(kind: ElectricalObject['kind'], p: Point, room: Pick<Room, 'length' | 'width'>): Point {
  return OBJECT_CATALOG[kind].wallMounted ? snapToWall(p, room) : clampToRoom(p, room, 0.1);
}

/** Teshik (eshik/deraza) geometriyasini tekshiradi. Bo‘sh ro‘yxat — to‘g‘ri. */
export function openingProblems(op: Opening, room: Pick<Room, 'length' | 'width' | 'height'>): string[] {
  const problems: string[] = [];
  const wl = wallLength(room, op.wall);
  if (!(op.width > 0)) problems.push('Teshik kengligi musbat bo‘lishi kerak');
  if (!(op.height > 0)) problems.push('Teshik balandligi musbat bo‘lishi kerak');
  if (op.offset < 0) problems.push('Devor boshidan masofa manfiy bo‘lishi mumkin emas');
  if (op.width > 0 && op.offset + op.width > wl + 1e-9) {
    problems.push(`Teshik devordan chiqib ketadi (devor uzunligi ${round(wl)} m)`);
  }
  if (op.height > room.height + 1e-9) problems.push('Teshik balandligi xona balandligidan katta');
  if (op.kind === 'window') {
    if (op.sillHeight < 0) problems.push('Deraza parapeti manfiy bo‘lishi mumkin emas');
    if (op.sillHeight + op.height > room.height + 1e-9) problems.push('Deraza xona shiftidan baland');
  }
  return problems;
}

/** Ikki to‘rtburchak (qavatdagi xonalar) kesishadimi. Chegaradagi tegish kesishish hisoblanmaydi. */
export function roomsOverlap(
  a: Pick<Room, 'x' | 'y' | 'length' | 'width'>,
  b: Pick<Room, 'x' | 'y' | 'length' | 'width'>,
): boolean {
  const eps = 1e-6;
  return (
    a.x < b.x + b.length - eps &&
    b.x < a.x + a.length - eps &&
    a.y < b.y + b.width - eps &&
    b.y < a.y + a.width - eps
  );
}

export function floorHasOverlap(floor: Floor, candidate: Room): Room | null {
  for (const other of floor.rooms) {
    if (other.id === candidate.id) continue;
    if (roomsOverlap(candidate, other)) return other;
  }
  return null;
}

/** Xona o‘lchami o‘zgarganda jihozlarni yangi chegaralarga moslaydi. */
export function fitRoomContents(room: Room): Room {
  const objects = room.objects.map((o) => {
    const pos = placeObjectPoint(o.kind, { x: o.x, y: o.y }, room);
    return {
      ...o,
      x: round(pos.x, 3),
      y: round(pos.y, 3),
      mountingHeight: clamp(o.mountingHeight, 0, room.height),
    };
  });
  const ids = new Set(objects.map((o) => o.id));
  const fixed = objects.map((o) => (o.switchId && !ids.has(o.switchId) ? { ...o, switchId: undefined } : o));
  const routes = room.routes.map((r) => ({
    ...r,
    points: r.points.map((p) => clampToRoom(p, room, 0)),
  }));
  const openings = room.openings.map((op) => ({
    ...op,
    offset: Math.max(0, Math.min(op.offset, Math.max(0, wallLength(room, op.wall) - op.width))),
  }));
  return { ...room, objects: fixed, routes, openings };
}

export function polylineLength(points: Point[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return total;
}

/** Xona joylashuvidagi (plan) to‘rtburchakning bounding box’i. */
export function floorBounds(floor: Floor): { minX: number; minY: number; maxX: number; maxY: number } {
  if (floor.rooms.length === 0) return { minX: 0, minY: 0, maxX: 5, maxY: 4 };
  return floor.rooms.reduce(
    (b, r) => ({
      minX: Math.min(b.minX, r.x),
      minY: Math.min(b.minY, r.y),
      maxX: Math.max(b.maxX, r.x + r.length),
      maxY: Math.max(b.maxY, r.y + r.width),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  );
}

/** Yangi xona uchun qavatda joy: mavjud xonalarning o‘ng tomonida, 0.5 m oraliq bilan. */
export function nextFreePosition(floor: Floor): Point {
  if (floor.rooms.length === 0) return { x: 0, y: 0 };
  const maxX = floor.rooms.reduce((m, r) => Math.max(m, r.x + r.length), 0);
  return { x: round(maxX + 0.5, 2), y: 0 };
}
