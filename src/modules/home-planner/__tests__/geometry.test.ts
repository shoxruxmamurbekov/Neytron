import { describe, expect, it } from 'vitest';
import type { Room } from '../types';
import {
  floorBounds,
  fitRoomContents,
  nearestWall,
  openingProblems,
  polylineLength,
  roomArea,
  roomsOverlap,
  snapToWall,
  WALL_INSET,
} from '../utils/geometry';
import { createOpening, createRoom, createObject, applyTemplateToRoom } from '../utils/factory';
import { TEMPLATE_BY_ID } from '../data/templates';

const room = (over: Partial<Room> = {}): Room =>
  createRoom({ name: 'T', type: 'living_room', length: 5, width: 4, height: 2.8, ...over });

describe('geometriya', () => {
  it('xona maydonini o‘lchamdan hisoblaydi', () => {
    expect(roomArea({ length: 5, width: 4 })).toBe(20);
    expect(roomArea({ length: 3.3, width: 2.7 })).toBe(8.91);
  });

  it('eng yaqin devorni aniqlaydi', () => {
    const r = room();
    expect(nearestWall({ x: 0.2, y: 2 }, r)).toBe('W');
    expect(nearestWall({ x: 4.9, y: 2 }, r)).toBe('E');
    expect(nearestWall({ x: 2.5, y: 0.1 }, r)).toBe('N');
    expect(nearestWall({ x: 2.5, y: 3.9 }, r)).toBe('S');
  });

  it('wall-mounted nuqtani devor ichki yuzasiga yopishtiradi', () => {
    const p = snapToWall({ x: 2, y: 0.5 }, room());
    expect(p).toEqual({ x: 2, y: WALL_INSET });
  });

  it('teshik devordan chiqib ketsa xato beradi', () => {
    const r = room();
    const bad = createOpening('door', 'N', 4.5, 1, 2.1);
    expect(openingProblems(bad, r).join(' ')).toMatch(/devordan chiqib/);
  });

  it('manfiy yoki nol kenglikni rad etadi', () => {
    const r = room();
    expect(openingProblems(createOpening('door', 'S', 0, 0, 2.1), r).length).toBeGreaterThan(0);
    expect(openingProblems(createOpening('door', 'S', -0.5, 0.9, 2.1), r).length).toBeGreaterThan(0);
  });

  it('derazaning shift balandligidan oshishini aniqlaydi', () => {
    const r = room({ height: 2.8 });
    const win = createOpening('window', 'E', 0.5, 1, 1.5, 1.8);
    expect(openingProblems(win, r).join(' ')).toMatch(/shiftidan baland/);
  });

  it('chegaradagi tegish kesishish hisoblanmaydi, ichki kesishish hisoblanadi', () => {
    const a = { x: 0, y: 0, length: 4, width: 3 };
    expect(roomsOverlap(a, { x: 4, y: 0, length: 2, width: 3 })).toBe(false);
    expect(roomsOverlap(a, { x: 3.5, y: 0, length: 2, width: 3 })).toBe(true);
    expect(roomsOverlap(a, { x: 0, y: 3, length: 2, width: 2 })).toBe(false);
  });

  it('xona o‘lchami kichrayganda jihozlarni ichkariga suradi va eskirgan switchId ni tozalaydi', () => {
    const base = room({ length: 6, width: 5 });
    const sw = createObject('switch', { x: 0.1, y: 1 }, base);
    const light = createObject('ceiling_light', { x: 5.5, y: 4.5 }, base, { switchId: sw.id });
    const big = { ...base, objects: [sw, light] };
    const shrunk = fitRoomContents({ ...big, length: 3, width: 3 });
    const movedLight = shrunk.objects.find((o) => o.id === light.id)!;
    expect(movedLight.x).toBeLessThanOrEqual(3);
    expect(movedLight.y).toBeLessThanOrEqual(3);

    const noSwitch = fitRoomContents({ ...big, objects: [light] });
    expect(noSwitch.objects[0].switchId).toBeUndefined();
  });

  it('polilaniya uzunligi va qavat chegaralari', () => {
    expect(polylineLength([{ x: 0, y: 0 }, { x: 3, y: 4 }, { x: 3, y: 10 }])).toBeCloseTo(11, 6);
    const f = { id: 'f', name: 'f', height: 3, rooms: [room({ x: 1, y: 2 }), room({ x: 6, y: 0, length: 2, width: 2 })] };
    expect(floorBounds(f)).toEqual({ minX: 1, minY: 0, maxX: 8, maxY: 6 });
  });
});

describe('shablonni qo‘llash', () => {
  it('shablon jihozlarini xona o‘lchamiga moslab joylaydi va chiroqlarni kalitga bog‘laydi', () => {
    const t = TEMPLATE_BY_ID.get('living-standard')!;
    const r = room({ length: 6, width: 4.5 });
    const applied = applyTemplateToRoom(r, t);
    expect(applied.objects.length).toBe(t.objects.length);
    expect(applied.templateId).toBe('living-standard');

    for (const o of applied.objects) {
      expect(o.x).toBeGreaterThanOrEqual(0);
      expect(o.x).toBeLessThanOrEqual(6);
      expect(o.y).toBeGreaterThanOrEqual(0);
      expect(o.y).toBeLessThanOrEqual(4.5);
    }
    const sw = applied.objects.find((o) => o.kind === 'switch')!;
    const lights = applied.objects.filter((o) => o.kind === 'ceiling_light');
    expect(lights.length).toBe(2);
    for (const l of lights) expect(l.switchId).toBe(sw.id);
  });

  it('devorga o‘rnatiladigan belgilar devorga yopishadi', () => {
    const t = TEMPLATE_BY_ID.get('living-standard')!;
    const r = room({ length: 6, width: 4.5 });
    const applied = applyTemplateToRoom(r, t);
    const tvSocket = applied.objects.find((o) => o.name === 'Televizor rozetkasi')!;
    expect(nearestWall({ x: tvSocket.x, y: tvSocket.y }, r)).toBe('S');
    expect(tvSocket.y).toBeCloseTo(4.5 - WALL_INSET, 3);
  });
});
