import { Lightbulb, Target, ToggleLeft, Plug, Zap, Tag, Cable, Layers } from 'lucide-react';
import { Card, Disclaimer } from '../../../components/ui';
import type { Room, Project } from '../types';
import { summarizeMaterials } from '../utils/materials';
import { fmtM } from '../utils/format';

interface Props {
  scope: { kind: 'room'; room: Room } | { kind: 'project'; project: Project };
}

/** Preliminary materials panel. Miqdorlar taxminiy; kabel kesimi va himoya tanlanmaydi. */
export default function MaterialsPanel({ scope }: Props) {
  const rooms = scope.kind === 'room' ? [scope.room] : scope.project.floors.flatMap((f) => f.rooms);
  const m = summarizeMaterials(rooms);
  const label = scope.kind === 'room' ? `Xona: ${scope.room.name}` : `Loyiha: ${scope.project.name}`;

  const tiles = [
    { icon: Lightbulb, label: 'Shiftdagi chiroqlar', value: m.ceilingLights },
    { icon: Target, label: 'Spot chiroqlar', value: m.spotlights },
    { icon: ToggleLeft, label: 'Kalitlar', value: m.switches },
    { icon: Plug, label: 'Oddiy rozetkalar', value: m.sockets },
    { icon: Plug, label: 'Ikki o‘rinli rozetkalar', value: m.doubleSockets },
    { icon: Zap, label: 'Maxsus jihoz rozetkalari', value: m.applianceOutlets },
    { icon: Tag, label: 'Taqsimot shchitlari', value: m.distributionBoards },
    { icon: Cable, label: 'Kabel yo‘llari (m, taxminiy)', value: fmtM(m.cableLengthM) },
  ];

  const totalItems = m.ceilingLights + m.spotlights + m.switches + m.sockets + m.doubleSockets + m.applianceOutlets + m.distributionBoards;

  return (
    <div className="flex flex-col gap-5">
      <Disclaimer>
        <strong>Preliminary — taxminiy.</strong> Bu miqdorlar chizmadagi jihozlar sonidan olingan. Ular yakuniy materiallar talabi emas. Kabel
        kesimi va himoya qurilmasi (avtomat, RCD) bu yerda hisoblanmaydi.
      </Disclaimer>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Materiallar ro‘yxati</h2>
        <span className="text-sm text-[var(--text-muted)]">{label} · jami {totalItems} ta jihoz</span>
      </div>

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map(({ icon: Icon, label: l, value }) => (
          <li key={l}>
            <Card className="flex h-full flex-col gap-2 p-4">
              <Icon className="size-5 text-brand-600 dark:text-brand-100" aria-hidden />
              <span className="text-xs text-[var(--text-muted)]">{l}</span>
              <span className="text-xl font-semibold">{value}</span>
            </Card>
          </li>
        ))}
      </ul>

      <Card className="flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Layers className="size-4" aria-hidden /> Zanjirlar
        </h3>
        {m.circuits.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">Zanjir belgilanmagan.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {m.circuits.map((c) => (
              <span key={c} className="rounded-full border border-[var(--border)] px-3 py-1 text-sm">
                {c}
              </span>
            ))}
          </div>
        )}
        <p className="text-xs text-[var(--text-muted)]">Zanjir nomi faqat tashkiliy belgi. Uning quvvat va himoya parametrlari alohida hisoblanishi kerak.</p>
      </Card>

      {scope.kind === 'project' && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[520px] text-sm">
            <caption className="px-4 pt-4 pb-2 text-left text-sm font-semibold">Xonalar bo‘yicha</caption>
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--text-muted)]">
                <th className="px-4 py-2 font-medium">Qavat</th>
                <th className="px-4 py-2 font-medium">Xona</th>
                <th className="px-4 py-2 text-right font-medium">Chiroq</th>
                <th className="px-4 py-2 text-right font-medium">Kalit</th>
                <th className="px-4 py-2 text-right font-medium">Rozetka</th>
                <th className="px-4 py-2 text-right font-medium">Kabel (m)</th>
              </tr>
            </thead>
            <tbody>
              {scope.project.floors.flatMap((f) =>
                f.rooms.map((r) => {
                  const rm = summarizeMaterials([r]);
                  return (
                    <tr key={r.id} className="border-b border-[var(--border)]">
                      <td className="px-4 py-2">{f.name}</td>
                      <td className="px-4 py-2">{r.name}</td>
                      <td className="px-4 py-2 text-right">{rm.ceilingLights + rm.spotlights}</td>
                      <td className="px-4 py-2 text-right">{rm.switches}</td>
                      <td className="px-4 py-2 text-right">{rm.sockets + rm.doubleSockets + rm.applianceOutlets}</td>
                      <td className="px-4 py-2 text-right">{fmtM(rm.cableLengthM)}</td>
                    </tr>
                  );
                }),
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
