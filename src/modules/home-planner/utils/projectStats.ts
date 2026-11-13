import type { Project } from '../types';
import { roomArea } from './geometry';

export interface ProjectStats {
  floors: number;
  rooms: number;
  totalArea: number;
  /** Jihoz qo‘yilgan xonalar soni */
  roomsWithObjects: number;
  /** Shablon qo‘llangan xonalar soni */
  roomsWithTemplate: number;
  /** 0..100 — jihoz qo‘yilgan xonalar ulushi */
  percent: number;
}

export function projectStats(p: Project): ProjectStats {
  const rooms = p.floors.flatMap((f) => f.rooms);
  const roomsWithObjects = rooms.filter((r) => r.objects.length > 0).length;
  const totalArea = rooms.reduce((sum, r) => sum + roomArea(r), 0);
  return {
    floors: p.floors.length,
    rooms: rooms.length,
    totalArea: Math.round(totalArea * 100) / 100,
    roomsWithObjects,
    roomsWithTemplate: rooms.filter((r) => Boolean(r.templateId)).length,
    percent: rooms.length === 0 ? 0 : Math.round((roomsWithObjects / rooms.length) * 100),
  };
}

export function completionStatus(s: ProjectStats): { label: string; tone: 'neutral' | 'brand' | 'success' | 'warning' } {
  if (s.rooms === 0) return { label: 'Xona yo‘q', tone: 'neutral' };
  if (s.roomsWithObjects === 0) return { label: 'Boshlanmagan', tone: 'neutral' };
  if (s.percent < 100) return { label: 'Jarayonda', tone: 'warning' };
  return { label: 'Tayyor (tekshiruvga)', tone: 'success' };
}
