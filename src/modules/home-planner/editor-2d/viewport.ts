import type { Point } from '../types';

/**
 * Ekran koordinatasi = PAD + (dunyo + offset) * scale + pan.
 * Dunyo koordinatasi metrda; scale — 1 m uchun piksellar soni.
 */
export interface View {
  scale: number;
  panX: number;
  panY: number;
}

export const PAD = 48;
export const MIN_SCALE = 15;
export const MAX_SCALE = 420;

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export const DEFAULT_VIEW: View = { scale: 60, panX: 0, panY: 0 };

export function worldToScreen(p: Point, v: View, offset: Point = { x: 0, y: 0 }): Point {
  return {
    x: PAD + (p.x + offset.x) * v.scale + v.panX,
    y: PAD + (p.y + offset.y) * v.scale + v.panY,
  };
}

export function screenToWorld(s: Point, v: View): Point {
  return {
    x: (s.x - PAD - v.panX) / v.scale,
    y: (s.y - PAD - v.panY) / v.scale,
  };
}

/** Berilgan dunyo chegaralarini ekranga sig‘diradi (markazlashtirib). */
export function fitView(b: Bounds, width: number, height: number): View {
  const bw = Math.max(0.5, b.maxX - b.minX);
  const bh = Math.max(0.5, b.maxY - b.minY);
  const usableW = Math.max(60, width - PAD * 2);
  const usableH = Math.max(60, height - PAD * 2);
  const scale = clamp(Math.min(usableW / bw, usableH / bh) * 0.92, MIN_SCALE, MAX_SCALE);
  return {
    scale,
    panX: (width - bw * scale) / 2 - PAD - b.minX * scale,
    panY: (height - bh * scale) / 2 - PAD - b.minY * scale,
  };
}

/** Kursor/barmoq turgan nuqta atrofida zoom. */
export function zoomAt(v: View, factor: number, screenPt: Point): View {
  const world = screenToWorld(screenPt, v);
  const scale = clamp(v.scale * factor, MIN_SCALE, MAX_SCALE);
  return {
    scale,
    panX: screenPt.x - PAD - world.x * scale,
    panY: screenPt.y - PAD - world.y * scale,
  };
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
