import type {
  CableRoute,
  ElectricalObject,
  Floor,
  LayoutTemplate,
  ObjectKind,
  Opening,
  Point,
  Project,
  Room,
  RoomType,
  MountType,
} from '../types';
import { DEFAULT_FLOOR_HEIGHT, DEFAULT_ROOM_HEIGHT, OBJECT_CATALOG } from '../data/constants';
import { placeObjectPoint, fitRoomContents, round } from './geometry';
import { uid } from './ids';

export function createObject(
  kind: ObjectKind,
  point: Point,
  room: Pick<Room, 'length' | 'width' | 'height'>,
  overrides: Partial<ElectricalObject> = {},
): ElectricalObject {
  const cat = OBJECT_CATALOG[kind];
  const pos = placeObjectPoint(kind, point, room);
  return {
    id: uid('obj'),
    kind,
    name: cat.defaultName,
    x: round(pos.x, 3),
    y: round(pos.y, 3),
    rotation: 0,
    mountingHeight: round(cat.defaultHeight(room.height), 2),
    group: cat.defaultGroup,
    circuit: cat.defaultCircuit,
    notes: '',
    ...(kind === 'ceiling_light' || kind === 'spotlight' ? { lightType: kind === 'spotlight' ? 'spot' : 'ceiling' } : {}),
    ...overrides,
  };
}

export function createRoom(init: {
  name: string;
  type: RoomType;
  length: number;
  width: number;
  height?: number;
  mountType?: MountType;
  x?: number;
  y?: number;
  furniture?: string[];
  openings?: Opening[];
}): Room {
  return {
    id: uid('room'),
    name: init.name,
    type: init.type,
    length: init.length,
    width: init.width,
    height: init.height ?? DEFAULT_ROOM_HEIGHT,
    mountType: init.mountType ?? 'concealed',
    furniture: init.furniture ?? [],
    openings: init.openings ?? [],
    objects: [],
    routes: [],
    x: init.x ?? 0,
    y: init.y ?? 0,
  };
}

export function createOpening(kind: Opening['kind'], wall: Opening['wall'], offset: number, width: number, height: number, sillHeight = 0): Opening {
  return { id: uid('op'), kind, wall, offset, width, height, sillHeight };
}

/**
 * Shablonni xonaga qo‘llaydi. Mavjud jihozlar almashtiriladi, xona o‘lchamlari o‘zgarmaydi.
 * Nisbiy joylashuv (fx, fy) xona o‘lchamiga moslanadi. Chiroqlar birinchi kalitga bog‘lanadi.
 */
export function applyTemplateToRoom(room: Room, template: LayoutTemplate): Room {
  const objects: ElectricalObject[] = template.objects.map((spec) =>
    createObject(
      spec.kind,
      { x: spec.fx * room.length, y: spec.fy * room.width },
      room,
      {
        name: spec.name,
        notes: spec.notes ?? '',
        ...(spec.lightType ? { lightType: spec.lightType } : {}),
      },
    ),
  );
  const firstSwitch = objects.find((o) => o.kind === 'switch');
  const linked = objects.map((o) =>
    (o.kind === 'ceiling_light' || o.kind === 'spotlight') && firstSwitch ? { ...o, switchId: firstSwitch.id } : o,
  );
  return fitRoomContents({ ...room, objects: linked, templateId: template.id });
}

export function createFloor(name: string, height = DEFAULT_FLOOR_HEIGHT): Floor {
  return { id: uid('floor'), name, height, rooms: [] };
}

export function createProject(init: {
  name: string;
  houseType: Project['houseType'];
  description?: string;
  dimensions?: { length: number; width: number };
  floorCount?: number;
  now?: string;
  demo?: boolean;
}): Project {
  const now = init.now ?? new Date().toISOString();
  const count = init.floorCount ?? 1;
  const floors = Array.from({ length: count }, (_, i) => createFloor(`${i + 1}-qavat`));
  return {
    id: uid('proj'),
    name: init.name,
    houseType: init.houseType,
    description: init.description ?? '',
    dimensions: init.dimensions,
    floors,
    createdAt: now,
    updatedAt: now,
    ...(init.demo ? { demo: true } : {}),
  };
}

export function emptyRoute(name: string, points: Point[]): CableRoute {
  return { id: uid('route'), name, points, circuit: 'Yoritish-1', notes: '' };
}
