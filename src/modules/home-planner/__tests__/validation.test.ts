import { describe, expect, it } from 'vitest';
import { parseNumber, validateRoomDraft, validateProjectDraft, validateFloorDraft, type RoomDraft } from '../utils/validation';

const base: RoomDraft = {
  name: 'Mehmonxona',
  type: 'living_room',
  length: '5',
  width: '4',
  height: '2.8',
  mountType: 'concealed',
  furniture: ['sofa'],
  x: '0',
  y: '0',
};

describe('validatsiya', () => {
  it('vergul va nuqtani qabul qiladi', () => {
    expect(parseNumber('2,8')).toBe(2.8);
    expect(parseNumber(' 3.5 ')).toBe(3.5);
    expect(parseNumber('')).toBeNull();
    expect(parseNumber('abc')).toBeNull();
    expect(parseNumber('Infinity')).toBeNull();
  });

  it('to‘g‘ri xona ma’lumotini qabul qiladi', () => {
    const { errors, values } = validateRoomDraft(base);
    expect(errors).toEqual({});
    expect(values).toMatchObject({ name: 'Mehmonxona', length: 5, width: 4, height: 2.8 });
  });

  it('manfiy va haddan tashqari o‘lchamni rad etadi', () => {
    expect(validateRoomDraft({ ...base, length: '-3' }).errors.length).toBeDefined();
    expect(validateRoomDraft({ ...base, width: '0' }).errors.width).toBeDefined();
    expect(validateRoomDraft({ ...base, width: '500' }).errors.width).toBeDefined();
    expect(validateRoomDraft({ ...base, height: '1.5' }).errors.height).toBeDefined();
    expect(validateRoomDraft({ ...base, height: '7' }).errors.height).toBeDefined();
  });

  it('nom bo‘sh bo‘lsa xato beradi', () => {
    const r = validateRoomDraft({ ...base, name: '   ' });
    expect(r.values).toBeNull();
    expect(r.errors.name).toMatch(/nomini/);
  });

  it('loyiha va qavat formalarini tekshiradi', () => {
    const ok = validateProjectDraft({ name: 'Uy', houseType: 'house', description: '', dimLength: '', dimWidth: '', floorCount: '2' });
    expect(ok.values).not.toBeNull();
    expect(ok.dims).toBeUndefined();
    const bad = validateProjectDraft({ name: '', houseType: 'house', description: '', dimLength: '-1', dimWidth: '5', floorCount: '0' });
    expect(bad.values).toBeNull();
    expect(bad.errors.name).toBeDefined();
    expect(bad.errors.floorCount).toBeDefined();
    expect(validateFloorDraft({ name: '1-qavat', height: '1' }).errors.height).toBeDefined();
  });
});
