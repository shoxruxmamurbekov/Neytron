import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RotateCcw, Ruler, DoorOpen, Layers } from 'lucide-react';
import { Button, Card, EmptyState, PageHeader } from '../../../components/ui';
import { useProjectStore } from '../store/ProjectStore';
import { projectStats } from '../utils/projectStats';
import { fmtArea } from '../utils/format';
import type { Project } from '../types';
import ProjectCard from './ProjectCard';
import ProjectFormDialog from './ProjectFormDialog';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ProjectsDashboard() {
  const store = useProjectStore();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [resetting, setResetting] = useState(false);

  const all = store.projects.map((p) => ({ project: p, stats: projectStats(p) }));
  const totals = all.reduce(
    (t, { stats }) => ({
      floors: t.floors + stats.floors,
      rooms: t.rooms + stats.rooms,
      area: t.area + stats.totalArea,
    }),
    { floors: 0, rooms: 0, area: 0 },
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Uy loyihasi"
        description="Uyingizni xonama-xona loyihalang: qavatlar, xonalar, shablonlar, 2D/3D ko‘rinish va materiallar ro‘yxati."
        actions={
          <>
            <Button variant="secondary" onClick={() => setResetting(true)}>
              <RotateCcw className="size-4" aria-hidden /> Demo loyihalarni tiklash
            </Button>
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" aria-hidden /> Yangi loyiha
            </Button>
          </>
        }
      />

      <section aria-label="Umumiy ko‘rsatkichlar" className="grid grid-cols-3 gap-3">
        <SummaryTile icon={<Layers className="size-4" aria-hidden />} label="Qavatlar" value={String(totals.floors)} />
        <SummaryTile icon={<DoorOpen className="size-4" aria-hidden />} label="Xonalar" value={String(totals.rooms)} />
        <SummaryTile icon={<Ruler className="size-4" aria-hidden />} label="Umumiy maydon" value={fmtArea(totals.area)} />
      </section>

      {store.projects.length === 0 ? (
        <EmptyState title="Hali loyiha yo‘q" description="“Yangi loyiha” tugmasi bilan birinchi uyingizni yarating." />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {store.projects.map((p) => (
            <li key={p.id}>
              <ProjectCard project={p} onEdit={() => setEditing(p)} onDelete={() => setDeleting(p)} />
            </li>
          ))}
        </ul>
      )}

      <ProjectFormDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(id) => navigate(`/uy-loyihasi/${id}`)}
      />
      <ProjectFormDialog
        key={editing?.id ?? 'edit'}
        open={editing !== null}
        project={editing ?? undefined}
        onClose={() => setEditing(null)}
      />
      <ConfirmDialog
        open={deleting !== null}
        title="Loyihani o‘chirish"
        message={
          deleting
            ? `“${deleting.name}” loyihasi, uning qavatlari va xonalari butunlay o‘chiriladi. Bu amalni qaytarib bo‘lmaydi.`
            : ''
        }
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) store.deleteProject(deleting.id);
          setDeleting(null);
        }}
      />
      <ConfirmDialog
        open={resetting}
        title="Demo loyihalarni tiklash"
        confirmLabel="Tiklash"
        message="Demo loyihalar boshlang‘ich holatga qaytariladi. Sizning shaxsiy loyihalaringiz saqlanib qoladi."
        onClose={() => setResetting(false)}
        onConfirm={() => {
          store.resetDemo();
          setResetting(false);
        }}
      />
    </div>
  );
}

function SummaryTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Card className="flex flex-col gap-1 p-4">
      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
        {icon}
        {label}
      </span>
      <span className="text-lg font-semibold">{value}</span>
    </Card>
  );
}
