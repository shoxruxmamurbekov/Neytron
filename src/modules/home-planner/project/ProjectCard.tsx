import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, DoorOpen, Layers, Pencil, Trash2, Ruler } from 'lucide-react';
import { Badge, Button, Card } from '../../../components/ui';
import { HOUSE_TYPES } from '../data/constants';
import type { Project } from '../types';
import { projectStats, completionStatus } from '../utils/projectStats';
import { fmtArea, fmtDate, fmtM } from '../utils/format';

interface Props {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ProjectCard({ project, onEdit, onDelete }: Props) {
  const stats = projectStats(project);
  const status = completionStatus(stats);
  const houseLabel = HOUSE_TYPES.find((h) => h.value === project.houseType)?.label ?? project.houseType;

  return (
    <Card as="article" className="flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap gap-2">
            <Badge tone="neutral">{houseLabel}</Badge>
            {project.demo && <Badge tone="warning">Demo</Badge>}
          </div>
          <h2 className="truncate text-lg font-semibold">{project.name}</h2>
          {project.description && <p className="mt-1 line-clamp-2 text-sm text-[var(--text-muted)]">{project.description}</p>}
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>

      <dl className="grid grid-cols-3 gap-2 text-center">
        <Stat icon={<Layers className="size-4" aria-hidden />} label="Qavat" value={String(stats.floors)} />
        <Stat icon={<DoorOpen className="size-4" aria-hidden />} label="Xona" value={String(stats.rooms)} />
        <Stat icon={<Ruler className="size-4" aria-hidden />} label="Xonalar maydoni" value={fmtArea(stats.totalArea)} />
      </dl>

      <div>
        <div className="mb-1 flex justify-between text-xs text-[var(--text-muted)]">
          <span>Tayyorlik</span>
          <span>{stats.percent}%</span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]"
          role="progressbar"
          aria-valuenow={stats.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Loyiha tayyorligi"
        >
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${stats.percent}%` }} />
        </div>
      </div>

      {project.dimensions && (
        <p className="text-xs text-[var(--text-muted)]">
          Umumiy o‘lcham: {fmtM(project.dimensions.length)} × {fmtM(project.dimensions.width)} m
        </p>
      )}

      <div className="mt-auto flex flex-col gap-3 border-t border-[var(--border)] pt-4">
        <p className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <CalendarClock className="size-3.5" aria-hidden />
          Oxirgi o‘zgarish: {fmtDate(project.updatedAt)}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/uy-loyihasi/${project.id}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Ochish
          </Link>
          <Button variant="secondary" onClick={onEdit} aria-label={`${project.name} — tahrirlash`}>
            <Pencil className="size-4" aria-hidden />
          </Button>
          <Button variant="secondary" onClick={onDelete} aria-label={`${project.name} — o‘chirish`} className="text-danger">
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--surface-muted)] px-2 py-2.5">
      <dt className="mb-0.5 flex items-center justify-center gap-1 text-[11px] text-[var(--text-muted)]">
        {icon}
        {label}
      </dt>
      <dd className="text-sm font-semibold">{value}</dd>
    </div>
  );
}
