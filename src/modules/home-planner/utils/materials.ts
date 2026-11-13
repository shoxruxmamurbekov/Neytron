import type { MaterialsSummary, Room } from '../types';
import { polylineLength, round } from './geometry';

/**
 * Preliminary materials summary: faqat sanash va uzunlik.
 * Kabel kesimi, himoya avtomati va boshqa muhandislik qarorlari bu yerda hisoblanmaydi.
 */
export function summarizeMaterials(rooms: Room[]): MaterialsSummary {
  const summary: MaterialsSummary = {
    ceilingLights: 0,
    spotlights: 0,
    switches: 0,
    sockets: 0,
    doubleSockets: 0,
    applianceOutlets: 0,
    distributionBoards: 0,
    cableLengthM: 0,
    circuits: [],
  };
  const circuits = new Set<string>();

  for (const room of rooms) {
    for (const o of room.objects) {
      switch (o.kind) {
        case 'ceiling_light':
          summary.ceilingLights += 1;
          break;
        case 'spotlight':
          summary.spotlights += 1;
          break;
        case 'switch':
          summary.switches += 1;
          break;
        case 'socket':
          summary.sockets += 1;
          break;
        case 'double_socket':
          summary.doubleSockets += 1;
          break;
        case 'appliance_outlet':
          summary.applianceOutlets += 1;
          break;
        case 'distribution_board':
          summary.distributionBoards += 1;
          break;
      }
      if (o.circuit) circuits.add(o.circuit);
    }
    for (const r of room.routes) {
      summary.cableLengthM += polylineLength(r.points);
      if (r.circuit) circuits.add(r.circuit);
    }
  }

  summary.cableLengthM = round(summary.cableLengthM, 2);
  summary.circuits = [...circuits].sort();
  return summary;
}

export const totalSockets = (m: MaterialsSummary) => m.sockets + m.doubleSockets + m.applianceOutlets;
export const totalLights = (m: MaterialsSummary) => m.ceilingLights + m.spotlights;
