import type { Floor, Project } from '../types';
import { OBJECT_CATALOG, ROOM_TYPES } from '../data/constants';
import { polylineLength, round } from '../utils/geometry';
import { summarizeMaterials } from '../utils/materials';

/**
 * CSV (nuqta-vergul bilan, UTF-8 BOM bilan): Excel va Google Sheets to‘g‘ri o‘qiydi.
 * Maydonlar qo‘shtirnoqqa olinadi, shuning uchun vergul yoki yangi qator ichidagi matn buzilmaydi.
 */
const cell = (v: string | number): string => {
  const s = String(v);
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const row = (cells: (string | number)[]) => cells.map(cell).join(';');

export function buildProjectCsv(project: Project): string {
  const lines: string[] = [];
  const all = project.floors.flatMap((f: Floor) => f.rooms.map((r) => ({ floor: f, room: r })));
  const materials = summarizeMaterials(all.map((x) => x.room));

  lines.push(row(['NEYTRON — preliminary materials summary (taxminiy, yakuniy emas)']));
  lines.push(row(['Loyiha', project.name]));
  lines.push('');
  lines.push(row(['Material', 'Miqdor']));
  lines.push(row(['Shiftdagi chiroqlar', materials.ceilingLights]));
  lines.push(row(['Spot chiroqlar', materials.spotlights]));
  lines.push(row(['Kalitlar', materials.switches]));
  lines.push(row(['Oddiy rozetkalar', materials.sockets]));
  lines.push(row(['Ikki o‘rinli rozetkalar', materials.doubleSockets]));
  lines.push(row(['Maxsus jihoz rozetkalari', materials.applianceOutlets]));
  lines.push(row(['Taqsimot shchitlari', materials.distributionBoards]));
  lines.push(row(['Kabel yo‘llari uzunligi (m, taxminiy)', round(materials.cableLengthM, 2)]));
  lines.push(row(['Zanjirlar', materials.circuits.join(', ')]));
  lines.push('');

  lines.push(row(['Qavat', 'Xona', 'Xona turi', 'Uzunlik (m)', 'Kenglik (m)', 'Balandlik (m)', 'Maydon (m²)', 'Montaj', 'Jihoz', 'Turi', 'X (m)', 'Y (m)', 'O‘rnatish balandligi (m)', 'Guruh', 'Zanjir', 'Izoh']));
  for (const { floor, room } of all) {
    const roomType = ROOM_TYPES.find((t) => t.value === room.type)?.label ?? room.type;
    const mount = room.mountType === 'concealed' ? 'Yashirin' : 'Ochiq';
    if (room.objects.length === 0) {
      lines.push(row([floor.name, room.name, roomType, room.length, room.width, room.height, round(room.length * room.width), mount, '', '', '', '', '', '', '', '']));
    }
    for (const o of room.objects) {
      lines.push(
        row([
          floor.name,
          room.name,
          roomType,
          room.length,
          room.width,
          room.height,
          round(room.length * room.width),
          mount,
          o.name,
          OBJECT_CATALOG[o.kind].label,
          o.x,
          o.y,
          o.mountingHeight,
          o.group,
          o.circuit,
          o.notes,
        ]),
      );
    }
    for (const r of room.routes) {
      lines.push(
        row([floor.name, room.name, roomType, room.length, room.width, room.height, round(room.length * room.width), mount, r.name, 'Kabel yo‘li', '', '', '', '', r.circuit, `${round(polylineLength(r.points))} m (taxminiy). ${r.notes}`.trim()]),
      );
    }
  }
  lines.push('');
  lines.push(row(['Eslatma: barcha miqdorlar taxminiy. Kabel kesimi va himoya qurilmasi bu hisobotda tanlanmagan.']));

  return `﻿${lines.join('\r\n')}`;
}
