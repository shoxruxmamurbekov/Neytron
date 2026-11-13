import type { HouseType, MountType, Room, RoomType } from '../types';
import {
  MAX_ROOM_DIM,
  MAX_ROOM_HEIGHT,
  MIN_ROOM_DIM,
  MIN_ROOM_HEIGHT,
} from '../data/constants';

export type Errors = Record<string, string>;

/** Matnni songa aylantiradi. Bo‘sh yoki noto‘g‘ri bo‘lsa null. Vergul va nuqta ikkalasi qabul qilinadi. */
export function parseNumber(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.');
  if (normalized === '') return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function requireRange(
  raw: string,
  label: string,
  min: number,
  max: number,
  errors: Errors,
  key: string,
): number | null {
  const n = parseNumber(raw);
  if (n === null) {
    errors[key] = `${label} raqam bo‘lishi kerak`;
    return null;
  }
  if (n < min || n > max) {
    errors[key] = `${label} ${min} dan ${max} m gacha bo‘lishi kerak`;
    return null;
  }
  return n;
}

export interface RoomDraft {
  name: string;
  type: RoomType;
  length: string;
  width: string;
  height: string;
  mountType: MountType;
  furniture: string[];
  x: string;
  y: string;
}

export function roomDraftFrom(room: Room): RoomDraft {
  return {
    name: room.name,
    type: room.type,
    length: String(room.length),
    width: String(room.width),
    height: String(room.height),
    mountType: room.mountType,
    furniture: [...room.furniture],
    x: String(room.x),
    y: String(room.y),
  };
}

export interface RoomValues {
  name: string;
  type: RoomType;
  length: number;
  width: number;
  height: number;
  mountType: MountType;
  furniture: string[];
  x: number;
  y: number;
}

export function validateRoomDraft(d: RoomDraft): { errors: Errors; values: RoomValues | null } {
  const errors: Errors = {};
  const name = d.name.trim();
  if (!name) errors.name = 'Xona nomini kiriting';
  else if (name.length > 60) errors.name = 'Nom 60 belgidan oshmasin';

  const length = requireRange(d.length, 'Uzunlik', MIN_ROOM_DIM, MAX_ROOM_DIM, errors, 'length');
  const width = requireRange(d.width, 'Kenglik', MIN_ROOM_DIM, MAX_ROOM_DIM, errors, 'width');
  const height = requireRange(d.height, 'Balandlik', MIN_ROOM_HEIGHT, MAX_ROOM_HEIGHT, errors, 'height');
  const x = parseNumber(d.x);
  const y = parseNumber(d.y);
  if (x === null || x < 0) errors.x = 'Qavatdagi X joylashuv 0 yoki undan katta bo‘lishi kerak';
  if (y === null || y < 0) errors.y = 'Qavatdagi Y joylashuv 0 yoki undan katta bo‘lishi kerak';

  if (Object.keys(errors).length > 0 || length === null || width === null || height === null || x === null || y === null) {
    return { errors, values: null };
  }
  return {
    errors,
    values: { name, type: d.type, length, width, height, mountType: d.mountType, furniture: d.furniture, x, y },
  };
}

export interface ProjectDraft {
  name: string;
  houseType: HouseType;
  description: string;
  dimLength: string;
  dimWidth: string;
  floorCount: string;
}

export function validateProjectDraft(d: ProjectDraft): { errors: Errors; values: ProjectDraft | null; dims?: { length: number; width: number } } {
  const errors: Errors = {};
  const name = d.name.trim();
  if (!name) errors.name = 'Loyiha nomini kiriting';
  else if (name.length > 80) errors.name = 'Nom 80 belgidan oshmasin';
  if (d.description.length > 400) errors.description = 'Izoh 400 belgidan oshmasin';

  let dims: { length: number; width: number } | undefined;
  if (d.dimLength.trim() !== '' || d.dimWidth.trim() !== '') {
    const length = requireRange(d.dimLength, 'Umumiy uzunlik', 1, 200, errors, 'dimLength');
    const width = requireRange(d.dimWidth, 'Umumiy kenglik', 1, 200, errors, 'dimWidth');
    if (length !== null && width !== null) dims = { length, width };
  }

  if (!/^\d+$/.test(d.floorCount.trim())) {
    errors.floorCount = 'Qavatlar soni butun son bo‘lishi kerak';
  } else {
    const n = Number(d.floorCount);
    if (n < 1 || n > 10) errors.floorCount = 'Qavatlar soni 1 dan 10 gacha bo‘lishi kerak';
  }

  if (Object.keys(errors).length > 0) return { errors, values: null };
  return { errors, values: { ...d, name }, dims };
}

export function validateFloorDraft(d: { name: string; height: string }): {
  errors: Errors;
  values: { name: string; height: number } | null;
} {
  const errors: Errors = {};
  const name = d.name.trim();
  if (!name) errors.name = 'Qavat nomini kiriting';
  else if (name.length > 40) errors.name = 'Nom 40 belgidan oshmasin';
  const height = requireRange(d.height, 'Qavat balandligi', 2, 8, errors, 'height');
  if (Object.keys(errors).length > 0 || height === null) return { errors, values: null };
  return { errors, values: { name, height } };
}

export function validateObjectDraft(
  d: { name: string; mountingHeight: string; group: string; circuit: string; x: string; y: string },
  room: Pick<Room, 'length' | 'width' | 'height'>,
): { errors: Errors; values: { name: string; mountingHeight: number; group: string; circuit: string; x: number; y: number } | null } {
  const errors: Errors = {};
  const name = d.name.trim();
  if (!name) errors.name = 'Nom kiriting';
  const mountingHeight = requireRange(d.mountingHeight, 'O‘rnatish balandligi', 0, room.height, errors, 'mountingHeight');
  const x = requireRange(d.x, 'X', 0, room.length, errors, 'x');
  const y = requireRange(d.y, 'Y', 0, room.width, errors, 'y');
  if (Object.keys(errors).length > 0 || mountingHeight === null || x === null || y === null) return { errors, values: null };
  return { errors, values: { name, mountingHeight, group: d.group.trim(), circuit: d.circuit.trim(), x, y } };
}
