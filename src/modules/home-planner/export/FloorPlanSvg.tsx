import type { Floor } from '../types';
import { RoomPlanStatic, type PlanPalette } from '../editor-2d/PlanSvg';
import { fitView } from '../editor-2d/viewport';
import { floorBounds } from '../utils/geometry';

interface Props {
  floor: Floor;
  projectName: string;
  width: number;
  height: number;
  palette: PlanPalette;
  /** Fon rangi (eksport uchun oq) */
  background: string;
  showLabels?: boolean;
}

export const PRELIMINARY_NOTE =
  'PRELIMINARY — taxminiy chizma. Tasdiqlanmagan, yakuniy loyiha yoki o‘rnatish hujjati emas.';

/**
 * Qavat rejasi. Ekrandagi “Qavat rejasi” va SVG eksport uchun bir xil komponent.
 * Xonalar room.x / room.y bo‘yicha joylashtiriladi.
 */
export default function FloorPlanSvg({ floor, projectName, width, height, palette, background, showLabels = true }: Props) {
  const bounds = floorBounds(floor);
  const view = fitView(bounds, width, height - 36);
  const view2 = { ...view, panY: view.panY + 18 };

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${projectName} — ${floor.name} qavat rejasi`}>
      <rect x={0} y={0} width={width} height={height} style={{ fill: background }} />
      <text x={16} y={22} fontSize={14} fontWeight={600} style={{ fill: palette.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
        {projectName} · {floor.name}
      </text>
      <text x={width - 16} y={22} textAnchor="end" fontSize={11} style={{ fill: palette.muted, fontFamily: 'Inter, system-ui, sans-serif' }}>
        {floor.rooms.length} xona
      </text>
      {floor.rooms.map((r) => (
        <RoomPlanStatic key={r.id} room={r} view={view2} offset={{ x: r.x, y: r.y }} palette={palette} showLabels={showLabels} />
      ))}
      <text x={16} y={height - 10} fontSize={10} style={{ fill: '#b42318', fontFamily: 'Inter, system-ui, sans-serif' }}>
        {PRELIMINARY_NOTE}
      </text>
    </svg>
  );
}
