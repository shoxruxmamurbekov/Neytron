import type { Project } from '../types';
import { HOUSE_TYPES, OBJECT_CATALOG, ROOM_TYPES, MOUNT_TYPES } from '../data/constants';
import { summarizeMaterials } from '../utils/materials';
import { fmtDate, fmtM } from '../utils/format';
import { roomArea } from '../utils/geometry';
import { EXPORT_PALETTE } from '../editor-2d/PlanSvg';
import FloorPlanSvg, { PRELIMINARY_NOTE } from './FloorPlanSvg';

/**
 * Chop etish / PDF uchun hisobot. Ekranda yashirin; faqat print paytida ko‘rinadi (index.css: .print-only).
 * PDF — brauzerning “Chop etish → PDF sifatida saqlash” imkoniyati orqali olinadi.
 */
export default function PrintReport({ project }: { project: Project }) {
  const all = project.floors.flatMap((f) => f.rooms.map((r) => ({ floor: f.name, room: r })));
  const materials = summarizeMaterials(all.map((x) => x.room));
  const houseType = HOUSE_TYPES.find((h) => h.value === project.houseType)?.label ?? project.houseType;
  const totalArea = all.reduce((s, x) => s + roomArea(x.room), 0);

  return (
    <div className="print-only report" data-testid="print-report">
      <header className="mb-4 border-b border-[var(--border)] pb-3">
        <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">NEYTRON · Uy loyihasi hisoboti</p>
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {houseType} · Qavatlar: {project.floors.length} · Xonalar: {all.length} · Umumiy xona maydoni: {totalArea.toFixed(2)} m²
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Yaratilgan: {fmtDate(project.createdAt)} · Oxirgi o‘zgarish: {fmtDate(project.updatedAt)}
        </p>
        {project.dimensions && (
          <p className="text-xs text-[var(--text-muted)]">
            Umumiy o‘lcham: {fmtM(project.dimensions.length)} × {fmtM(project.dimensions.width)} m
          </p>
        )}
      </header>

      <div className="mb-4 rounded-md border border-[#b42318] px-3 py-2 text-xs text-[#b42318]">{PRELIMINARY_NOTE} Miqdorlar taxminiy, yakuniy talab emas.</div>

      <section className="mb-5">
        <h2 className="mb-2 text-lg font-semibold">Materiallar (taxminiy)</h2>
        <table className="w-full border-collapse text-sm">
          <tbody>
            <Row k="Shiftdagi chiroqlar" v={materials.ceilingLights} />
            <Row k="Spot chiroqlar" v={materials.spotlights} />
            <Row k="Kalitlar" v={materials.switches} />
            <Row k="Oddiy rozetkalar" v={materials.sockets} />
            <Row k="Ikki o‘rinli rozetkalar" v={materials.doubleSockets} />
            <Row k="Maxsus jihoz rozetkalari" v={materials.applianceOutlets} />
            <Row k="Taqsimot shchitlari" v={materials.distributionBoards} />
            <Row k="Kabel yo‘llari uzunligi (taxminiy)" v={`${fmtM(materials.cableLengthM)} m`} />
            <Row k="Zanjirlar" v={materials.circuits.join(', ') || '—'} />
          </tbody>
        </table>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Kabel kesimi va himoya qurilmasi (avtomat, RCD) bu hisobotda tanlanmagan — ular mahalliy standartlar va muhandislik hisobi asosida belgilanadi.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="mb-2 text-lg font-semibold">Xonalar</h2>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-[var(--border)] text-left">
              <th className="py-1 pr-2">Qavat</th>
              <th className="py-1 pr-2">Xona</th>
              <th className="py-1 pr-2">Turi</th>
              <th className="py-1 pr-2">L × W × H (m)</th>
              <th className="py-1 pr-2">Maydon</th>
              <th className="py-1 pr-2">Montaj</th>
              <th className="py-1 pr-2">Teshiklar</th>
              <th className="py-1 pr-2">Jihozlar</th>
            </tr>
          </thead>
          <tbody>
            {all.map(({ floor, room }) => (
              <tr key={room.id} className="border-b border-[var(--border)] align-top">
                <td className="py-1 pr-2">{floor}</td>
                <td className="py-1 pr-2">{room.name}</td>
                <td className="py-1 pr-2">{ROOM_TYPES.find((t) => t.value === room.type)?.label}</td>
                <td className="py-1 pr-2">
                  {fmtM(room.length)} × {fmtM(room.width)} × {fmtM(room.height)}
                </td>
                <td className="py-1 pr-2">{roomArea(room).toFixed(2)} m²</td>
                <td className="py-1 pr-2">{MOUNT_TYPES.find((m) => m.value === room.mountType)?.label.split(' ')[0]}</td>
                <td className="py-1 pr-2">{room.openings.length}</td>
                <td className="py-1 pr-2">{room.objects.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {project.floors.map((f) => (
        <section key={f.id} className="report-break mb-5">
          <h2 className="mb-2 text-lg font-semibold">{f.name} — reja</h2>
          <div className="overflow-hidden rounded-md border border-[var(--border)]">
            <FloorPlanSvg floor={f} projectName={project.name} width={720} height={460} palette={EXPORT_PALETTE} background="#ffffff" />
          </div>
        </section>
      ))}

      <section className="report-break">
        <h2 className="mb-2 text-lg font-semibold">Elektr jihozlari ro‘yxati</h2>
        {all.every((x) => x.room.objects.length === 0) ? (
          <p className="text-sm text-[var(--text-muted)]">Jihoz qo‘yilmagan.</p>
        ) : (
          all
            .filter((x) => x.room.objects.length > 0)
            .map(({ floor, room }) => (
              <div key={room.id} className="mb-3">
                <p className="text-sm font-semibold">
                  {floor} · {room.name}
                </p>
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left">
                      <th className="py-1 pr-2">Nomi</th>
                      <th className="py-1 pr-2">Turi</th>
                      <th className="py-1 pr-2">X, Y (m)</th>
                      <th className="py-1 pr-2">Balandlik (m)</th>
                      <th className="py-1 pr-2">Guruh</th>
                      <th className="py-1 pr-2">Zanjir</th>
                      <th className="py-1 pr-2">Izoh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {room.objects.map((o) => (
                      <tr key={o.id} className="border-b border-[var(--border)] align-top">
                        <td className="py-1 pr-2">{o.name}</td>
                        <td className="py-1 pr-2">{OBJECT_CATALOG[o.kind].label}</td>
                        <td className="py-1 pr-2">
                          {fmtM(o.x)}, {fmtM(o.y)}
                        </td>
                        <td className="py-1 pr-2">{fmtM(o.mountingHeight)}</td>
                        <td className="py-1 pr-2">{o.group}</td>
                        <td className="py-1 pr-2">{o.circuit}</td>
                        <td className="py-1 pr-2">{o.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
        )}
      </section>

      <footer className="mt-6 border-t border-[var(--border)] pt-3 text-[11px] text-[var(--text-muted)]">
        Ushbu hisobot NEYTRON prototipi tomonidan yaratilgan. Barcha ma’lumotlar taxminiy va tasdiqlanmagan. Haqiqiy elektr ishlari
        malakali elektrik va mahalliy standartlar bilan tekshirilishi shart.
      </footer>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string | number }) {
  return (
    <tr className="border-b border-[var(--border)]">
      <td className="py-1.5 pr-3">{k}</td>
      <td className="py-1.5 text-right font-semibold">{v}</td>
    </tr>
  );
}
