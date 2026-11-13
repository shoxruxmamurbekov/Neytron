import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import { ArrowLeft, Box, Calculator, FileDown, FileSpreadsheet, Layers, LayoutTemplate, Pencil, PenTool, Printer, Save, Trash2 } from 'lucide-react';
import { Badge, Button, Card, EmptyState, LinkButton, Modal } from '../../../components/ui';
import { HOUSE_TYPES, DEFAULT_ROOM_HEIGHT } from '../data/constants';
import { useProject } from '../store/ProjectStore';
import type { Floor, Project, Room } from '../types';
import { createFloor, createRoom } from '../utils/factory';
import { nextFreePosition, roomArea, round } from '../utils/geometry';
import { fmtArea, fmtDate } from '../utils/format';
import { projectStats } from '../utils/projectStats';
import { downloadFile, safeFileName } from '../export/download';
import { buildProjectCsv } from '../export/csv';
import FloorPlanSvg from '../export/FloorPlanSvg';
import PrintReport from '../export/PrintReport';
import { EXPORT_PALETTE, LIVE_PALETTE } from '../editor-2d/PlanSvg';
import Editor2D from '../editor-2d/Editor2D';
import Scene3D from '../editor-3d/Scene3D';
import RoomForm from '../rooms/RoomForm';
import RoomList from '../rooms/RoomList';
import FloorTabs from '../floors/FloorTabs';
import FloorDialog from '../floors/FloorDialog';
import TemplatePanel from '../templates/TemplatePanel';
import MaterialsPanel from '../materials/MaterialsPanel';
import ProjectFormDialog from './ProjectFormDialog';
import ConfirmDialog from '../components/ConfirmDialog';

type WorkTab = 'dims' | 'templates' | '2d' | '3d' | 'materials';

const TABS: { key: WorkTab; label: string; icon: typeof Box }[] = [
  { key: 'dims', label: 'Xona o‘lchamlari', icon: Calculator },
  { key: 'templates', label: 'Tayyor shablonlar', icon: LayoutTemplate },
  { key: '2d', label: '2D chizma', icon: PenTool },
  { key: '3d', label: '3D ko‘rinish', icon: Box },
  { key: 'materials', label: 'Materiallar ro‘yxati', icon: Layers },
];

export default function ProjectWorkspace({ projectId }: { projectId: string }) {
  const { project, store, updateRoom } = useProject(projectId);

  if (!project) {
    return (
      <div className="flex flex-col gap-6">
        <EmptyState title="Loyiha topilmadi" description="U o‘chirilgan bo‘lishi mumkin." />
        <div className="flex justify-center">
          <LinkButton to="/visual-montage">Loyihalarga qaytish</LinkButton>
        </div>
      </div>
    );
  }
  return <Workspace project={project} store={store} updateRoom={updateRoom} />;
}

function Workspace({
  project,
  store,
  updateRoom,
}: {
  project: Project;
  store: ReturnType<typeof useProject>['store'];
  updateRoom: (floorId: string, room: Room) => void;
}) {
  const [activeFloorId, setActiveFloorId] = useState<string | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [tab, setTab] = useState<WorkTab>('dims');
  const [materialsScope, setMaterialsScope] = useState<'room' | 'project'>('room');
  const [editingProject, setEditingProject] = useState(false);
  const [floorDialog, setFloorDialog] = useState<'add' | 'edit' | null>(null);
  const [deletingFloor, setDeletingFloor] = useState(false);
  const [newRoom, setNewRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const floor: Floor | undefined = project.floors.find((f) => f.id === activeFloorId) ?? project.floors[0];
  const room: Room | null = floor?.rooms.find((r) => r.id === activeRoomId) ?? floor?.rooms[0] ?? null;
  const stats = projectStats(project);
  const houseLabel = HOUSE_TYPES.find((h) => h.value === project.houseType)?.label ?? project.houseType;

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  /* ----- Eksport ----- */
  const exportFloorSvg = () => {
    if (!floor) return;
    const markup = renderToStaticMarkup(
      <FloorPlanSvg floor={floor} projectName={project.name} width={1000} height={680} palette={EXPORT_PALETTE} background="#ffffff" />,
    );
    downloadFile(`${safeFileName(project.name)}-${safeFileName(floor.name)}.svg`, `<?xml version="1.0" encoding="UTF-8"?>\n${markup}`, 'image/svg+xml');
    flash('Qavat chizmasi SVG sifatida yuklab olindi');
  };

  const exportCsv = () => {
    downloadFile(`${safeFileName(project.name)}-materiallar.csv`, buildProjectCsv(project), 'text/csv;charset=utf-8');
    flash('Materiallar ro‘yxati CSV sifatida yuklab olindi');
  };

  const saveBackup = () => {
    downloadFile(`${safeFileName(project.name)}.json`, JSON.stringify(project, null, 2), 'application/json');
    flash('Loyiha zaxira nusxasi (JSON) yuklab olindi');
  };

  /* ----- Qavat ----- */
  const floorSuggestedName = `${project.floors.length + 1}-qavat`;

  /* ----- Xona ----- */
  const openCreateRoom = () => {
    const pos = floor ? nextFreePosition(floor) : { x: 0, y: 0 };
    setNewRoom(
      createRoom({
        name: `Xona ${(floor?.rooms.length ?? 0) + 1}`,
        type: 'living_room',
        length: 4,
        width: 3,
        height: DEFAULT_ROOM_HEIGHT,
        x: pos.x,
        y: pos.y,
      }),
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Sarlavha */}
      <div className="flex flex-col gap-4">
        <Link to="/visual-montage" className="inline-flex w-fit items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
          <ArrowLeft className="size-4" aria-hidden /> Loyihalar
        </Link>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap gap-2">
              <Badge tone="neutral">{houseLabel}</Badge>
              {project.demo && <Badge tone="warning">Demo</Badge>}
              <Badge tone="brand">{stats.floors} qavat · {stats.rooms} xona · {fmtArea(stats.totalArea)}</Badge>
            </div>
            <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">{project.name}</h1>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Loyiha brauzerda avtomatik saqlanadi · Oxirgi o‘zgarish: {fmtDate(project.updatedAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setEditingProject(true)}>
              <Pencil className="size-4" aria-hidden /> Tahrirlash
            </Button>
            <Button variant="secondary" onClick={saveBackup}>
              <Save className="size-4" aria-hidden /> Loyihani saqlash (JSON)
            </Button>
            <Button variant="secondary" onClick={exportFloorSvg} disabled={!floor}>
              <FileDown className="size-4" aria-hidden /> Qavat chizmasi (SVG)
            </Button>
            <Button variant="secondary" onClick={exportCsv}>
              <FileSpreadsheet className="size-4" aria-hidden /> Materiallar (CSV)
            </Button>
            <Button onClick={() => window.print()}>
              <Printer className="size-4" aria-hidden /> PDF eksport (chop etish)
            </Button>
          </div>
        </div>
        {toast && (
          <p role="status" className="w-fit rounded-xl bg-success-soft px-4 py-2 text-sm text-success">
            {toast}
          </p>
        )}
      </div>

      {/* Qavatlar */}
      <FloorTabs
        floors={project.floors}
        activeId={floor?.id ?? ''}
        onSelect={(id) => {
          setActiveFloorId(id);
          setActiveRoomId(null);
        }}
        onAdd={() => setFloorDialog('add')}
        onEdit={() => setFloorDialog('edit')}
        onDelete={() => setDeletingFloor(true)}
      />

      {!floor ? (
        <EmptyState title="Qavat yo‘q" description="Loyihaga qavat qo‘shing." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Chap ustun: xonalar */}
          <div className="flex min-w-0 flex-col gap-4">
            <RoomList rooms={floor.rooms} selectedId={room?.id ?? null} onSelect={(id) => setActiveRoomId(id)} onAdd={openCreateRoom} />
            <Card className="flex flex-col gap-1.5 p-4 text-xs text-[var(--text-muted)]">
              <span>Qavat: {floor.name} · balandlik {floor.height} m</span>
              <span>Qavat maydoni: {fmtArea(floor.rooms.reduce((s, r) => s + roomArea(r), 0))}</span>
              <span>Tayyorlik (loyiha): {stats.percent}% · jihozli xonalar {stats.roomsWithObjects}/{stats.rooms}</span>
            </Card>
          </div>

          {/* O‘ng ustun: xona ish maydoni */}
          <section className="flex min-w-0 flex-col gap-5" aria-label="Xona ish maydoni">
            {!room ? (
              <EmptyState title="Xona tanlanmagan" description="Chapdan xonani tanlang yoki yangi xona qo‘shing." />
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-semibold">{room.name}</h2>
                  <p className="text-sm text-[var(--text-muted)]">
                    {fmtArea(roomArea(room))} · {round(room.length)} × {round(room.width)} × {round(room.height)} m · {room.objects.length} jihoz
                  </p>
                </div>

                <div role="tablist" aria-label="Xona bo‘limlari" className="flex gap-1.5 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
                  {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      role="tab"
                      type="button"
                      aria-selected={tab === key}
                      onClick={() => setTab(key)}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                        tab === key ? 'bg-brand-500 font-medium text-white' : 'text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      <Icon className="size-4" aria-hidden />
                      {label}
                    </button>
                  ))}
                </div>

                <div role="tabpanel" className="min-w-0">
                  {tab === 'dims' && (
                    <div className="flex flex-col gap-6">
                      <Card className="p-5 sm:p-6">
                        <RoomForm
                          key={room.id}
                          initial={room}
                          floorRooms={floor.rooms}
                          submitLabel="Saqlash"
                          onSave={(next) => {
                            updateRoom(floor.id, next);
                            flash('Xona o‘lchamlari saqlandi');
                          }}
                        />
                      </Card>
                      <div className="flex justify-end">
                        <Button variant="danger" onClick={() => setDeletingRoom(true)}>
                          <Trash2 className="size-4" aria-hidden /> Xonani o‘chirish
                        </Button>
                      </div>
                    </div>
                  )}

                  {tab === 'templates' && (
                    <TemplatePanel
                      key={room.id}
                      room={room}
                      onApply={(next) => {
                        updateRoom(floor.id, next);
                        flash('Shablon xonaga qo‘llandi');
                      }}
                    />
                  )}

                  {tab === '2d' && (
                    <Editor2D key={room.id} room={room} onChange={(next) => updateRoom(floor.id, next)} />
                  )}

                  {tab === '3d' && <Scene3D key={room.id} room={room} />}

                  {tab === 'materials' && (
                    <div className="flex flex-col gap-4">
                      <div role="group" aria-label="Materiallar doirasi" className="flex w-fit gap-1 rounded-xl border border-[var(--border)] p-1">
                        <ScopeBtn active={materialsScope === 'room'} onClick={() => setMaterialsScope('room')}>
                          Joriy xona
                        </ScopeBtn>
                        <ScopeBtn active={materialsScope === 'project'} onClick={() => setMaterialsScope('project')}>
                          Butun loyiha
                        </ScopeBtn>
                      </div>
                      <MaterialsPanel scope={materialsScope === 'room' ? { kind: 'room', room } : { kind: 'project', project }} />
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {/* Qavat plani (kichik ko‘rinish) */}
      {floor && floor.rooms.length > 0 && (
        <Card className="flex flex-col gap-3 p-4">
          <h2 className="text-sm font-semibold">{floor.name} — qavat rejasi</h2>
          <div className="overflow-x-auto">
            <div className="min-w-[560px]">
              <FloorPlanSvg floor={floor} projectName={project.name} width={860} height={300} palette={LIVE_PALETTE} background="var(--surface)" />
            </div>
          </div>
          <p className="text-xs text-[var(--text-muted)]">Xonalar joylashuvi X/Y koordinatalar bo‘yicha. Xona o‘lchamlarini “Xona o‘lchamlari” bo‘limida o‘zgartiring.</p>
        </Card>
      )}

      {/* Dialoglar */}
      <ProjectFormDialog open={editingProject} onClose={() => setEditingProject(false)} project={project} />

      <FloorDialog
        open={floorDialog !== null}
        onClose={() => setFloorDialog(null)}
        floor={floorDialog === 'edit' ? floor : undefined}
        suggestedName={floorSuggestedName}
        onSave={(values) => {
          if (floorDialog === 'edit' && floor) {
            store.updateFloor(project.id, floor.id, values);
          } else {
            const f = createFloor(values.name, values.height);
            store.addFloor(project.id, f);
            setActiveFloorId(f.id);
            setActiveRoomId(null);
          }
          setFloorDialog(null);
        }}
      />

      <ConfirmDialog
        open={deletingFloor && floor !== undefined}
        title="Qavatni o‘chirish"
        message={
          floor
            ? `“${floor.name}” va undagi ${floor.rooms.length} ta xona o‘chiriladi. Bu amalni qaytarib bo‘lmaydi.`
            : ''
        }
        onClose={() => setDeletingFloor(false)}
        onConfirm={() => {
          if (floor) store.deleteFloor(project.id, floor.id);
          setDeletingFloor(false);
          setActiveFloorId(null);
          setActiveRoomId(null);
        }}
      />

      <Modal
        open={newRoom !== null}
        onClose={() => setNewRoom(null)}
        title="Yangi xona"
        wide
      >
        {newRoom && floor && (
          <RoomForm
            key={newRoom.id}
            initial={newRoom}
            floorRooms={floor.rooms}
            submitLabel="Xona yaratish"
            onCancel={() => setNewRoom(null)}
            onSave={(created) => {
              store.addRoom(project.id, floor.id, created);
              setActiveRoomId(created.id);
              setTab('templates');
              setNewRoom(null);
              flash('Xona qo‘shildi. Endi shablon tanlashingiz mumkin.');
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deletingRoom && room !== null}
        title="Xonani o‘chirish"
        message={room ? `“${room.name}” va uning barcha jihozlari o‘chiriladi. Bu amalni qaytarib bo‘lmaydi.` : ''}
        onClose={() => setDeletingRoom(false)}
        onConfirm={() => {
          if (room && floor) store.deleteRoom(project.id, floor.id, room.id);
          setDeletingRoom(false);
          setActiveRoomId(null);
        }}
      />

      <PrintReport project={project} />
    </div>
  );
}

function ScopeBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${active ? 'bg-brand-500 text-white' : 'hover:bg-[var(--surface-muted)]'}`}
    >
      {children}
    </button>
  );
}
