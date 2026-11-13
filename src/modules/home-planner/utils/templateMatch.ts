import type { LayoutTemplate, MountType, Room, TemplateMatch } from '../types';
import { TEMPLATES } from '../data/templates';
import { FURNITURE_OPTIONS, ROOM_TYPES } from '../data/constants';
import { roomArea } from './geometry';

export interface MatchInput {
  roomType: Room['type'];
  length: number;
  width: number;
  mountType: MountType;
  furniture: string[];
}

const roomTypeLabel = (t: Room['type']) => ROOM_TYPES.find((r) => r.value === t)?.label ?? t;
const furnitureLabel = (tag: string) => FURNITURE_OPTIONS.find((f) => f.tag === tag)?.label ?? tag;

/** Xona o‘lchamlari shablon diapazoniga tushadimi (uzunlik/kenglik almashgan holda ham). */
function dimensionsFit(t: LayoutTemplate, length: number, width: number): boolean {
  const direct =
    length >= t.minLength && length <= t.maxLength && width >= t.minWidth && width <= t.maxWidth;
  const rotated =
    width >= t.minLength && width <= t.maxLength && length >= t.minWidth && length <= t.maxWidth;
  return direct || rotated;
}

/**
 * Teg-asosidagi moslashtirish.
 * Qat’iy shartlar: xona turi, o‘lchamlar diapazoni, montaj turi. Bular mos kelmasa shablon chiqarilmaydi.
 * Ball: mebel tegi mosligi va maydonning diapazon ichidagi o‘rni.
 */
export function matchTemplates(input: MatchInput, templates: LayoutTemplate[] = TEMPLATES): TemplateMatch[] {
  const area = input.length * input.width;
  const results: TemplateMatch[] = [];

  for (const t of templates) {
    if (t.roomType !== input.roomType) continue;
    if (!dimensionsFit(t, input.length, input.width)) continue;
    if (t.mountType !== 'any' && t.mountType !== input.mountType) continue;

    const reasons: string[] = [
      `Xona turi mos: ${roomTypeLabel(t.roomType)}`,
      `O‘lchamlar diapazonda: ${input.length} × ${input.width} m (shablon: ${t.minLength}–${t.maxLength} × ${t.minWidth}–${t.maxWidth} m)`,
    ];
    const warnings: string[] = [];

    let score = 50;

    if (t.mountType === 'any') {
      reasons.push('Montaj turi: har qanday (shablon cheklamaydi)');
    } else {
      reasons.push(`Montaj turi mos: ${input.mountType === 'concealed' ? 'yashirin' : 'ochiq'}`);
      score += 5;
    }

    if (t.furnitureTags.length > 0) {
      const matched = t.furnitureTags.filter((tag) => input.furniture.includes(tag));
      const ratio = matched.length / t.furnitureTags.length;
      score += Math.round(ratio * 25);
      if (matched.length > 0) {
        reasons.push(`Mebel mos: ${matched.map(furnitureLabel).join(', ')} (${matched.length}/${t.furnitureTags.length})`);
      }
      const missing = t.furnitureTags.filter((tag) => !input.furniture.includes(tag));
      if (missing.length > 0) {
        warnings.push(`Shablonda ko‘zda tutilgan, lekin xonada belgilanmagan jihoz: ${missing.map(furnitureLabel).join(', ')}`);
      }
    }

    // Maydon diapazon o‘rtasiga yaqin bo‘lsa — ball ko‘proq (o‘lcham chegarasida ehtiyot bo‘lish kerak)
    const minArea = t.minLength * t.minWidth;
    const maxArea = t.maxLength * t.maxWidth;
    const span = maxArea - minArea;
    if (span > 0) {
      const centrality = 1 - Math.abs((area - (minArea + maxArea) / 2) / (span / 2));
      score += Math.round(Math.max(0, centrality) * 20);
    }
    reasons.push(`Maydon: ${roomArea({ length: input.length, width: input.width })} m² (diapazon: ${round1(minArea)}–${round1(maxArea)} m²)`);

    warnings.push('Demo shablon: mutaxassis tomonidan tasdiqlanmagan');

    results.push({ template: t, score: Math.min(100, score), reasons, warnings });
  }

  return results.sort((a, b) => b.score - a.score);
}

/** Qat’iy shartlarga mos kelmagan shablonlar va sabablari (shaffoflik uchun). */
export function explainExclusions(input: MatchInput, templates: LayoutTemplate[] = TEMPLATES): { template: LayoutTemplate; reason: string }[] {
  const out: { template: LayoutTemplate; reason: string }[] = [];
  for (const t of templates) {
    if (t.roomType !== input.roomType) {
      out.push({ template: t, reason: `Xona turi mos emas (${roomTypeLabel(t.roomType)} uchun)` });
      continue;
    }
    if (!dimensionsFit(t, input.length, input.width)) {
      out.push({ template: t, reason: `O‘lcham diapazonda emas (${t.minLength}–${t.maxLength} × ${t.minWidth}–${t.maxWidth} m)` });
      continue;
    }
    if (t.mountType !== 'any' && t.mountType !== input.mountType) {
      out.push({ template: t, reason: 'Montaj turi mos emas' });
    }
  }
  return out;
}

const round1 = (n: number) => Math.round(n * 10) / 10;
