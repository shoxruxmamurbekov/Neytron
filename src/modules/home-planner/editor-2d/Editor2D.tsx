import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { CableRoute, ElectricalObject, ObjectKind, Point, Room } from '../types';
import { OBJECT_CATALOG } from '../data/constants';
import { clampToRoom, placeObjectPoint, polylineLength, round, snap } from '../utils/geometry';
import { createObject, emptyRoute } from '../utils/factory';
import { DEFAULT_VIEW, fitView, screenToWorld, zoomAt, type View } from './viewport';
import { GridLayer, LIVE_PALETTE, ObjectSymbol, RouteDraft, RouteLayer, RoomShell, type PlanHandlers, type Selection } from './PlanSvg';
import Toolbar2D, { type Tool } from './Toolbar2D';
import ElectricalPanel from '../electrical/ElectricalPanel';

interface Snapshot {
  objects: ElectricalObject[];
  routes: CableRoute[];
}

interface Props {
  room: Room;
  onChange: (next: Room) => void;
  compact?: boolean;
}

const MAX_HISTORY = 100;
const CANVAS_H_DESKTOP = 480;
const CANVAS_H_MOBILE = 360;

type DragState =
  | { type: 'object'; id: string; grab: Point; moved: boolean }
  | { type: 'pan'; lastSp: Point; moved: boolean }
  | null;

const isTypingTarget = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  if (!el) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable;
};

/** Xona chizmasi: tanlash, sudrash, joylashtirish, kabel yo‘li, undo/redo, zoom va pan. */
export default function Editor2D({ room, onChange, compact = false }: Props) {
  const H = compact ? CANVAS_H_MOBILE : CANVAS_H_DESKTOP;
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [tool, setTool] = useState<Tool>('select');
  const [placeKind, setPlaceKind] = useState<ObjectKind>('ceiling_light');
  const [selection, setSelection] = useState<Selection | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [width, setWidth] = useState(720);
  const [view, setView] = useState<View>(DEFAULT_VIEW);
  const [preview, setPreview] = useState<{ id: string; x: number; y: number } | null>(null);
  const [routeDraft, setRouteDraft] = useState<Point[]>([]);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [historyCounts, setHistoryCounts] = useState({ past: 0, future: 0 });

  const historyRef = useRef<{ past: Snapshot[]; future: Snapshot[] }>({ past: [], future: [] });
  const dragRef = useRef<DragState>(null);
  const spaceRef = useRef(false);
  const previewRef = useRef<typeof preview>(null);
  const touchedViewRef = useRef(false);
  const roomKeyRef = useRef<string | null>(null);

  /* ---------- Ko‘rinish (kenglik, fit) ---------- */
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = Math.floor(entries[0]?.contentRect.width ?? 0);
      if (w > 0) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fitNow = useCallback(() => {
    setView(fitView({ minX: 0, minY: 0, maxX: room.length, maxY: room.width }, width, H));
    touchedViewRef.current = false;
  }, [room.length, room.width, width, H]);

  // Xona almashganda yoki o‘lcham o‘zgarganda (foydalanuvchi aylantirmagan bo‘lsa) qayta sig‘diramiz
  useEffect(() => {
    if (roomKeyRef.current !== room.id) {
      roomKeyRef.current = room.id;
      historyRef.current = { past: [], future: [] };
      setHistoryCounts({ past: 0, future: 0 });
      setSelection(null);
      setRouteDraft([]);
      setPreview(null);
      fitNow();
      return;
    }
    if (!touchedViewRef.current) fitNow();
  }, [room.id, room.length, room.width, fitNow]);

  // Zoom: g‘ildirak (passive: false, sahifa aylanib ketmasligi uchun)
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const sp = { x: e.clientX - r.left, y: e.clientY - r.top };
      touchedViewRef.current = true;
      setView((v) => zoomAt(v, e.deltaY < 0 ? 1.15 : 1 / 1.15, sp));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  /* ---------- Tarix (undo/redo) ---------- */
  const snapshotOf = (r: Room): Snapshot => ({ objects: r.objects, routes: r.routes });

  const bumpHistory = () => {
    const h = historyRef.current;
    setHistoryCounts({ past: h.past.length, future: h.future.length });
  };

  const commit = (next: Snapshot) => {
    const h = historyRef.current;
    h.past = [...h.past.slice(-(MAX_HISTORY - 1)), snapshotOf(room)];
    h.future = [];
    bumpHistory();
    onChange({ ...room, objects: next.objects, routes: next.routes });
  };

  const undo = () => {
    const h = historyRef.current;
    const prev = h.past.pop();
    if (!prev) return;
    h.future.push(snapshotOf(room));
    bumpHistory();
    onChange({ ...room, objects: prev.objects, routes: prev.routes });
  };

  const redo = () => {
    const h = historyRef.current;
    const next = h.future.pop();
    if (!next) return;
    h.past.push(snapshotOf(room));
    bumpHistory();
    onChange({ ...room, objects: next.objects, routes: next.routes });
  };

  /* ---------- Tanlangan element ---------- */
  const selectedObject =
    selection?.type === 'object' ? room.objects.find((o) => o.id === selection.id) ?? null : null;
  const selectedRoute = selection?.type === 'route' ? room.routes.find((r) => r.id === selection.id) ?? null : null;

  const deleteSelected = () => {
    if (selectedObject) {
      const objects = room.objects
        .filter((o) => o.id !== selectedObject.id)
        .map((o) => (o.switchId === selectedObject.id ? { ...o, switchId: undefined } : o));
      commit({ objects, routes: room.routes });
      setSelection(null);
    } else if (selectedRoute) {
      commit({ objects: room.objects, routes: room.routes.filter((r) => r.id !== selectedRoute.id) });
      setSelection(null);
    }
  };

  const duplicateSelected = () => {
    if (!selectedObject) return;
    const copy = createObject(
      selectedObject.kind,
      { x: selectedObject.x + 0.3, y: selectedObject.y + 0.3 },
      room,
      {
        name: `${selectedObject.name} (nusxa)`,
        mountingHeight: selectedObject.mountingHeight,
        group: selectedObject.group,
        circuit: selectedObject.circuit,
        notes: selectedObject.notes,
        rotation: selectedObject.rotation,
        switchId: selectedObject.switchId,
        lightType: selectedObject.lightType,
      },
    );
    commit({ objects: [...room.objects, copy], routes: room.routes });
    setSelection({ type: 'object', id: copy.id });
  };

  const rotateSelected = () => {
    if (!selectedObject) return;
    const rotation = (selectedObject.rotation + 90) % 360;
    commit({
      objects: room.objects.map((o) => (o.id === selectedObject.id ? { ...o, rotation } : o)),
      routes: room.routes,
    });
  };

  const finishRoute = () => {
    const pts = dedupe(routeDraft);
    if (pts.length < 2) {
      setRouteDraft([]);
      return;
    }
    const route = emptyRoute(`Kabel yo‘li ${room.routes.length + 1}`, pts);
    commit({ objects: room.objects, routes: [...room.routes, route] });
    setRouteDraft([]);
    setSelection({ type: 'route', id: route.id });
    setTool('select');
  };

  const cancelRoute = () => {
    setRouteDraft([]);
  };

  /* ---------- Joylashtirish va koordinatalar ---------- */
  const localPoint = (clientX: number, clientY: number): Point => {
    const r = svgRef.current?.getBoundingClientRect();
    return { x: clientX - (r?.left ?? 0), y: clientY - (r?.top ?? 0) };
  };

  const snapPoint = (p: Point): Point => clampToRoom({ x: snap(p.x), y: snap(p.y) }, room, 0);

  const placeAt = (world: Point) => {
    const cat = OBJECT_CATALOG[placeKind];
    const pos = snapPoint(world);
    const firstSwitch = room.objects.find((o) => o.kind === 'switch');
    const isLight = placeKind === 'ceiling_light' || placeKind === 'spotlight';
    const obj = createObject(placeKind, pos, room, {
      name: cat.defaultName,
      ...(isLight && firstSwitch ? { switchId: firstSwitch.id } : {}),
    });
    commit({ objects: [...room.objects, obj], routes: room.routes });
    setSelection({ type: 'object', id: obj.id });
    setTool('select');
  };

  /* ---------- Sichqoncha / sensorli ekran ---------- */
  const startPan = (e: ReactPointerEvent<Element>) => {
    dragRef.current = { type: 'pan', lastSp: localPoint(e.clientX, e.clientY), moved: false };
    svgRef.current?.setPointerCapture(e.pointerId);
  };

  const onSvgPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (e.button === 2) return;
    const world = screenToWorld(localPoint(e.clientX, e.clientY), view);
    const panMode = tool === 'pan' || spaceRef.current || e.button === 1 || e.shiftKey;
    if (panMode) {
      touchedViewRef.current = true;
      startPan(e);
      return;
    }
    if (tool === 'place') {
      placeAt(world);
      return;
    }
    if (tool === 'route') {
      setRouteDraft((d) => [...d, snapPoint(world)]);
      return;
    }
    // select: fon bosilsa tanlovni bekor qilamiz va ekranni suramiz
    setSelection(null);
    touchedViewRef.current = true;
    startPan(e);
  };

  const onObjectDown = (id: string, e: ReactPointerEvent<SVGGElement>) => {
    e.stopPropagation();
    if (tool === 'route') return;
    if (tool === 'pan' || spaceRef.current) {
      touchedViewRef.current = true;
      startPan(e);
      return;
    }
    if (tool === 'place') return;
    const obj = room.objects.find((o) => o.id === id);
    if (!obj) return;
    setSelection({ type: 'object', id });
    const wp = screenToWorld(localPoint(e.clientX, e.clientY), view);
    dragRef.current = { type: 'object', id, grab: { x: wp.x - obj.x, y: wp.y - obj.y }, moved: false };
    svgRef.current?.setPointerCapture(e.pointerId);
  };

  const onRouteDown = (id: string, e: ReactPointerEvent<SVGGElement>) => {
    e.stopPropagation();
    if (tool === 'route') return;
    setSelection({ type: 'route', id });
  };

  const onSvgPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const sp = localPoint(e.clientX, e.clientY);
    const world = screenToWorld(sp, view);
    setCursor(world);
    const drag = dragRef.current;
    if (!drag) return;

    if (drag.type === 'pan') {
      const dx = sp.x - drag.lastSp.x;
      const dy = sp.y - drag.lastSp.y;
      if (dx === 0 && dy === 0) return;
      drag.lastSp = sp;
      drag.moved = true;
      setView((v) => ({ ...v, panX: v.panX + dx, panY: v.panY + dy }));
      return;
    }

    const obj = room.objects.find((o) => o.id === drag.id);
    if (!obj) return;
    const target = placeObjectPoint(obj.kind, snapPoint({ x: world.x - drag.grab.x, y: world.y - drag.grab.y }), room);
    drag.moved = drag.moved || Math.abs(target.x - obj.x) > 1e-6 || Math.abs(target.y - obj.y) > 1e-6;
    const next = { id: obj.id, x: target.x, y: target.y };
    previewRef.current = next;
    setPreview(next);
  };

  const endDrag = (e: ReactPointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    try {
      svgRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* zaten bo‘shatilgan */
    }
    if (drag?.type === 'object') {
      const p = previewRef.current;
      previewRef.current = null;
      setPreview(null);
      if (drag.moved && p && p.id === drag.id) {
        commit({
          objects: room.objects.map((o) => (o.id === p.id ? { ...o, x: round(p.x, 3), y: round(p.y, 3) } : o)),
          routes: room.routes,
        });
      }
    }
  };

  const onSvgDoubleClick = () => {
    if (tool === 'route') finishRoute();
  };

  /* ---------- Klaviatura ---------- */
  const keyHandler = (e: KeyboardEvent) => {
    if (isTypingTarget(e.target)) return;
    const key = e.key.toLowerCase();
    const mod = e.ctrlKey || e.metaKey;

    if (e.code === 'Space') {
      spaceRef.current = true;
      e.preventDefault();
      return;
    }
    if (mod && key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
      return;
    }
    if (mod && (key === 'y' || (key === 'z' && e.shiftKey))) {
      e.preventDefault();
      redo();
      return;
    }
    if (mod && key === 'd') {
      e.preventDefault();
      duplicateSelected();
      return;
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selection) {
        e.preventDefault();
        deleteSelected();
      }
      return;
    }
    if (key === 'r' && !mod) {
      rotateSelected();
      return;
    }
    if (e.key === 'Enter' && tool === 'route') {
      finishRoute();
      return;
    }
    if (e.key === 'Escape') {
      if (routeDraft.length > 0) cancelRoute();
      else if (tool !== 'select') setTool('select');
      else setSelection(null);
      return;
    }
    if (e.key === '+' || e.key === '=') {
      touchedViewRef.current = true;
      setView((v) => zoomAt(v, 1.2, { x: width / 2, y: H / 2 }));
    }
    if (e.key === '-') {
      touchedViewRef.current = true;
      setView((v) => zoomAt(v, 1 / 1.2, { x: width / 2, y: H / 2 }));
    }
  };
  const keyHandlerRef = useRef(keyHandler);
  keyHandlerRef.current = keyHandler;

  useEffect(() => {
    const down = (e: KeyboardEvent) => keyHandlerRef.current(e);
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') spaceRef.current = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  /* ---------- Chizish ---------- */
  const handlers: PlanHandlers = { onObjectDown, onRouteDown };

  const cursorClass =
    tool === 'pan' || spaceRef.current ? 'cursor-grab' : tool === 'place' || tool === 'route' ? 'cursor-crosshair' : 'cursor-default';

  const hint =
    tool === 'place'
      ? `Joylashtirish: ${OBJECT_CATALOG[placeKind].label.toLowerCase()} uchun xonada joyni bosing.`
      : tool === 'route'
        ? 'Kabel yo‘li: nuqtalarni bosing. Enter yoki ikki marta bosish — tugatish, Esc — bekor qilish.'
        : tool === 'pan'
          ? 'Ekranni surish: sichqoncha yoki barmoq bilan suring.'
          : 'Jihozni bosing va suring. Bo‘sh joyni surib ekranni siljiting, g‘ildirak bilan zoom qiling.';

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <Toolbar2D
          tool={tool}
          onTool={(t) => {
            setTool(t);
            if (t !== 'route') setRouteDraft([]);
          }}
          placeKind={placeKind}
          onPlaceKind={(k) => {
            setPlaceKind(k);
            setTool('place');
          }}
          canUndo={historyCounts.past > 0}
          canRedo={historyCounts.future > 0}
          onUndo={undo}
          onRedo={redo}
          canEditSelection={Boolean(selectedObject || selectedRoute)}
          canDuplicate={Boolean(selectedObject)}
          canRotate={Boolean(selectedObject)}
          onDelete={deleteSelected}
          onDuplicate={duplicateSelected}
          onRotate={rotateSelected}
          routeCount={routeDraft.length}
          onFinishRoute={finishRoute}
          onCancelRoute={cancelRoute}
          onZoomIn={() => {
            touchedViewRef.current = true;
            setView((v) => zoomAt(v, 1.2, { x: width / 2, y: H / 2 }));
          }}
          onZoomOut={() => {
            touchedViewRef.current = true;
            setView((v) => zoomAt(v, 1 / 1.2, { x: width / 2, y: H / 2 }));
          }}
          onFit={fitNow}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid((v) => !v)}
          showLabels={showLabels}
          onToggleLabels={() => setShowLabels((v) => !v)}
        />

        <div ref={containerRef} className="relative w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]">
          <svg
            ref={svgRef}
            width={width}
            height={H}
            viewBox={`0 0 ${width} ${H}`}
            role="application"
            aria-label="Xona chizmasi. Jihozlarni tanlash, sudrash va joylashtirish mumkin."
            className={`block touch-none select-none ${cursorClass}`}
            onPointerDown={onSvgPointerDown}
            onPointerMove={onSvgPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onPointerLeave={() => setCursor(null)}
            onDoubleClick={onSvgDoubleClick}
          >
            <rect x={0} y={0} width={width} height={H} style={{ fill: 'var(--surface-muted)' }} />
            {showGrid && <GridLayer view={view} width={width} height={H} offset={{ x: 0, y: 0 }} palette={LIVE_PALETTE} />}
            <RoomShell room={room} view={view} offset={{ x: 0, y: 0 }} palette={LIVE_PALETTE} showLabels={showLabels} />
            <RouteLayer
              routes={room.routes}
              view={view}
              offset={{ x: 0, y: 0 }}
              palette={LIVE_PALETTE}
              selectedId={selection?.type === 'route' ? selection.id : null}
              showLabels={showLabels}
              handlers={handlers}
            />
            {room.objects.map((o) => (
              <ObjectSymbol
                key={o.id}
                obj={o}
                view={view}
                offset={{ x: 0, y: 0 }}
                palette={LIVE_PALETTE}
                selected={selection?.type === 'object' && selection.id === o.id}
                showLabel={showLabels}
                position={preview && preview.id === o.id ? { x: preview.x, y: preview.y } : undefined}
                handlers={handlers}
              />
            ))}
            <RouteDraft points={routeDraft} view={view} offset={{ x: 0, y: 0 }} palette={LIVE_PALETTE} />
          </svg>
          <div className="pointer-events-none absolute bottom-2 left-2 flex flex-wrap gap-2 text-[11px] text-[var(--text-muted)]">
            <span className="rounded-md bg-[var(--surface)]/90 px-2 py-1">Masshtab: 1 m = {Math.round(view.scale)} px</span>
            {cursor && (
              <span className="rounded-md bg-[var(--surface)]/90 px-2 py-1">
                x {round(cursor.x)} m · y {round(cursor.y)} m
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)]" aria-live="polite">
          {hint}
          {selectedRoute && ` Tanlangan kabel yo‘li uzunligi: ${round(polylineLength(selectedRoute.points))} m.`}
        </p>
      </div>

      <ElectricalPanel
        room={room}
        selectedObject={selectedObject}
        selectedRoute={selectedRoute}
        onSelect={(s) => setSelection(s)}
        onSaveObject={(id, patch) => {
          commit({
            objects: room.objects.map((o) => (o.id === id ? { ...o, ...patch } : o)),
            routes: room.routes,
          });
        }}
        onSaveRoute={(id, patch) => {
          commit({
            objects: room.objects,
            routes: room.routes.map((r) => (r.id === id ? { ...r, ...patch } : r)),
          });
        }}
      />
    </div>
  );
}

function dedupe(points: Point[]): Point[] {
  const out: Point[] = [];
  for (const p of points) {
    const last = out[out.length - 1];
    if (!last || Math.abs(last.x - p.x) > 1e-6 || Math.abs(last.y - p.y) > 1e-6) out.push(p);
  }
  return out;
}
