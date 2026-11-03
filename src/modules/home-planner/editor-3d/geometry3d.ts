import type { ElectricalObject, Room, WallSide } from '../types';
import { OBJECT_CATALOG } from '../data/constants';
import { wallLength, nearestWall } from '../utils/geometry';

/**
 * 3D sahna uchun toza geometriya. Three.js’ga bog‘liq emas — shuning uchun testlanadi.
 *
 * Koordinatalar: reja (x, y) → 3D (x − L/2, balandlik, y − W/2). Xona markazi koordinata boshida.
 * Qutilar markaziy nuqta (center) va o‘lcham (size) bilan beriladi.
 */

export type Vec3 = [number, number, number];

export interface Box {
  role: 'wall' | 'glass' | 'door';
  center: Vec3;
  size: Vec3;
}

export const WALL_THICKNESS = 0.12;

export function planToWorld(x: number, y: number, room: Pick<Room, 'length' | 'width'>): { x: number; z: number } {
  return { x: x - room.length / 2, z: y - room.width / 2 };
}

/** Reja bo‘yicha to‘rtburchakni (x0..x1, y0..y1) 3D qutiga aylantiradi. */
function planRectBox(
  role: Box['role'],
  px0: number,
  px1: number,
  py0: number,
  py1: number,
  y0: number,
  y1: number,
  room: Pick<Room, 'length' | 'width'>,
): Box {
  const x0 = px0 - room.length / 2;
  const x1 = px1 - room.length / 2;
  const z0 = py0 - room.width / 2;
  const z1 = py1 - room.width / 2;
  return {
    role,
    center: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    size: [Math.max(1e-3, Math.abs(x1 - x0)), Math.max(1e-3, y1 - y0), Math.max(1e-3, Math.abs(z1 - z0))],
  };
}

/** Devor segmentini (t0..t1 — devor bo‘ylab, h0..h1 — balandlik) qutiga aylantiradi. */
function wallSegment(side: WallSide, t0: number, t1: number, h0: number, h1: number, room: Room, role: Box['role'] = 'wall', thickness = WALL_THICKNESS): Box {
  const t = thickness / 2;
  switch (side) {
    case 'N':
      return planRectBox(role, t0, t1, -t, t, h0, h1, room);
    case 'S':
      return planRectBox(role, t0, t1, room.width - t, room.width + t, h0, h1, room);
    case 'W':
      return planRectBox(role, -t, t, t0, t1, h0, h1, room);
    case 'E':
      return planRectBox(role, room.length - t, room.length + t, t0, t1, h0, h1, room);
  }
}

/**
 * Xona devorlari: teshiklar (eshik/deraza) kesib tashlangan holda.
 * Deraza: parapet ostidagi qism, yuqoridagi qism va shisha qatlam.
 * Eshik: yuqoridagi qism va eshik bargi.
 */
export function wallBoxes(room: Room): Box[] {
  const H = room.height;
  const boxes: Box[] = [];
  const sides: WallSide[] = ['N', 'E', 'S', 'W'];

  for (const side of sides) {
    const len = wallLength(room, side);
    const ops = room.openings
      .filter((o) => o.wall === side)
      .map((o) => ({ ...o, a: clampNum(o.offset, 0, len), b: clampNum(o.offset + o.width, 0, len) }))
      .filter((o) => o.b > o.a)
      .sort((p, q) => p.a - q.a);

    let cursor = 0;
    for (const op of ops) {
      if (op.a > cursor) boxes.push(wallSegment(side, cursor, op.a, 0, H, room));
      const sill = op.kind === 'window' ? clampNum(op.sillHeight, 0, H) : 0;
      const top = clampNum(sill + op.height, 0, H);
      if (sill > 0) boxes.push(wallSegment(side, op.a, op.b, 0, sill, room));
      if (top < H) boxes.push(wallSegment(side, op.a, op.b, top, H, room));
      if (op.kind === 'window') {
        boxes.push(wallSegment(side, op.a, op.b, sill, top, room, 'glass', 0.03));
      } else {
        boxes.push(wallSegment(side, op.a, op.b, 0, op.height, room, 'door', 0.04));
      }
      cursor = op.b;
    }
    if (cursor < len) boxes.push(wallSegment(side, cursor, len, 0, H, room));
  }
  return boxes;
}

export interface Mount {
  center: Vec3;
  size: Vec3;
  color: 'socket' | 'switch' | 'board' | 'appliance';
}

/** Devorga o‘rnatilgan belgilar uchun kichik quti (eng yaqin devor bo‘yicha yo‘naltirilgan). */
export function wallMountBox(obj: ElectricalObject, room: Room): Mount {
  const wall = nearestWall({ x: obj.x, y: obj.y }, room);
  const base = planToWorld(obj.x, obj.y, room);
  const isBoard = obj.kind === 'distribution_board';
  const along = isBoard ? 0.4 : obj.kind === 'double_socket' ? 0.16 : 0.1;
  const depth = isBoard ? 0.12 : 0.03;
  const h = isBoard ? 0.4 : 0.1;
  const horizontal = wall === 'N' || wall === 'S';
  const size: Vec3 = horizontal ? [along, h, depth] : [depth, h, along];
  const normalOffset = depth / 2 + 0.005;
  const shift: { x: number; z: number } =
    wall === 'N' ? { x: 0, z: normalOffset } : wall === 'S' ? { x: 0, z: -normalOffset } : wall === 'W' ? { x: normalOffset, z: 0 } : { x: -normalOffset, z: 0 };
  const color: Mount['color'] =
    obj.kind === 'switch' ? 'switch' : obj.kind === 'distribution_board' ? 'board' : obj.kind === 'appliance_outlet' ? 'appliance' : 'socket';
  return {
    center: [base.x + shift.x, obj.mountingHeight, base.z + shift.z],
    size,
    color,
  };
}

/** Shiftdagi/spot chiroq joylashuvi. */
export function lightPosition(obj: ElectricalObject, room: Room): Vec3 {
  const p = planToWorld(obj.x, obj.y, room);
  const y = Math.min(obj.mountingHeight, room.height - 0.02);
  return [p.x, y, p.z];
}

export function isLight(obj: ElectricalObject): boolean {
  return obj.kind === 'ceiling_light' || obj.kind === 'spotlight';
}

export function isWallMounted(obj: ElectricalObject): boolean {
  return OBJECT_CATALOG[obj.kind].wallMounted;
}

/** Kabel yo‘lini 3D nuqtalarga aylantiradi (pol sathidan 0.15 m balandlikda). */
export function routePoints(points: { x: number; y: number }[], room: Room): Vec3[] {
  return points.map((p) => {
    const w = planToWorld(p.x, p.y, room);
    return [w.x, 0.15, w.z];
  });
}

const clampNum = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
