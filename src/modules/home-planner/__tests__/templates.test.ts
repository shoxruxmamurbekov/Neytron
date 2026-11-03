import { describe, expect, it } from 'vitest';
import { matchTemplates, explainExclusions } from '../utils/templateMatch';
import { TEMPLATES } from '../data/templates';

describe('shablonlarni moslashtirish (teg-asosida)', () => {
  it('mehmonxona uchun mos shablonni yuqorida chiqaradi va sabab beradi', () => {
    const res = matchTemplates({ roomType: 'living_room', length: 5, width: 4, mountType: 'concealed', furniture: ['tv', 'sofa'] });
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].template.roomType).toBe('living_room');
    expect(res[0].reasons.join(' ')).toMatch(/Xona turi mos/);
    expect(res[0].reasons.join(' ')).toMatch(/Mebel mos/);
    expect(res.every((r, i, a) => i === 0 || a[i - 1].score >= r.score)).toBe(true);
  });

  it('demo shablonlar ogohlantirish bilan belgilanadi', () => {
    const res = matchTemplates({ roomType: 'bathroom', length: 2, width: 2, mountType: 'concealed', furniture: [] });
    expect(res.length).toBe(1);
    expect(res[0].warnings.join(' ')).toMatch(/Demo shablon/);
    expect(TEMPLATES.every((t) => t.verification === 'demo')).toBe(true);
  });

  it('xona turi mos kelmasa shablon chiqmaydi', () => {
    const res = matchTemplates({ roomType: 'storage', length: 4, width: 3, mountType: 'concealed', furniture: [] });
    expect(res).toEqual([]);
    const ex = explainExclusions({ roomType: 'storage', length: 4, width: 3, mountType: 'concealed', furniture: [] });
    expect(ex.length).toBe(TEMPLATES.length);
    expect(ex[0].reason).toMatch(/Xona turi/);
  });

  it('o‘lcham diapazondan tashqarida bo‘lsa chiqmaydi, almashgan o‘lcham qabul qilinadi', () => {
    const tooBig = matchTemplates({ roomType: 'bedroom', length: 12, width: 12, mountType: 'concealed', furniture: [] });
    expect(tooBig.length).toBe(0);
    const rotated = matchTemplates({ roomType: 'bedroom', length: 4, width: 3, mountType: 'concealed', furniture: [] });
    const swapped = matchTemplates({ roomType: 'bedroom', length: 3, width: 4, mountType: 'concealed', furniture: [] });
    expect(rotated.map((r) => r.template.id)).toEqual(swapped.map((r) => r.template.id));
  });

  it('montaj turi mos kelmasa shablon chiqmaydi (“any” bundan mustasno)', () => {
    const res = matchTemplates({ roomType: 'hallway', length: 4, width: 1.5, mountType: 'concealed', furniture: [] });
    expect(res.some((r) => r.template.id === 'hallway-two-way')).toBe(true);
    const bath = matchTemplates({ roomType: 'bathroom', length: 2, width: 2, mountType: 'surface', furniture: [] });
    expect(bath.length).toBe(0);
  });
});
