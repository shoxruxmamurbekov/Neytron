import { describe, expect, it } from 'vitest';
import { buildDemoProjects } from '../data/demoProjects';
import { summarizeMaterials } from '../utils/materials';
import { buildProjectCsv } from '../export/csv';
import { roomsOverlap } from '../utils/geometry';
import { wallBoxes, wallMountBox, lightPosition, planToWorld } from '../editor-3d/geometry3d';
import { createOpening, createRoom, createObject } from '../utils/factory';

describe('demo loyihalar', () => {
  const projects = buildDemoProjects(new Date('2026-11-01T00:00:00Z'));

  it('ikkita demo loyiha va ularning xonalari kesishmaydi', () => {
    expect(projects.length).toBe(2);
    for (const p of projects) {
      for (const f of p.floors) {
        for (let i = 0; i < f.rooms.length; i++) {
          for (let j = i + 1; j < f.rooms.length; j++) {
            expect(roomsOverlap(f.rooms[i], f.rooms[j])).toBe(false);
          }
        }
      }
    }
  });

  it('demo jihozlar xona ichida joylashgan', () => {
    for (const p of projects) {
      for (const f of p.floors) {
        for (const r of f.rooms) {
          for (const o of r.objects) {
            expect(o.x).toBeGreaterThanOrEqual(0);
            expect(o.x).toBeLessThanOrEqual(r.length + 1e-9);
            expect(o.y).toBeGreaterThanOrEqual(0);
            expect(o.y).toBeLessThanOrEqual(r.width + 1e-9);
          }
        }
      }
    }
  });
});

describe('materiallar', () => {
  it('sanash va kabel uzunligini to‘g‘ri hisoblaydi', () => {
    const r = createRoom({ name: 'A', type: 'bedroom', length: 4, width: 3 });
    const objs = [
      createObject('ceiling_light', { x: 2, y: 1.5 }, r),
      createObject('ceiling_light', { x: 1, y: 1 }, r),
      createObject('spotlight', { x: 3, y: 1 }, r),
      createObject('switch', { x: 0, y: 1 }, r),
      createObject('double_socket', { x: 2, y: 0 }, r),
      createObject('appliance_outlet', { x: 4, y: 2 }, r),
    ];
    const room = {
      ...r,
      objects: objs,
      routes: [{ id: 'x', name: 'x', points: [{ x: 0, y: 0 }, { x: 3, y: 4 }], circuit: 'Rozetka-1', notes: '' }],
    };
    const m = summarizeMaterials([room]);
    expect(m.ceilingLights).toBe(2);
    expect(m.spotlights).toBe(1);
    expect(m.switches).toBe(1);
    expect(m.doubleSockets).toBe(1);
    expect(m.applianceOutlets).toBe(1);
    expect(m.cableLengthM).toBe(5);
    expect(m.circuits).toEqual(['Maxsus-1', 'Rozetka-1', 'Yoritish-1']);
  });

  it('CSV BOM bilan boshlanadi va “taxminiy” eslatmasini o‘z ichiga oladi', () => {
    const csv = buildProjectCsv(buildDemoProjects()[0]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toMatch(/taxminiy/);
    expect(csv.split('\r\n').length).toBeGreaterThan(10);
  });
});

describe('3D geometriya (Three.js ga bog‘liq emas)', () => {
  const base = createRoom({ name: 'R', type: 'living_room', length: 4, width: 3, height: 2.8 });

  it('eshik devor qismlarini kesib o‘tadi va eshik bargini qo‘shadi', () => {
    const withDoor = { ...base, openings: [createOpening('door', 'S', 1, 0.9, 2.1)] };
    const boxes = wallBoxes(withDoor);
    const doorLeaves = boxes.filter((b) => b.role === 'door');
    expect(doorLeaves.length).toBe(1);
    expect(boxes.filter((b) => b.role === 'wall').length).toBeGreaterThanOrEqual(4);
  });

  it('deraza shisha qatlamini va parapet devorini yaratadi', () => {
    const withWin = { ...base, openings: [createOpening('window', 'N', 1, 1.2, 1.4, 0.9)] };
    const boxes = wallBoxes(withWin);
    const glass = boxes.filter((b) => b.role === 'glass');
    expect(glass.length).toBe(1);
    // Parapet ostidagi qism (0..0.9) va yuqoridagi qism (2.3..2.8) mavjud bo‘lishi kerak
    const below = boxes.find((b) => b.role === 'wall' && Math.abs(b.center[1] - 0.45) < 1e-6);
    expect(below).toBeDefined();
  });

  it('koordinatalarni markazga nisbatan aylantiradi', () => {
    expect(planToWorld(0, 0, base)).toEqual({ x: -2, z: -1.5 });
    expect(planToWorld(4, 3, base)).toEqual({ x: 2, z: 1.5 });
  });

  it('devor belgisi balandligi to‘g‘ri va chiroq xona ichida', () => {
    const sw = createObject('switch', { x: 0, y: 1 }, base);
    const m = wallMountBox({ ...sw, mountingHeight: 1 }, base);
    expect(m.center[1]).toBe(1);
    const light = createObject('ceiling_light', { x: 2, y: 1.5 }, base);
    expect(lightPosition(light, base)[1]).toBeLessThanOrEqual(base.height);
  });
});
